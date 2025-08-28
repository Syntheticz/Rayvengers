import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Store lobby students
interface LobbyStudent {
  id: string;
  name: string;
  section: string;
}

const lobby: Record<string, LobbyStudent> = {};

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Student connected:", socket.id);

    socket.emit("lobbyUpdate", Object.values(lobby));
    socket.on("joinLobby", async (payload, ack) => {
      try {
        // For now, use socket ID as identifier - should be using the database name and section
        const socketId = payload?.socketId || socket.id;
        const name = `Student-${socketId.slice(-4)}`;
        const section = "A"; // Default section
        
        console.log("received joinLobby from", socket.id, "payload:", payload);
        lobby[socket.id] = {
          id: socket.id,
          name: name,
          section: section,
        };
        
        const updated = Object.values(lobby);
        io.emit("lobbyUpdate", updated);
        console.log(`Student joined: ${lobby[socket.id].name} [${lobby[socket.id].section}]`);
        console.log("emitted lobbyUpdate", updated.length, "entries");
        
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
      } catch (error) {
        console.error("Error in joinLobby:", error);
        if (typeof ack === "function") {
          ack({ error: "Failed to join lobby" });
        }
      }
    });

    // When player disconnects
    socket.on("disconnect", () => {
      console.log("❌ Student left:", socket.id);
      delete lobby[socket.id];
      io.emit("lobbyUpdate", Object.values(lobby));
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Lobby server at http://${hostname}:${port}`);
  });
});

