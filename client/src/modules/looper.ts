import _ from "lodash";
import * as Tone from "tone";
import { GlobalConfig } from "../config";

import { StatSnapshot } from "../stats";
import { scale } from "../utils";
import { Module, PlaySettings } from "./types";

interface Config {
    readonly url: string;
}

export class LooperModule implements Module {
    public readonly name = "Drone (Load)";
    public readonly meter: Tone.Meter;

    private readonly volume: Tone.Volume;
    private readonly player: Tone.Player;
    private readonly filter: Tone.Filter;
    private ready: boolean = false;

    constructor(volume: number, globalConfig: GlobalConfig) {
        const config = globalConfig.looperDrone as Config;

        this.meter = new Tone.Meter();
        this.volume = new Tone.Volume(volume).connect(this.meter);
        this.filter = new Tone.Filter(100, "bandpass", -12);

        const onPlayerLoaded = () => (this.ready = true);
        const onPlayerError = (e: Error) => console.error(e);
        this.player = new Tone.Player({
            url: config.url,
            onload: onPlayerLoaded,
            onerror: onPlayerError,
            fadeIn: 2.0,
            fadeOut: 1.0,
            loop: true,
        }).chain(this.filter, this.volume, Tone.Destination);
        this.player.loop = true;
    }

    public play(_snapshot: StatSnapshot, time: number, { scalePerDimension, playbackRate }: PlaySettings): void {
        // FIXME: find a new way to do this. This will overide the mute
        // const okVolume = -20 + Math.log2(scalePerDimension) * 6;

        if (!this.ready) return;
        if (this.player.state !== "started") {
            this.player.start(time);
        }

        const newFreq = scale(scalePerDimension, { min: 1, max: 4 }, { min: 100, max: 2000 });

        this.filter.frequency.rampTo(newFreq, _.random(1.0, 3.0));
        this.player.playbackRate = playbackRate;
        // this.volume.volume.value = okVolume;
    }

    public stop() {
        this.player.stop();
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
