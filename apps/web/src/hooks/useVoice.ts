import { AudioRecorder } from "@repo/audio-core/src";
import { useRef } from "react";

export function useVoice() {
    let recordRef = useRef<AudioRecorder | null>(null);

    const startRecording = async (
        socket: WebSocket,
    ) => {
        recordRef.current = new AudioRecorder();

        const convertBlobToPCM16 = async (blob: Blob): Promise<ArrayBuffer> => {
            const arrayBuffer = await blob.arrayBuffer();
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const decoded = await audioCtx.decodeAudioData(arrayBuffer.slice(0));

            // If sampleRate is already 16000 and single channel, just convert
            const targetRate = 16000;
            let renderedBuffer: AudioBuffer;
            if (decoded.sampleRate === targetRate && decoded.numberOfChannels === 1) {
                renderedBuffer = decoded;
            } else {
                const offlineCtx = new OfflineAudioContext(1, Math.ceil(decoded.duration * targetRate), targetRate);
                const src = offlineCtx.createBufferSource();
                // mix down to mono
                const mono = offlineCtx.createBuffer(1, decoded.length, decoded.sampleRate);
                const inputData = decoded.numberOfChannels > 0 ? decoded.getChannelData(0) : new Float32Array(decoded.length);
                if (decoded.numberOfChannels > 1) {
                    // average channels
                    const chCount = decoded.numberOfChannels;
                    for (let i = 0; i < decoded.length; i++) {
                        let sum = 0;
                        for (let c = 0; c < chCount; c++) sum += decoded.getChannelData(c)[i];
                        mono.getChannelData(0)[i] = sum / chCount;
                    }
                } else {
                    mono.copyToChannel(inputData, 0);
                }

                src.buffer = mono;
                src.connect(offlineCtx.destination);
                src.start(0);
                renderedBuffer = await offlineCtx.startRendering();
            }

            const channelData = renderedBuffer.getChannelData(0);
            // convert float [-1,1] to 16-bit PCM
            const pcm16 = new Int16Array(channelData.length);
            for (let i = 0; i < channelData.length; i++) {
                let s = Math.max(-1, Math.min(1, channelData[i]));
                pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
            }

            return pcm16.buffer;
        };

        await recordRef.current?.start(
            async (blob) => {
                try {
                    const pcmBuffer = await convertBlobToPCM16(blob);
                    socket.send(pcmBuffer);
                    console.log('sent pcm length', pcmBuffer.byteLength);
                } catch (err) {
                    console.error('failed to convert/send audio chunk', err);
                }
            }
        )
    }

    const stopRecording = async (
        socket: WebSocket
    ) => {
        recordRef.current?.stop();
        socket.close();
    }

    return {
        startRecording,
        stopRecording,

    };
}