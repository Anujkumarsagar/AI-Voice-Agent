import { ElevenClient } from "@repo/elevenlabs-client";
import { RealtimeEvents } from "@elevenlabs/elevenlabs-js";
import { WebSocketServer, WebSocket } from "ws";

export class WebSocketGateway {
  private wss: WebSocketServer;

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.wss.on("connection", (socket) => this.handleConnection(socket));
  }

  private async handleConnection(socket: WebSocket) {
    console.log("Client connected");

    let elevenLabs: ElevenClient | null = null;
    let connection: any;

    try {
      elevenLabs = new ElevenClient();
      connection = await elevenLabs.connectRealtime();
    } catch (error) {
      console.error("Failed to start ElevenLabs realtime session", error);
      try {
        socket.send(JSON.stringify({ event: "error", payload: "Unable to start realtime transcription" }));
      } catch {}
      // do not close the socket immediately — allow client to receive the error and decide
      return;
    }

    connection.on(RealtimeEvents.SESSION_STARTED, (data) => {
      socket.send(JSON.stringify({ event: "session_started", payload: data }));
    });

    connection.on(RealtimeEvents.PARTIAL_TRANSCRIPT, (data) => {
      socket.send(JSON.stringify({ event: "partial_transcript", payload: data }));
    });

    connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT, (data) => {
      socket.send(JSON.stringify({ event: "committed_transcript", payload: data }));
    });

    connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT_WITH_TIMESTAMPS, (data) => {
      socket.send(JSON.stringify({ event: "committed_transcript_with_timestamps", payload: data }));
    });

    connection.on(RealtimeEvents.ERROR, (error) => {
      console.error("ElevenLabs realtime error", error);
      socket.send(JSON.stringify({ event: "error", payload: error }));
    });

    socket.on("message", async (data) => {
      try {
        const bytes = this.toBuffer(data);
        if (elevenLabs) {
          await elevenLabs.sendAudio(bytes);
        }
      } catch (sendError) {
        console.error("Failed to send audio chunk", sendError);
      }
    });

    socket.on("close", () => {
      console.log("Client disconnected");
      try {
        elevenLabs?.commit();
        elevenLabs?.close();
      } catch (err) {
        console.error("Error closing ElevenLabs client", err);
      }
    });

    socket.on("error", (socketError) => {
      console.error("WebSocket error", socketError);
      try {
        elevenLabs?.close();
      } catch (err) {
        console.error("Error closing ElevenLabs on socket error", err);
      }
    });
  }

  private toBuffer(data: unknown): Buffer {
    if (Buffer.isBuffer(data)) {
      return data;
    }

    if (typeof data === "string") {
      return Buffer.from(data);
    }

    if (data instanceof ArrayBuffer) {
      return Buffer.from(data);
    }

    if (Array.isArray(data)) {
      return Buffer.concat(data.map((chunk) => Buffer.from(chunk)));
    }

    throw new Error("Unsupported audio data format");
  }
}
