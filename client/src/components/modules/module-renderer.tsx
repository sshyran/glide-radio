import { useCallback, useState } from "react";

import { Module } from "../../modules/types";
import { ModuleRendererContainer } from "./module-renderer-styles";
import Meter from "./meter";

interface Props {
    module: Module;
}

function ModuleRenderer(p: Props) {
    const { module } = p;

    const [muted, setMuted] = useState(module.isMuted());

    const updateEnabled = useCallback(() => {
        if (!muted) {
            module.mute();
            setMuted(true);
        } else {
            module.unMute();
            setMuted(false);
        }
    }, [muted, module]);

    return (
        <ModuleRendererContainer enabled={!muted} onClick={updateEnabled}>
            <span className="checkmark"></span>
            <div className="module-name">{module.name}</div>
            <Meter meter={module.meter} />
        </ModuleRendererContainer>
    );
}

export default ModuleRenderer;
