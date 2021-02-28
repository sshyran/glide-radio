import { NowRequest, NowResponse } from "@vercel/node";

import fetch from "node-fetch";

function setCORSHeaders(response: NowResponse): void {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    response.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type,Authorization"
    );
    response.setHeader("Access-Control-Max-Age", "3600");
}

const f = async (_request: NowRequest, response: NowResponse) => {
    setCORSHeaders(response);

    const res = await fetch("http://35.239.113.137:3141/public", {
        method: "POST",
    });

    if (!res.ok) {
        response.status(500).send({});
    } else {
        const body = await res.json();
        response.status(200).send(body);
    }
};

export default f;
