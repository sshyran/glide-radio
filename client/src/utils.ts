import { defined } from "@glideapps/ts-necessities";
import _ from "lodash";

export function randomItem<T>(choices: readonly T[]): T {
    return defined(_.sample(choices));
}

// This is inefficient
export function randomItems<T>(
    choices: readonly T[],
    count: number
): readonly T[] {
    if (count >= choices.length) return choices;

    const leftOverIndexes = _.range(choices.length);
    const pickIndexes: number[] = [];
    for (let i = 0; i < count; i++) {
        const idx = randomItem(leftOverIndexes);
        pickIndexes.push(idx);
        _.remove(leftOverIndexes, (x) => x === idx);
    }
    pickIndexes.sort((a, b) => a - b);
    return pickIndexes.map((i) => defined(choices[i]));
}

export function clamp(val: number, min: number, max: number) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
}

interface Range {
    min: number;
    max: number;
}
export function scale(value: number, inRange: Range, outRange: Range): number {
    const { min: inMin, max: inMax } = inRange;
    const { min: outMin, max: outMax } = outRange;

    const clamped = clamp(value, inMin, inMax);

    const percent = (clamped - inMin) / (inMax - inMin);
    return percent * (outMax - outMin) + outMin;
}

export function roundToNearestMultiple(value: number, multiple: number) {
    return Math.round(value / multiple) * multiple;
}

export function roundUpToMultiple(value: number, multiple: number) {
    return Math.ceil(value / multiple) * multiple;
}
