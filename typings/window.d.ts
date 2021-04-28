declare global {
    interface Window {
        onNewMessageReceived: (text: string) => void;
        onVideoEnded: () => void;
        setStreamAlreadyBound: (value: boolean) => void;
        logger: (...args: any) => void;
    }

    interface HTMLCanvasElement {
        captureStream(frameRate?: number): MediaStream;
    }

    interface HTMLVideoElement {
        captureStream(frameRate?: number): MediaStream;
    }

    interface MediaDevices extends EventTarget {
        getDisplayMedia(constraints?: MediaStreamConstraints): Promise<MediaStream>;
    }
}

export {};
