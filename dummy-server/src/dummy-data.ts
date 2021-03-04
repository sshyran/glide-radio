import { DefaultMap } from "@glideapps/ts-necessities";
import * as readline from "readline";

interface DataPoint {
    readonly endpoint: string;
    readonly success: boolean;
    readonly count: number;
}

interface Endpoint {
    readonly name: string;
    readonly baseline: number;
    // [success, error]
    readonly keys: [string, string];
}

const endpoints: readonly Endpoint[] = [
    { name: "processWidgets", baseline: 100, keys: ["q", "Q"] },
    { name: "embiggenProduction", baseline: 30, keys: ["w", "W"] },
    { name: "frobnicateGears", baseline: 20, keys: ["e", "E"] },
    { name: "adjustObnix", baseline: 0.7, keys: ["r", "R"] },
    { name: "releaseFadoodle", baseline: 0.7, keys: ["t", "T"] },
    { name: "mollifyRannygazoo", baseline: 0.8, keys: ["y", "Y"] },
];

const surgeProbability = 0.1;
const surgeMultiplier = 4;
const errorRatio = 0.1;

let scale = 1;

const keyboardSuccesses = new DefaultMap<string, number>(() => 0);
const keyboardErrors = new DefaultMap<string, number>(() => 0);

export function makeDummyData(): readonly DataPoint[] {
    const isSurge = Math.random() <= surgeProbability;
    const multiplier = isSurge ? surgeMultiplier : 1;

    function makeCount({ name, baseline }: Endpoint, success: boolean) {
        baseline *= multiplier * scale;
        if (!success) {
            baseline *= errorRatio;
        }

        // a random number between [0.5*baseline, 1.5*baseline]
        let n = Math.random() * baseline + baseline / 2;
        n += (success ? keyboardSuccesses : keyboardErrors).get(name);
        n = Math.floor(n);
        return n;
    }

    const dataPoints: DataPoint[] = [];
    for (const e of endpoints) {
        const s = makeCount(e, true);
        if (s > 0) {
            dataPoints.push({ endpoint: e.name, count: s, success: true });
        }

        const f = makeCount(e, false);
        if (f > 0) {
            dataPoints.push({ endpoint: e.name, count: f, success: false });
        }
    }

    keyboardSuccesses.clear();
    keyboardErrors.clear();

    return dataPoints;
}

function printHelp(withHelpKey: boolean): void {
    console.log();
    console.log("Keys:");
    console.log();
    console.log("    +/- to increase/decrease load");
    console.log();
    for (const {
        name,
        keys: [ks, ke],
    } of endpoints) {
        console.log(`    ${ks}/${ke} to add ${name} success/error`);
    }
    console.log();

    if (withHelpKey) {
        console.log("    ? to print key bindings again");
        console.log();
    }
}

export function initKeyboardInput(): void {
    readline.emitKeypressEvents(process.stdin);

    process.stdin.setRawMode(true);
    process.stdin.on("keypress", (str: string, key) => {
        if (key.ctrl && key.name === "c") {
            return process.exit();
        }

        if (str === "?") {
            printHelp(false);
        } else if (str === "+") {
            scale *= 1.1;
            console.log("scale", scale);
        } else if (str === "-") {
            scale /= 1.1;
            console.log("scale", scale);
        } else {
            for (const { name, keys } of endpoints) {
                if (str === keys[0]) {
                    keyboardSuccesses.update(name, x => x + 1);
                    console.log("🎉", name);
                } else if (str === keys[1]) {
                    keyboardErrors.update(name, x => x + 1);
                    console.log("😭", name);
                }
            }
        }

        return;
    });

    printHelp(true);
}
