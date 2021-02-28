import { scale } from "./utils";

it("range", () => {
    expect(scale(10, { min: 0, max: 20 }, { min: 0, max: 3 })).toEqual(1.5);
    expect(scale(0.5, { min: 0, max: 1 }, { min: 1000, max: 2000 })).toEqual(
        1500
    );
});

it("range - out of bounds", () => {
    expect(scale(25, { min: 0, max: 20 }, { min: 0, max: 3 })).toEqual(3);
    expect(scale(-1, { min: 0, max: 20 }, { min: -1, max: 3 })).toEqual(-1);
});
