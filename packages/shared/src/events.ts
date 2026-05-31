export enum SocketEvent {
  AUDIO_START = "audio:start",
  AUDIO_CHUNK = "audio:chunk",
  AUDIO_END = "audio:end",

  TRANSCRIPT_PARTIAL = "transcript:partial",
  TRANSCRIPT_FINAL = "transcript:final",

  RESPONSE_START = "response:start",
  RESPONSE_CHUNK = "response:chunk",
  RESPONSE_END = "response:end",

  ERROR = "error",
}