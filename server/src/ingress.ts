import * as dgram from "dgram";

import { DataReceiver } from "./data";

export function runIngress(port: number, counter: DataReceiver): void {
    // creating a udp server
    const server = dgram.createSocket("udp4");

    // emits when any error occurs
    server.on("error", function (error) {
        console.log("Error: " + error);
        server.close();
    });

    // emits on new datagram msg
    server.on("message", function (msg, _info) {
        try {
            const str = msg.toString("utf8");
            // console.log("Received %d bytes from %s:%d: %s", msg.length, info.address, info.port, str);
            const json = JSON.parse(str);
            const endpoint = json.endpoint;
            const duration = json.duration_ms;
            const status = json["app.result.status"];
            if (typeof endpoint !== "string" || typeof duration !== "number" || typeof status !== "string") {
                console.error("Invalid data", endpoint, duration, status);
                return;
            }
            const success = status === "ok";

            counter.addDataPoint({ endpoint, duration, success });
        } catch (e) {}
    });

    //emits when socket is ready and listening for datagram msgs
    server.on("listening", function () {
        const address = server.address();
        const port = address.port;
        const family = address.family;
        const ipaddr = address.address;
        console.log("Server is listening at port " + port);
        console.log("Server ip :" + ipaddr);
        console.log("Server is IP4/IP6 : " + family);
    });

    //emits after the socket is closed using socket.close();
    server.on("close", function () {
        console.log("Socket is closed !");
    });

    server.bind(port);
}
