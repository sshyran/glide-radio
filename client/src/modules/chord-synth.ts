import { defined } from "@glideapps/ts-necessities";
import _ from "lodash";
import * as Tone from "tone";

import { StatSnapshot } from "../stats";
import { randomItem } from "../utils";
import { chords, getRootForOffset, getScaledMelody } from "./melody";
import { Module, PlaySettings } from "./types";

export class ChordSynthBackgroundModule implements Module {
    public readonly name = "Chord synth (random)";
    public readonly meter: Tone.Meter;

    private readonly volume: Tone.Volume;
    private readonly chordSynths: readonly Tone.MonoSynth[];

    constructor(volume: number) {
        this.meter = new Tone.Meter();
        this.volume = new Tone.Volume(volume).connect(this.meter);

        this.chordSynths = [1, 2, 3].map(() =>
            new Tone.MonoSynth({
                oscillator: { type: "sine" },
                envelope: {
                    attack: 0.1,
                    decay: 1,
                },
            }).chain(this.volume, Tone.Destination)
        );
    }

    public play(
        _snapshot: StatSnapshot,
        time: number,
        { loopLength, semitoneOffset }: PlaySettings
    ): void {
        const chord = getScaledMelody(
            getRootForOffset(semitoneOffset),
            randomItem(chords)
        );
        for (const [n, s] of _.zip(chord, this.chordSynths)) {
            defined(s).triggerAttackRelease(defined(n), loopLength, time);
        }
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
