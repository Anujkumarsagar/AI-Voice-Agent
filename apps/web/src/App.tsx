import { useEffect, useState } from "react";
import { useVoice } from "./hooks/useVoice";

function App() {
  const [socket] = useState(() => new WebSocket("ws://localhost:3001"));
  const [transcript, setTranscript] = useState("");

  const { startRecording, stopRecording } = useVoice();

  useEffect(() => {
    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data.toString());
        if (data.event === "partial_transcript" || data.event === "committed_transcript" || data.event === "committed_transcript_with_timestamps") {
          const payload = data.payload || {};
          const text = payload.text ?? payload.transcript ?? payload?.result ?? JSON.stringify(payload);
          setTranscript(text);
        }
      } catch (error) {
        console.error("Failed to parse socket message", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error", error);
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
    };
  }, [socket]);

  return (
    <div>
      <button
        onClick={async () =>
          await startRecording(socket)
        }
      >
        Start Recording
      </button>

      <button onClick={() => stopRecording(socket)}>
        Stop Recording
      </button>

      <div>
        <h2>Transcript</h2>
        <p>{transcript}</p>
      </div>
    </div>
  );
}

export default App;