import styled from "styled-components";

export const AppContainer = styled.div`
    color: #fff;
    width: 100%;
    height: 100%;
    font-family: Monaco, monospace;
    font-size: 11px;
    text-transform: uppercase;

    .feed {
        background-image: linear-gradient(
                180deg,
                rgba(0, 0, 0, 0) 50%,
                rgba(0, 0, 0, 0.2) 100%
            ),
            url("/images/sky.jpg");
        position: absolute;
        z-index: -10;
        width: 100%;
        height: 100%;
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;

        &:after {
            content: "Photo by Allan Nygren";
            position: absolute;
            bottom: 1rem;
            right: 1rem;
            color: rgba(255, 255, 255, 0.33);
            font-size: 9px;
            text-transform: initial;
        }
    }

    .content {
        display: flex;
        height: 100%;
        flex-direction: column;
        justify-content: space-between;
        padding: 4vw;
    }

    .top,
    .middle,
    .bottom {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
    }

    .middle {
        justify-content: center;
    }

    .title {
        font-family: sans-serif;
        font-size: 32px;
        font-weight: 700;
    }

    .controls {
        display: block;
        position: fixed;
        bottom: 50px;
        left: 50px;
    }

    .log {
        text-align: right;
        position: fixed;
        bottom: 50px;
        right: 50px;
    }

    .bg {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
    }
`;
