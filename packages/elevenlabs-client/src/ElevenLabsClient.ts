
import { ElevenLabsClient, RealtimeConnection, AudioFormat } from "@elevenlabs/elevenlabs-js";

export class ElevenClient {
    private elevenLabs: ElevenLabsClient;
    private connection: RealtimeConnection | null = null;

    constructor() {
        const apiKey = process.env.ELEVENLABS_API_KEY || 'sk_e54c993ec76f4f1cabad7e44a3b2306f3d91a7e5ca87d381';
        if (!apiKey) {
            throw new Error("ELEVENLABS_API_KEY is required in the environment");
        }

        this.elevenLabs = new ElevenLabsClient({
            apiKey,
        });
    }

    async connectRealtime(): Promise<RealtimeConnection> {
        if (this.connection) {
            return this.connection;
        }

        this.connection = await this.elevenLabs.speechToText.realtime.connect({
            modelId: "scribe_v2_realtime",
            audioFormat: AudioFormat.PCM_16000,
            sampleRate: 16000,
            includeTimestamps: true,
        });

        return this.connection;
    }

    async sendAudio(bytes: Buffer) {
        const connection = await this.connectRealtime();
        try {
            if (process.env.ELEVENLABS_DEBUG) {
                console.log("ElevenLabs sendAudio: bytes=", bytes.length, "firstBytes=", bytes.slice(0,8));
            }
            connection.send({
                audioBase64: bytes.toString("base64"),
            });
        } catch (err) {
            console.error("Error sending audio to ElevenLabs realtime:", err);
            throw err;
        }
    }

    commit() {
        this.connection?.commit();
    }

    close() {
        this.connection?.close();
        this.connection = null;
    }

}

