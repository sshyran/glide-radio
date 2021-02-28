import * as Tone from "tone";

import { StatSnapshot } from "../stats";

export interface PlaySettings {
    /**
     * The number of main tones within the current loop.
     * This is equal to `loopLength / mainSpacing`.
     */
    readonly numMainTones: number;
    /**
     * The length of a main tone within the current loop.
     * This is equal to `loopLength / numMainTones`.
     */
    readonly mainSpacing: number;
    /**
     * The length of the current loop.  This is equal to
     * `numMainTones * mainSpacing`.
     */
    readonly loopLength: number;

    /**
     * A non-linear indicator of how much "stuff" there is
     * going on relative to baseline.  This is between `1` and
     * `4`, inclusively.  `1` means baseline, `4` means things
     * are crazy busy.
     */
    readonly scalePerDimension: number;

    /**
     * The number of semitones above baseline that this loop
     * should be played at due to elevated load.  `playbackRate`
     * expresses the same thing differently.
     */
    readonly semitoneOffset: number;
    /**
     * How much faster samples should be played at to account
     * for tones shifting upwards due to elevated load.  `1` means
     * play back at base rate, `2` means play twice as fast.
     * `semitoneOffset` expresses the same thing differently.
     */
    readonly playbackRate: number;
}

export interface Module {
    /**
     * The display name of this module.
     */
    readonly name: string;
    /**
     * The module's meter.  This is used to display a live
     * meter in the UI.
     */
    readonly meter: Tone.Meter;

    play(snapshot: StatSnapshot, time: number, settings: PlaySettings): void;
    stop?(): void;

    isMuted(): boolean;
    mute(): void;
    unMute(): void;
}

export interface Logger {
    /**
     * Log `text` in the UI.
     */
    log(text: string): void;
}
