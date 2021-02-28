import _ from "lodash";
import * as Tone from "tone";
import { GlobalConfig } from "../config";

import { StatSnapshot } from "../stats";
import { Module, PlaySettings } from "./types";

interface Config {
    readonly url: string;
}

export class GranularModule implements Module {
    public readonly name = "Granular drone";
    public readonly meter: Tone.Meter;

    public readonly volume: Tone.Volume;
    private readonly player: Tone.Player;
    private readonly grainLength: number;
    private ready: boolean;

    constructor(volume: number, globalConfig: GlobalConfig) {
        const config = globalConfig.granular as Config;

        this.grainLength = 0.07;
        this.ready = false;

        this.meter = new Tone.Meter();
        this.volume = new Tone.Volume(volume).connect(this.meter);

        const reverb = new Tone.Reverb({
            decay: 0.25,
            wet: 1.0,
        });

        const onPlayerLoaded = () => (this.ready = true);
        const onPlayerError = (e: Error) => console.error(e);
        this.player = new Tone.Player({
            url: config.url,
            onload: onPlayerLoaded,
            onerror: onPlayerError,
            fadeIn: 0.05,
            fadeOut: 0.1,
            volume: -20,
        }).chain(reverb, Tone.Destination);
    }

    public play(
        _snapshot: StatSnapshot,
        time: number,
        { scalePerDimension }: PlaySettings
    ): void {
        if (!this.ready) return;
        const bufferLengthSeconds = this.player.buffer.duration;
        const maxSteps = 5.0 / this.grainLength;

        // Scale incoming dimension to [0.25, 1.0] to set density of steps
        const downScaledDimension = scalePerDimension / 4;
        const numSteps = Math.round(downScaledDimension * maxSteps);

        const stepLength = 5.0 / numSteps;
        const steps = _.range(numSteps).map((i) => ({
            time: i * stepLength,
        }));

        new Tone.Part((time, _value) => {
            const bufferOffset = _.random(
                0,
                bufferLengthSeconds - this.grainLength
            );

            const fadeIn = _.random(0, this.grainLength / 2);
            const fadeOut = _.random(0, this.grainLength / 2);
            this.player.fadeIn = fadeIn;
            this.player.fadeOut = fadeOut;
            this.player.start(
                _.random(Math.max(time - 0.25, 0), Math.min(time + 0.25, 4.75)),
                bufferOffset,
                this.grainLength
            );
        }, steps).start(time);
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
