import { createServer } from "http";
import { Server } from "socket.io";

const port = 3001;
const hostname = "localhost";

interface LobbyStudent {
  id: string;
  name: string;
  section: string;
}

const lobby: Record<string, LobbyStudent> = {};

const httpServer = createServer((req, res) => {
  // Simple status page for manual checks
  if (req && req.url && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<html><body><h2>Lobby server running on port ${port}</h2></body></html>`);
    return;
  }
  res.writeHead(204);
  res.end();
});
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("🔌 Student connected:", socket.id);

  // Send current lobby immediately so client sees existing students
  socket.emit("lobbyUpdate", Object.values(lobby));

  // Listen for joinLobby event
  socket.on("joinLobby", (payload, ack) => {
    const { name, section } = payload || {};
    console.log("received joinLobby from", socket.id, "payload:", payload);
    lobby[socket.id] = {
      id: socket.id,
      name: name || "Anonymous",
      section: section || "?",
    };
    // Broadcast updated lobby to all clients
    const updated = Object.values(lobby);
    io.emit("lobbyUpdate", updated);
    console.log(`Student joined: ${lobby[socket.id].name} [${lobby[socket.id].section}]`);
    console.log("emitted lobbyUpdate", updated.length, "entries");
    // Acknowledge to sender via callback if provided
    if (typeof ack === "function") {
      try {
        ack(lobby[socket.id]);
      } catch (e) {
        console.warn("ack callback error", e);
      }
    } else {
      // Fallback emit
      socket.emit("joined", lobby[socket.id]);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("❌ Student left:", socket.id);
    delete lobby[socket.id];
    io.emit("lobbyUpdate", Object.values(lobby));
  });
});

httpServer.listen(port, () => {
  console.log(`🚀 Lobby server running at http://${hostname}:${port}`);
});


