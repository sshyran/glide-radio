import * as Tone from "tone";

import { StatSnapshot } from "../stats";
import { Module, PlaySettings } from "./types";

export abstract class BaseModule implements Module {
    public abstract readonly name: string;

    // Every module needs this to display a meter bar in the UI.
    public readonly meter: Tone.Meter;

    // Connect to this to play sound.
    protected readonly volume: Tone.Volume;

    constructor(volume: number) {
        // Every module needs this to display a meter bar in the UI.
        this.meter = new Tone.Meter();
        // We need this to mute/unmute.
        this.volume = new Tone.Volume(volume).connect(this.meter);
    }

    public abstract play(
        snapshot: StatSnapshot,
        time: number,
        settings: PlaySettings
    ): void;

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
