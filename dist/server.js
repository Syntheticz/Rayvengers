import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3005;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
let players = {};
app.prepare().then(() => {
    const httpServer = createServer(handler);
    const io = new Server(httpServer, {
        cors: { origin: "*" },
    });
    io.on("connection", (socket) => {
        console.log("🔌 Player connected:", socket.id);
        // Assign random color + start pos
        players[socket.id] = {
            id: socket.id,
            x: Math.floor(Math.random() * 400),
            y: Math.floor(Math.random() * 400),
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        };
        // Send current players to new player
        socket.emit("players", players);
        // Broadcast new player to everyone
        socket.broadcast.emit("player-joined", players[socket.id]);
        // When player moves
        socket.on("move", ({ x, y }) => {
            if (players[socket.id]) {
                players[socket.id].x = x;
                players[socket.id].y = y;
                io.emit("player-moved", players[socket.id]);
            }
        });
        // When player disconnects
        socket.on("disconnect", () => {
            console.log("❌ Player left:", socket.id);
            delete players[socket.id];
            io.emit("player-left", socket.id);
        });
    });
    httpServer.listen(port, () => {
        console.log(`🚀 Game server at http://${hostname}:${port}`);
    });
});
