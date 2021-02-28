import { defined } from "@glideapps/ts-necessities";
import _ from "lodash";
import * as Tone from "tone";
import { getNameForEvent, GlobalConfig } from "../config";

import { StatSnapshot } from "../stats";
import { randomItem } from "../utils";
import { Logger, Module, PlaySettings } from "./types";

interface Config {
    readonly samples: Record<string, [string, number]>;
}

export class EventOneShotModule implements Module {
    public readonly name = "One Shot (Events)";
    public readonly meter: Tone.Meter;

    private readonly volume: Tone.Volume;
    private readonly players: Record<string, Tone.Player> = {};

    constructor(
        volume: number,
        private readonly globalConfig: GlobalConfig,
        private readonly logger: Logger
    ) {
        const config = globalConfig.eventSamples as Config;

        this.meter = new Tone.Meter();
        this.volume = new Tone.Volume(volume).connect(this.meter);

        for (const [url] of _.values(config.samples)) {
            const p = new Tone.Player(url).chain(this.volume, Tone.Destination);
            p.volume.value = -10;
            this.players[url] = p;
        }
    }

    public play(
        snapshot: StatSnapshot,
        time: number,
        { loopLength }: PlaySettings
    ): void {
        const { counts } = this.globalConfig;
        const config = this.globalConfig.eventSamples as Config;

        const applicable = snapshot.data.filter(
            (s) => s.success && config.samples[s.endpoint] !== undefined
        );
        if (applicable.length === 0) return;
        const sorted = _.sortBy(
            applicable,
            (s) =>
                counts.expectedSuccesses[s.endpoint] ??
                counts.defaultExpectedSuccesses
        );
        const { endpoint } = defined(sorted[0]);

        this.logger.log(`🔊 ${getNameForEvent(endpoint, this.globalConfig)}`);

        const [url, beatOffset] = defined(config.samples[endpoint]);
        const p = defined(this.players[url]);
        const start = (loopLength / 4) * randomItem([1, 2, 3]);
        p.start(time + start - beatOffset);
    }

    public isMuted(): boolean {
        return this.volume.mute;
    }

    public mute(): void {
        this.volume.mute = true;
    }

    public unMute(): void {
        this.volume.mute = false;
    }
}
