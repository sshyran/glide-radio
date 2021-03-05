import { defined } from "@glideapps/ts-necessities";
import _ from "lodash";
import * as Tone from "tone";
import { getNameForEvent, GlobalConfig } from "../config";

import { StatSnapshot } from "../stats";
import { randomItem } from "../utils";
import { BaseModule } from "./base-module";
import { Logger, PlaySettings } from "./types";

interface Config {
    readonly samples: Record<string, [string, number]>;
}

export class EventOneShotModule extends BaseModule {
    public readonly name = "One Shot (Events)";

    private readonly players: Record<string, Tone.Player> = {};

    private ready: boolean = false;

    constructor(volume: number, private readonly globalConfig: GlobalConfig, private readonly logger: Logger) {
        super(volume);

        const config = globalConfig.eventSamples as Config;

        const sampleURLs = _.values(config.samples);

        let numToLoad = sampleURLs.length;
        const onPlayerLoaded = () => {
            --numToLoad;
            if (numToLoad <= 0) {
                this.ready = true;
            }
        };

        for (const [url] of sampleURLs) {
            const p = new Tone.Player({ url, onload: onPlayerLoaded }).chain(this.volume, Tone.Destination);
            p.volume.value = -10;
            this.players[url] = p;
        }
    }

    public play(snapshot: StatSnapshot, time: number, { loopLength }: PlaySettings): void {
        if (!this.ready) return;

        const { counts } = this.globalConfig;
        const config = this.globalConfig.eventSamples as Config;

        // Find the most notable event
        const applicable = snapshot.data.filter(s => s.success && config.samples[s.endpoint] !== undefined);
        if (applicable.length === 0) return;
        const sorted = _.sortBy(
            applicable,
            s => counts.expectedSuccesses[s.endpoint] ?? counts.defaultExpectedSuccesses
        );
        const { endpoint } = defined(sorted[0]);

        this.logger.log(`🔊 ${getNameForEvent(endpoint, this.globalConfig)}`);

        // Schedule the player to play the associated sample at a
        // random beat in the loop.
        const [url, beatOffset] = defined(config.samples[endpoint]);
        const p = defined(this.players[url]);
        const start = (loopLength / 4) * randomItem([1, 2, 3]);
        p.start(time + start - beatOffset);
    }
}
