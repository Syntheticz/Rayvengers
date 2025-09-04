import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { parse } from "path";
import { getToken } from "next-auth/jwt";

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
  group?: number; 
  role: string; 
}


interface QuestionState {
  id: string;
  status: "available" | "claimed" | "completed";
  claimedBy?: string; 
  claimedByName?: string; 
  answer?: number;
  isCorrect?: boolean;
  completedAt?: Date;
}

interface GameState {
  isActive: boolean;
  chapter: string;
  level: string;
  startedAt?: Date;
  questionStates: Record<string, QuestionState>;
}

const gameState: GameState = {
  isActive: false,
  chapter: "chapter1",
  level: "level1",
  questionStates: {}
};

const lobby: Record<string, LobbyStudent> = {};
const socketToUser: Record<string, string> = {};

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.use(async (socket, next) => {
    try {
      const req = {
        headers: socket.handshake.headers,
        cookies: parse(socket.handshake.headers.cookie || ""),
      } as any;

      console.log("🍪 Cookies received:", req.cookies);

      const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET,
      });

      if (!token) {
        return next(new Error("Unauthorized: no session token"));
      }

      (socket as any).user = {
        id: token.id,
        role: token.role,
        name: token.name,
        section: token.section,
        username: token.username,
      };

      next();
    } catch (err) {
      console.error("❌ Socket auth failed", err);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const user = (socket as any).user;
    console.log(`🔌 Connected: ${user.name} (${user.role})`);
    // console.log(user);

    // Send user info to client
    socket.emit("userInfo", { id: user.id, name: user.name, role: user.role });

  socket.emit("lobbyUpdate", Object.values(lobby));

    socket.on("joinLobby", async (payload, ack) => {
      try {
        const roleNorm = (user.role || '').toLowerCase();
        if (roleNorm !== 'student') {
          console.log(`Non-student role '${user.role}' (normalized: '${roleNorm}') attempted to join lobby: ${user.name}`);
          if (typeof ack === 'function') {
            ack({ error: 'Only students can join lobby' });
          } else {
            socket.emit('joinDenied', { message: 'Only students can join lobby' });
          }
          return;
        }
        const name = `${user.name}`;
        const section = user.section || ""; 

        console.log("received joinLobby from", socket.id, "payload:", payload);
        lobby[user.id] = {
          id: user.id,
          name,
          section,
          role: roleNorm,
          group: lobby[user.id]?.group 
        };
        socketToUser[socket.id] = user.id;

        const updated = Object.values(lobby);
        io.emit("lobbyUpdate", updated);
        console.log(
          `Student joined: ${lobby[user.id].name} [${lobby[user.id].section}]`
        );
        console.log("emitted lobbyUpdate", updated.length, "entries");

        if (typeof ack === "function") {
          try {
            ack(lobby[user.id]);
          } catch (e) {
            console.warn("ack callback error", e);
          }
        } else {
          socket.emit("joined", lobby[user.id]);
        }
      } catch (error) {
        console.error("Error in joinLobby:", error);
        if (typeof ack === "function") {
          ack({ error: "Failed to join lobby" });
        }
      }
    });


    socket.on("startGame", (gameData) => {
      console.log("Teacher started game:", gameData);
      console.log("📊 Current lobby students:", Object.keys(lobby));
      console.log("🔗 Total connected clients:", io.engine.clientsCount);

  const lobbyStudents = Object.keys(lobby); 

      if (lobbyStudents.length === 0) {
        socket.emit("gameStartError", { message: "No students in lobby" });
        return;
      }

  
      gameState.isActive = true;
      gameState.chapter = gameData.chapter || "chapter1";
      gameState.level = gameData.level || "level1";
      gameState.startedAt = new Date();

      const totalGroups = Math.max(1, parseInt(gameData.groups, 10) || 1);
  const socketIds = [...lobbyStudents];
      for (let i = socketIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [socketIds[i], socketIds[j]] = [socketIds[j], socketIds[i]];
      }

      const assignment: Record<string, number> = {};
      socketIds.forEach((sid, idx) => {
        const groupNumber = (idx % totalGroups) + 1;
        if (lobby[sid]) {
          lobby[sid].group = groupNumber;
          assignment[lobby[sid].id] = groupNumber;
        }
      });
      console.log('🧮 Group assignment complete', { totalGroups, assignment });
      

      gameState.questionStates = {
        "chest1": { id: "chest1", status: "available" },
        "chest2": { id: "chest2", status: "available" },
        "chest3": { id: "chest3", status: "available" },
        "chest4": { id: "chest4", status: "available" }
      };

      // Notify all students in lobby to start the game
      const gameStartData = {
        chapter: gameData.chapter || "chapter1",
        level: gameData.level || "level1",
        message: "Game is starting! Get ready...",
        groups: totalGroups,
        assignments: assignment,
      };

      io.emit('lobbyUpdate', Object.values(lobby));

      io.emit("gameStarted", gameStartData);
      console.log("📤 Sent gameStarted with group assignments:", gameStartData);

      io.emit('groupsAssigned', { groups: totalGroups, assignments: assignment });

      socket.emit("gameStartAck", {
        studentsNotified: lobbyStudents.length,
        totalClients: io.engine.clientsCount,
      });
    });

    socket.on("getQuestions", () => {
      if (!gameState.isActive) {
        socket.emit("questionsError", { message: "No active game" });
        return;
      }

      socket.emit("questionsUpdate", {
        questionStates: gameState.questionStates,
      });
    });

    // Handle student claiming a question
    socket.on("claimQuestion", (data) => {
      const { questionId } = data;
      const user = (socket as any).user;

      if (!gameState.isActive) {
        socket.emit("claimError", { message: "No active game" });
        return;
      }

      const questionState = gameState.questionStates[questionId];
      if (!questionState) {
        socket.emit("claimError", { message: "Question not found" });
        return;
      }
      if (questionState.status !== "available" && 
          (questionState.status !== "claimed" || questionState.claimedBy !== user.id)) {
        socket.emit("claimError", { message: "Question not available" });
        return;
      }

      // Claim the question (or re-claim if it's the same user)
      questionState.status = "claimed";
      questionState.claimedBy = user.id; 
      questionState.claimedByName = user.name;

      console.log(`📝 Question ${questionId} claimed by ${questionState.claimedByName} (${user.id})`);

      // Broadcast updated state to all connected students
      io.emit("questionsUpdate", {
        questionStates: gameState.questionStates,
      });

      console.log(
        `📝 Question ${questionId} claimed by ${questionState.claimedByName}`
      );
    });

    // Answer submit handle
    socket.on("submitAnswer", (data) => {
      const { questionId, answer } = data;
      const user = (socket as any).user;

      if (!gameState.isActive) {
        socket.emit("submitError", { message: "No active game" });
        return;
      }

      const questionState = gameState.questionStates[questionId];
      if (!questionState || questionState.claimedBy !== user.id) {
        socket.emit("submitError", { message: "Question not claimed by you" });
        return;
      }

      let isCorrect = false;
      if (questionId === "chest1" && answer === "focal-point") isCorrect = true;
      if (questionId === "chest2" && answer === "center-curvature") isCorrect = true;
      if (questionId === "chest3" && answer === "principal-axis") isCorrect = true;
      if (questionId === "chest4" && answer === "concave-mirror") isCorrect = true;

      questionState.status = "completed";
      questionState.answer = answer;
      questionState.isCorrect = isCorrect;
      questionState.completedAt = new Date();

      console.log(`✅ ${user.name} ${isCorrect ? 'correctly' : 'incorrectly'} answered ${questionId}: ${answer}`);

      // Broadcast to students
      io.emit("questionsUpdate", {
        questionStates: gameState.questionStates,
      });


      socket.emit("answerResult", {
        questionId,
        isCorrect,
      });

      console.log(
        `✅ Question ${questionId} completed by ${
          questionState.claimedByName
        } - ${isCorrect ? "Correct" : "Wrong"}`
      );

      // Check if questions are complete
      const allCompleted = Object.values(gameState.questionStates).every(
        (qs) => qs.status === "completed"
      );

      if (allCompleted) {
        gameState.isActive = false;
        io.emit("gameCompleted", {
          results: gameState.questionStates,
        });
        console.log(`🎉 Game completed!`);
      }
    });

    // When player disconnects
    socket.on("disconnect", () => {
      const userId = socketToUser[socket.id];
      if (userId && lobby[userId]) {
        console.log("❌ Student left", lobby[userId].name, `(userId=${userId})`);
        delete lobby[userId];
      } else {
        console.log("❌ Socket disconnected (no lobby entry)", socket.id);
      }
      delete socketToUser[socket.id];
      io.emit("lobbyUpdate", Object.values(lobby));
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Lobby server at http://${hostname}:${port}`);
  });
});
