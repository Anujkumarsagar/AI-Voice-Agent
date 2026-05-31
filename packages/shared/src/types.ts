
export interface SocketMessage<T = unknown> {
  event: string;
  payload: T;
}

export interface AudioChunkPayload {
  sessionId: string;
  chunk: ArrayBuffer;
}

export interface TranscriptPayload {
  sessionId: string;
  text: string;
}

export interface ResponsePayload {
  sessionId: string;
  text: string;
}