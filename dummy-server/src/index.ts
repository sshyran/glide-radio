import * as fs from "fs";
import express, { Request, Response } from "express";
import { defined } from "@glideapps/ts-necessities";

import { initKeyboardInput, makeDummyData } from "./dummy-data";

// Simple configuration from a JSON file.
interface Config {
    readonly username: string;
    readonly password: string | null;
    readonly port: number;
}

const config = JSON.parse(fs.readFileSync("config.json", "utf-8")) as Config;

const app = express();

// This checks whether the username and password is set correctly.  If the
// password in the config is `null` then don't even check.
function isAuthorized(req: Request): boolean {
    if (config.password === null) return true;

    const header = req.get("Authorization");
    if (header === undefined) return false;
    const parts = header.split(" ");
    if (parts.length !== 2 || parts[0] !== "Basic") return false;
    const buf = Buffer.from(defined(parts[1]), "base64");
    const text = buf.toString("utf-8");
    return text === `${config.username}:${config.password}`;
}

function handleAuth(req: Request, res: Response): boolean {
    if (isAuthorized(req)) return true;
    res.set("WWW-Authenticate", 'Basic realm="User Visible Realm", charset="UTF-8"');
    res.sendStatus(401);
    return false;
}

// This allows CORS wholesale.  You probably don't want to this in
// your production service.
function setCORSHeaders(response: Response): void {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    response.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
    response.set("Access-Control-Max-Age", "3600");
}

function sendOptionsResponse(_req: Request, res: Response): void {
    setCORSHeaders(res);
    res.sendStatus(200);
}

// Required for CORS.
app.options("/dummy", sendOptionsResponse);

// This is the handler for the POST request.  It has to return event
// data for the past 5 seconds.
app.post("/dummy", (req, res) => {
    setCORSHeaders(res);

    if (!handleAuth(req, res)) return;

    // TODO: This is where you need to return your actual data.
    res.json(makeDummyData());
});

app.listen(config.port, () => {
    return console.log(`server is listening on ${config.port}`);
});

initKeyboardInput();
