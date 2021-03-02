declare module "react-youtube-background" {
    interface Props {
        videoId: string;
        className?: string;
    }

    export default class YoutubeBackground extends React.Component<Props> {}
}
