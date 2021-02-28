import * as fs from "fs";
import express, { Request, Response } from "express";
import { defined } from "@glideapps/ts-necessities";

import { runIngress } from "./ingress";
import { Multiplexer, ProdCounter, UncensoredCounter } from "./data";

interface Config {
    readonly username: string;
    readonly password: string;
    readonly port: number;
}

const config = JSON.parse(fs.readFileSync("config.json", "utf-8")) as Config;

// staging: 5 minutes
const stagingCounter = new UncensoredCounter(5 * 60 * 1000);
runIngress(1234, stagingCounter);

// prod: 5 seconds
const prodCounter = new UncensoredCounter(5 * 1000);
const publicCounter = new ProdCounter(5 * 1000);
runIngress(1235, new Multiplexer([prodCounter, publicCounter]));

const app = express();

function setCORSHeaders(response: Response): void {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    response.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
    response.set("Access-Control-Max-Age", "3600");
}

function isAuthorized(req: Request): boolean {
    const header = req.get("Authorization");
    if (header === undefined) return false;
    const parts = header.split(" ");
    if (parts.length !== 2 || parts[0] !== "Basic") return false;
    const buf = new Buffer(defined(parts[1]), "base64");
    const text = buf.toString("utf-8");
    return text === `${config.username}:${config.password}`;
}

function handleAuth(req: Request, res: Response): boolean {
    if (isAuthorized(req)) return true;
    res.set("WWW-Authenticate", 'Basic realm="User Visible Realm", charset="UTF-8"');
    res.sendStatus(401);
    return false;
}

function sendOptionsResponse(_req: Request, res: Response): void {
    setCORSHeaders(res);
    res.sendStatus(200);
}

app.options("/staging", sendOptionsResponse);
app.options("/prod", sendOptionsResponse);
app.options("/public", sendOptionsResponse);

app.post("/staging", (req, res) => {
    setCORSHeaders(res);

    if (!handleAuth(req, res)) return;

    res.json(stagingCounter.getSummary());
});

app.post("/prod", (req, res) => {
    setCORSHeaders(res);

    if (!handleAuth(req, res)) return;

    res.json(prodCounter.getSummary());
});

app.post("/public", (_req, res) => {
    setCORSHeaders(res);

    // This is public, so we're not doing auth here.

    res.json(publicCounter.getSummary());
});

// FIXME: How do we handle a listen error?
app.listen(config.port, () => {
    return console.log(`server is listening on ${config.port}`);
});
