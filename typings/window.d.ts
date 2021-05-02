import { MessageMetadata } from '../src';

declare global {
    interface Window {
        onNewMessageReceived: (text: string, metadata?: MessageMetadata) => void;
        onVideoEnded: () => void;
        logger: (...args: any) => void;

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
