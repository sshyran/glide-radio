import { assert, defined } from "@glideapps/ts-necessities";
import { Scale } from "@tonaljs/tonal";

type Root =
    | "C"
    | "C#"
    | "D"
    | "Eb"
    | "E"
    | "F"
    | "F#"
    | "G"
    | "Ab"
    | "A"
    | "Bb"
    | "B";

const semitoneOffsetToRoot: { [index: number]: Root } = {
    0: "C",
    1: "C#",
    2: "D",
    3: "Eb",
    4: "E",
    5: "F",
    6: "F#",
    7: "G",
    8: "Ab",
    9: "A",
    10: "Bb",
    11: "B",
};

// Note: This function will return intervals and octave information
// for a scale in Cmaj. this will allow us to write melodies in Cmaj
// but to also be able to scale it with pitch changes
export function getScaledMelody(
    root: Root,
    melodyInCMaj: readonly string[]
): readonly string[] {
    const scale = getMajorScale("C");

    // Get notes without octaves
    const parsedNotes = melodyInCMaj.map((n) => n.slice(0, n.length - 1));

    // Get the octaves
    const parsedOctaves = melodyInCMaj.map((n) =>
        Number(n.slice(n.length - 1, n.length))
    );

    const intervals = parsedNotes.map((pn) => scale.indexOf(pn));

    // Get the scale for the root
    const scaledScale = getMajorScale(root);

    // Get notes for root scale from intervals
    const newNotes = intervals.map((i) => scaledScale[i]);

    // Apply the parsed octaves
    const scaledNotesWithOctaves = newNotes.map(
        (nn, i) => `${nn}${parsedOctaves[i]}`
    );
    return scaledNotesWithOctaves;
}

export function getRootForOffset(semitoneOffset: number) {
    assert(semitoneOffset >= 0 && semitoneOffset < 12);
    return defined(semitoneOffsetToRoot[semitoneOffset]);
}

export function getMajorScale(root: Root, octave?: number): string[] {
    const name =
        octave !== undefined ? `${root}${octave} major` : `${root} major`;
    return Scale.get(name).notes;
}

export function getMajorPentatonicScale(root: Root, octave: number): string[] {
    const name = `${root}${octave} major pentatonic`;
    return Scale.get(name).notes;
}

export const chords = [
    ["C3", "E3", "G3"],
    ["D3", "F3", "A3"],
    ["F3", "A3", "C4"],
    ["G3", "B3", "D3"],
    ["A3", "C3", "E3"],
];
