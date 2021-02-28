import { assert } from "@glideapps/ts-necessities";

export class Queue<T> {
    private size: number;
    private store: T[] = [];

    constructor(size: number) {
        this.size = size;
    }

    enqueue(val: T) {
        // If the store length is full,
        // dequeue 1 to ensure the size is maintained
        if (this.store.length === this.size) {
            this.store.shift();
        }
        this.store.push(val);
    }

    dequeue(): T | undefined {
        return this.store.shift();
    }

    print() {
        console.log(this.store);
    }
}

interface Stat {
    endpoint: string;
    success: boolean;
    count: number;
}

interface Aggregates {
    oks: number;
    errors: number;
}

export interface StatSnapshot {
    dateTimeUnixMS: number;
    data: Stat[];
    aggregates: Aggregates;
}

export function getFailureStats(data: readonly Stat[]): Stat[] {
    return data.filter((d) => !d.success);
}

export async function fetchStats(
    serverURL: string,
    password: string
): Promise<Stat[] | undefined> {
    try {
        const response = await fetch(serverURL, {
            method: "POST",
            headers: { Authorization: `Basic ${btoa(`glide:${password}`)}` },
        });
        if (!response.ok) {
            console.error("request failed", response.statusText);
            return;
        }

        return (await response.json()) as Stat[];
    } catch (e) {
        console.error("error fetching stats", e);
    }
}

export class Stats {
    private timerID?: number;
    private queue: Queue<StatSnapshot>;
    private lastSnapshot: StatSnapshot | undefined;
    private override: Partial<Aggregates> = {};

    constructor(
        private readonly serverURL: string,
        private readonly password: string,
        private readonly loopTime: number,
        private readonly onUpdate: (s: StatSnapshot) => void
    ) {
        this.queue = new Queue(2);
        this.loopTime = loopTime;
    }

    private notifyOnUpdate(): StatSnapshot {
        assert(this.lastSnapshot !== undefined);

        const snap = {
            ...this.lastSnapshot,
            aggregates: { ...this.lastSnapshot.aggregates, ...this.override },
        };
        this.onUpdate(snap);
        return snap;
    }

    public increaseOKs(): void {
        if (this.lastSnapshot === undefined) return;
        this.override.oks =
            (this.override.oks ?? this.lastSnapshot.aggregates.oks) * 2;
        this.notifyOnUpdate();
    }

    public decreaseOKs(): void {
        if (this.lastSnapshot === undefined) return;
        this.override.oks =
            (this.override.oks ?? this.lastSnapshot.aggregates.oks) / 2;
        this.notifyOnUpdate();
    }

    public increaseErrors(): void {
        if (this.lastSnapshot === undefined) return;
        this.override.errors =
            (this.override.errors ?? this.lastSnapshot.aggregates.errors) * 2;
        this.notifyOnUpdate();
    }

    public decreaseErrors(): void {
        if (this.lastSnapshot === undefined) return;
        this.override.errors =
            (this.override.errors ?? this.lastSnapshot.aggregates.errors) / 2;
        this.notifyOnUpdate();
    }

    private getStats = async () => {
        const data = await fetchStats(this.serverURL, this.password);
        if (data === undefined) return;

        const oks = data
            .filter((d) => d.success)
            .map((s) => s.count)
            .reduce((p, n) => p + n, 0);

        const errors = data
            .filter((d) => !d.success)
            .map((s) => s.count)
            .reduce((p, n) => p + n, 0);

        // FIXME: Should this be sent from the backend
        const now = Date.now();
        const snapshot = {
            dateTimeUnixMS: now,
            data,
            aggregates: { oks, errors },
        };

        this.queue.enqueue(snapshot);
    };

    async startRequestLoop() {
        this.timerID = window.setInterval(this.getStats, this.loopTime);
    }

    stopRequestLoop() {
        if (this.timerID === undefined) return;
        window.clearInterval(this.timerID);
    }

    public getSnapshot(): StatSnapshot {
        let snap = this.queue.dequeue();
        if (snap === undefined) {
            snap = {
                dateTimeUnixMS: 0,
                data: [],
                aggregates: { oks: 0, errors: 0 },
            };
        }

        this.lastSnapshot = snap;
        return this.notifyOnUpdate();
    }
}
