import app from "./app";
import { WebSocketGateway } from "@repo/websocket";


const PORT = 3001;
new WebSocketGateway(PORT);
console.log(`WebSocket running on ${PORT}`);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});