interface DataPoint {
    readonly endpoint: string;
    readonly success: boolean;
    readonly count: number;
}

interface Endpoint {
    readonly name: string;
    readonly baseline: number;
}

const endpoints: readonly Endpoint[] = [
    { name: "processWidgets", baseline: 100 },
    { name: "embiggenProduction", baseline: 30 },
    { name: "frobnicateGears", baseline: 20 },
    { name: "adjustObnix", baseline: 0.7 },
    { name: "releaseFadoodle", baseline: 0.7 },
    { name: "mollifyRannygazoo", baseline: 0.8 },
];

const surgeProbability = 0.1;
const surgeMultiplier = 4;
const errorRatio = 0.1;

export function makeDummyData(): readonly DataPoint[] {
    const isSurge = Math.random() <= surgeProbability;
    const multiplier = isSurge ? surgeMultiplier : 1;

    function makeCount(baseline: number, success: boolean) {
        baseline *= multiplier;
        if (!success) {
            baseline *= errorRatio;
        }

        // a random number between [0.5*baseline, 1.5*baseline]
        const n = Math.random() * baseline + baseline / 2;
        return Math.floor(n);
    }

    const dataPoints: DataPoint[] = [];
    for (const e of endpoints) {
        const s = makeCount(e.baseline, true);
        if (s > 0) {
            dataPoints.push({ endpoint: e.name, count: s, success: true });
        }

        const f = makeCount(e.baseline, false);
        if (f > 0) {
            dataPoints.push({ endpoint: e.name, count: f, success: false });
        }
    }

    return dataPoints;
}
