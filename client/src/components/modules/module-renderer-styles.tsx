import styled from "styled-components";

export const ModuleRendererContainer = styled.div<{ enabled: boolean }>`
    position: relative;
    height: 24px;
    display: flex;
    align-items: center;
    cursor: pointer;
    padding-top: 4px;

    .checkmark {
        border-radius: 100%;
        border: 1px solid #ffffff;
        height: 14px;
        width: 14px;
        background-color: ${(p) => (p.enabled ? "#ffffff" : "transparent")};
    }

    .module-name {
        padding-left: 14px;
        width: 180px;
    }
`;
