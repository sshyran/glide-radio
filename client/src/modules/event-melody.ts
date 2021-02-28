import _ from "lodash";
import * as Tone from "tone";
import { Note } from "@tonaljs/tonal";

import { getNameForEvent, GlobalConfig } from "../config";
import { StatSnapshot } from "../stats";
import { getRootForOffset, getScaledMelody } from "./melody";
import { Logger, Module, PlaySettings } from "./types";

interface Config {
    readonly melodies: Record<string, readonly string[] | false>;
    readonly defaultSuccessMelody: readonly string[];
    readonly defaultErrorMelody: readonly string[];
    readonly ignoreSuccesses: Record<string, boolean>;
}

export class EventMelodyModule implements Module {
    public readonly name = "Melody (Events)";
    public readonly meter: Tone.Meter;

    private readonly volume: Tone.Volume;
    private readonly melodySynth: Tone.MonoSynth;
    private readonly dissonantSynth: Tone.MonoSynth;
    private readonly melodyReverb: Tone.Reverb;

    constructor(
        volume: number,
        private readonly config: GlobalConfig,
        private readonly logger: Logger
    ) {
        this.meter = new Tone.Meter();
        this.volume = new Tone.Volume(volume).connect(this.meter);

        this.melodyReverb = new Tone.Reverb();

        this.melodySynth = new Tone.MonoSynth({
            oscillator: {
                type: "sine",
            },
            envelope: {
                attack: 0.01,
                release: 0.01,
            },
            volume: -10,
        }).chain(this.melodyReverb, this.volume, Tone.Destination);

        this.dissonantSynth = new Tone.MonoSynth({
            oscillator: {
                type: "sine",
            },
            envelope: {
                attack: 0.01,
                release: 0.01,
            },
            volume: -10,
        }).chain(this.melodyReverb, this.volume, Tone.Destination);
    }

    public play(
        snapshot: StatSnapshot,
        time: number,
        { mainSpacing, semitoneOffset }: PlaySettings
    ): void {
        const { counts } = this.config;
        const config = this.config.eventMelodies as Config;

        const sorted = _.sortBy(
            snapshot.data
                .map((s) => {
                    const { endpoint, success } = s;
                    const count =
                        (success
                            ? counts.expectedSuccesses[endpoint] ??
                              counts.defaultExpectedSuccesses
                            : counts.expectedErrors[endpoint] ??
                              counts.defaultExpectedErrors) / s.count;
                    return { endpoint, success, count };
                })
                .filter((s) => {
                    if (s.success && config.ignoreSuccesses[s.endpoint])
                        return false;
                    if (s.success && config.melodies[s.endpoint] === false) {
                        return false;
                    }
                    const threshold = s.success
                        ? counts.notableSuccessThreshold
                        : counts.notableErrorThreshold;
                    return s.count < threshold;
                }),
            (s) => s.count
        );

        const pick =
            sorted.find((s) => !s.success) ?? sorted.find((s) => s.success);
        if (pick === undefined) return;

        this.logger.log(
            (pick.success ? "🎉 " : "😭 ") +
                getNameForEvent(pick.endpoint, this.config)
        );

        let melody = config.melodies[pick.endpoint];
        if (melody === undefined || melody === false) {
            melody = pick.success
                ? config.defaultSuccessMelody
                : config.defaultErrorMelody;
        }

        const scaledMelody = getScaledMelody(
            getRootForOffset(semitoneOffset),
            melody
        );
        new Tone.Part(
            (time, value) => {
                this.melodySynth.triggerAttackRelease(
                    value.note,
                    1.25 / scaledMelody.length,
                    time
                );
                if (!pick.success) {
                    const dissonantNote = Note.transpose(value.note, "2m");
                    this.dissonantSynth.triggerAttackRelease(
                        dissonantNote,
                        mainSpacing / 5,
                        time + mainSpacing / 15
                    );
                }
            },
            scaledMelody.map((n, i) => ({
                time: i * (1.25 / scaledMelody.length),
                note: n,
            }))
        ).start(time);
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
