declare global {
    interface Window {
        onNewMessageReceived: (text: string) => void;
        onVideoEnded: () => void;
        logger: (...args: any) => void;

        Hls: any;

        mixedStream: MediaStream;
    }

    interface HTMLCanvasElement {
        captureStream(frameRate?: number): MediaStream;
    }

    interface HTMLVideoElement {
        captureStream(frameRate?: number): MediaStream;
    }

    interface MediaDevices extends EventTarget {
        getDisplayMedia(constraints?: MediaStreamConstraints): Promise<MediaStream> | null;
    }
}

export {};
