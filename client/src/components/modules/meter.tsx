import * as Tone from "tone";
import { useEffect, useRef } from "react";

import { MeterRenderer } from "./meter-renderer";

interface Props {
    readonly meter: Tone.Meter;
}

function Meter(p: Props) {
    const { meter } = p;

    const canvasEl = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasEl.current === null) return;

        const meterRenderer = new MeterRenderer(canvasEl.current, meter);
        meterRenderer.startDrawing();

        return () => {
            meterRenderer.stopDrawing();
        };
    }, [meter]);

    return <canvas width={200} height={5} ref={canvasEl}></canvas>;
}

export default Meter;
