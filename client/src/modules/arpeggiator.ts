import _ from "lodash";
import * as Tone from "tone";

import { StatSnapshot } from "../stats";
import { randomItem, scale } from "../utils";
import { getMajorPentatonicScale, getRootForOffset } from "./melody";
import { Module, PlaySettings } from "./types";

function randomNote(semitoneOffset: number): string {
    const root = getRootForOffset(semitoneOffset);
    const scale = getMajorPentatonicScale(root, 3);
    return randomItem(scale);
}

export class ArpeggiatorModule implements Module {
    public readonly name = "Pulse (Load)";
    public readonly meter: Tone.Meter;
    public readonly volume: Tone.Volume;

    private readonly filter: Tone.Filter;
    private readonly pentatonicSynth: Tone.MonoSynth;
    private lastNote: string | undefined;

    constructor(volume: number) {
        this.filter = new Tone.Filter(100, "bandpass", -12);
        this.meter = new Tone.Meter();
        this.volume = new Tone.Volume(volume).connect(this.meter);

        this.pentatonicSynth = new Tone.MonoSynth({
            oscillator: {
                type: "triangle",
            },
            envelope: {
                attack: 0.01,
            },
        }).chain(this.filter, this.volume, Tone.Destination);
    }

    public play(
        _snapshot: StatSnapshot,
        time: number,
        {
            scalePerDimension,
            semitoneOffset,
            numMainTones,
            mainSpacing,
        }: PlaySettings
    ): void {
        const getRandomNote = () => {
            let note = randomNote(semitoneOffset);
            while (note === this.lastNote) {
                note = randomNote(semitoneOffset);
            }
            this.lastNote = note;

            // TODO: handle errors?
            return note;
        };

        const newFreq = scale(
            scalePerDimension,
            { min: 1, max: 4 },
            { min: 100, max: 4000 }
        );

        this.filter.frequency.rampTo(newFreq, _.random(1.0, 3.0));

        const steps = _.range(numMainTones).map((i) => ({
            time: i * mainSpacing,
            duration: mainSpacing / 2,
            note: getRandomNote(),
        }));

        new Tone.Part((time, value) => {
            this.pentatonicSynth.triggerAttackRelease(
                value.note,
                value.duration,
                time
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
