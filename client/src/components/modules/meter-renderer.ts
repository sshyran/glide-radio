import * as Tone from "tone";
import { scale } from "../../utils";

export class MeterRenderer {
    private animationID: number | null;
    private readonly ctx: CanvasRenderingContext2D | null;
    private readonly meter: Tone.Meter;

    private containerWidth: number;
    private containerHeight: number;

    constructor(canvas: HTMLCanvasElement, meter: Tone.Meter) {
        this.animationID = null;

        this.ctx = canvas.getContext("2d");
        this.meter = meter;
        this.containerWidth = canvas.width;
        this.containerHeight = canvas.height;
    }

    public startDrawing = () => {
        if (this.ctx === null) return;
        // if (this.meters[0] === undefined) return;
        this.ctx.clearRect(0, 0, this.containerWidth, this.containerHeight);
        this.ctx.fillStyle = "#00FF00";

        const value = this.meter.getValue();

        if (typeof value === "number") {
            // mono
            const clamped = scale(
                value,
                { min: -70, max: 0 },
                { min: 0, max: this.containerWidth }
            );

            this.ctx.fillRect(0, 0, clamped, this.containerHeight);
        } else if (Array.isArray(value) && value.length === 2) {
            // stereo
            const lClamped = scale(
                value[0] ?? -70,
                { min: -70, max: 0 },
                { min: 0, max: this.containerWidth }
            );
            const rClamped = scale(
                value[1] ?? -70,
                { min: -70, max: 0 },
                { min: 0, max: this.containerWidth }
            );
            this.ctx.fillRect(0, 0, lClamped, this.containerHeight);
            this.ctx.fillRect(5, 0, rClamped, this.containerHeight);
        }

        this.animationID = window.requestAnimationFrame(this.startDrawing);
    };

    public stopDrawing = () => {
        if (this.animationID === null) return;
        window.cancelAnimationFrame(this.animationID);
    };
}
