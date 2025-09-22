import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { parse } from "path";
import { getToken } from "next-auth/jwt";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export interface LobbyStudent {
  id: string;
  name: string;
  section: string;
  role: string;
}

export interface GameState {
  id: string; // unique per game session
  isActive: boolean;
  chapter: string;
  level: string;
  startedAt?: Date;
  questionStates: Record<string, QuestionState>;
  players: string[]; // student ids assigned to this game
}

// Store lobby students
export interface LobbyStudent {
  id: string;
  name: string;
  section: string;
  group?: number;
  role: string;
}

export interface QuestionState {
  id: string;
  status: "available" | "claimed" | "completed";
  claimedBy?: string;
  claimedByName?: string;
  answer?: number;
  isCorrect?: boolean;
  completedAt?: Date;
}

interface Lobby {
  id: string;
  name: string;
  students: LobbyStudent[];
  isActive: boolean;
  createdAt: Date;
}

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const gameState: GameState = {
  isActive: false,
  chapter: "chapter1",
  level: "level1",
  questionStates: {},
  id: "",
  players: [],
  startedAt: new Date(Date.now()),
};

const waitingLobby: Record<string, LobbyStudent> = {};
// Track active game lobbies by chapter+level
const activeGameLobbies: Record<
  string, // e.g. "chapter1-level1"
  Record<string, LobbyStudent> // studentId → student
> = {};

// Utility
const getLobbyKey = (chapter: string, level: string) =>
  `${chapter}-level${level}`;
const gameSessions: Record<string, GameState> = {}; // active games

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

      // console.log("🍪 Cookies received:", req.cookies);

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

    // Send user info to client
    socket.emit("userInfo", { id: user.id, name: user.name, role: user.role });
    socket.emit("lobbyUpdate", Object.values(waitingLobby));

    socket.on("createLobbies", async ({ numLobbies }, ack) => {
      try {
        const lobbies: Lobby[] = [];
        for (let i = 1; i <= numLobbies; i++) {
          const lobby = await prisma.lobby.create({
            data: {
              name: `Lobby ${i}`,
              status: "WAITING",
              maxPlayers: 4,
              createdBy: "system", // or user.id if tied to a user
            },
          });
          lobbies.push({
            createdAt: lobby.createdAt,
            id: lobby.id,
            isActive: true,
            name: lobby.name,
            students: [],
          });
        }

        // Emit updated lobby list
        const allLobbies = await prisma.lobby.findMany({
          where: { status: "WAITING" },
        });
        io.emit("lobbiesUpdate", allLobbies);

        if (ack) ack({ success: true, lobbies });
      } catch (err) {
        console.error("❌ [createLobbies] Error:", err);
        if (ack) ack({ success: false });
      }
    });

    socket.on("getLobby", (ack) => {
      console.log("📥 getLobby called by client", socket.id);

      if (typeof ack === "function") {
        const data = Object.values(waitingLobby);
        console.log("📤 sending lobby data back:", data.length, "students");
        ack(data); // <-- respond directly to the client
      }
    });

    socket.on("joinLobby", async (payload, ack) => {
      console.log("🎯 [joinLobby] Event received");
      console.log("   ↳ Payload:", payload);
      console.log("   ↳ User:", user);

      const roleNorm = (user.role || "").toLowerCase();
      if (roleNorm !== "student") {
        console.warn(
          "⚠️ [joinLobby] Blocked non-student user:",
          user.id,
          user.role
        );
        return;
      }

      // Persist student into DB lobby
      const lobbyUser = await prisma.lobbyUser.upsert({
        where: {
          userId_lobbyId: { userId: user.id, lobbyId: payload.lobbyId },
        },
        update: { isReady: false },
        create: {
          userId: user.id,
          lobbyId: payload.lobbyId,
          isReady: false,
        },
        include: { user: true },
      });

      socketToUser[socket.id] = user.id;

      socket.join("waitingLobby");
      socket.join(payload.lobbyId);

      console.log(
        "✅ [joinLobby] Student added to waiting lobby:",
        waitingLobby[user.id]
      );
      console.log("   ↳ Current waitingLobby:", Object.values(waitingLobby));
      console.log("   ↳ socketToUser:", socketToUser);

      io.emit("waitingLobbyUpdate", Object.values(waitingLobby));
      console.log("📡 [joinLobby] waitingLobbyUpdate emitted");

      if (ack) {
        console.log("📨 [joinLobby] Sending ack back to client");
        ack(waitingLobby[user.id]);
      }
    });

    socket.on("startGame", (gameData) => {
      console.log("🎯 [startGame] Event received", gameData);

      const lobbyStudents = Object.values(waitingLobby);

      if (lobbyStudents.length === 0) {
        socket.emit("gameStartError", {
          message: "No students in waiting lobby",
        });
        return;
      }

      const chapter = gameData.chapter || "chapter1";
      const level = gameData.level || "level1";
      const lobbyKey = `${chapter}-${level}`;

      // Ensure active lobby exists
      if (!activeGameLobbies[lobbyKey]) {
        activeGameLobbies[lobbyKey] = {};
      }

      // Move waiting students → into this game lobby
      for (const student of lobbyStudents) {
        activeGameLobbies[lobbyKey][student.id] = student;
      }
      Object.keys(waitingLobby).forEach((id) => delete waitingLobby[id]);

      // ✅ Initialize game state per lobby
      const gameState: GameState = {
        id: `${lobbyKey}-${Date.now()}`,
        isActive: true,
        chapter,
        level,
        startedAt: new Date(),
        questionStates: {}, // TODO: preload questions
        players: Object.keys(activeGameLobbies[lobbyKey]),
      };

      gameSessions[lobbyKey] = gameState;

      io.to(lobbyKey).emit(`${lobbyKey}:started`, gameState);
      console.log(`📡 [startGame] ${lobbyKey}:started emitted`);
      // console.log("[server socket] : students on lobby:", activeGameLobbies);
      console.log("waiting lobby: ", waitingLobby);

      io.emit(`${lobbyKey}:update`, Object.values(activeGameLobbies[lobbyKey]));
      io.to("waitingLobby").emit("gameStarted", { chapter: chapter });
    });

    socket.on("getQuestions", () => {
      if (!gameState.isActive) {
        const hasQuestions = Object.keys(gameState.questionStates).length > 0;
        const allCompleted =
          hasQuestions &&
          Object.values(gameState.questionStates).every(
            (q) => q.status === "completed"
          );
        if (allCompleted) {
          socket.emit("gameCompleted", {
            results: gameState.questionStates,
            chapter: gameState.chapter,
            level: gameState.level,
            completedAt:
              gameState.startedAt?.toISOString() || new Date().toISOString(),
          });
        } else {
          socket.emit("questionsError", { message: "No active game" });
        }
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
      if (
        questionState.status !== "available" &&
        (questionState.status !== "claimed" ||
          questionState.claimedBy !== user.id)
      ) {
        socket.emit("claimError", { message: "Question not available" });
        return;
      }

      // Claim the question (or re-claim if it's the same user)
      questionState.status = "claimed";
      questionState.claimedBy = user.id;
      questionState.claimedByName = user.name;

      console.log(
        `📝 Question ${questionId} claimed by ${questionState.claimedByName} (${user.id})`
      );

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
      if (questionId === "chest2" && answer === "center-curvature")
        isCorrect = true;
      if (questionId === "chest3" && answer === "principal-axis")
        isCorrect = true;
      if (questionId === "chest4" && answer === "concave-mirror")
        isCorrect = true;

      questionState.status = "completed";
      questionState.answer = answer;
      questionState.isCorrect = isCorrect;
      questionState.completedAt = new Date();

      console.log(
        `✅ ${user.name} ${
          isCorrect ? "correctly" : "incorrectly"
        } answered ${questionId}: ${answer}`
      );

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
    });

    socket.on("endGame", (data: { chapter?: string; level?: string } = {}) => {
      const chapter = data.chapter ?? "chapter1";
      const level = data.level ?? "level1";
      const lobbyKey = `${chapter}-${level}`;

      console.log(`🛑 [endGame] Ending game for ${lobbyKey}`);

      if (!activeGameLobbies[lobbyKey]) {
        socket.emit("gameEndError", {
          message: `No active game for ${lobbyKey}`,
        });
        return;
      }

      // Mark the session inactive if it exists
      if (gameSessions[lobbyKey]) {
        gameSessions[lobbyKey].isActive = false;
      }

      // Clear that active game lobby
      delete activeGameLobbies[lobbyKey];

      // Notify clients in this game
      io.emit(`${lobbyKey}:ended`, {
        message: "Game session ended",
        chapter,
        level,
      });

      // Update teacher dashboard (waiting students are still there)
      io.emit("waitingLobbyUpdate", Object.values(waitingLobby));

      console.log(`✅ [endGame] ${lobbyKey} ended`);
    });

    function isUserStillConnected(userId: string) {
      return Object.values(socketToUser).some((id) => id === userId);
    }

    socket.on("disconnect", () => {
      const userId = socketToUser[socket.id];
      if (!userId) {
        console.log("❌ Socket disconnected (no userId)", socket.id);
        return;
      }

      console.log(
        `⚡ Disconnect detected for userId=${userId}, socketId=${socket.id}`
      );

      // Always remove the mapping for this socket
      delete socketToUser[socket.id];

      // Grace period before we actually kick user out
      setTimeout(() => {
        if (isUserStillConnected(userId)) {
          console.log(
            `🔄 User ${userId} reconnected during grace period, keeping them in lobbies`
          );
          return;
        }

        // Remove from waiting lobby
        if (waitingLobby[userId]) {
          console.log(
            `❌ Student ${waitingLobby[userId].name} left waiting lobby`
          );
          delete waitingLobby[userId];
          io.emit("waitingLobbyUpdate", Object.values(waitingLobby));
        }

        // Remove from ALL active game lobbies
        for (const [lobbyKey, lobby] of Object.entries(activeGameLobbies)) {
          if (lobby[userId]) {
            console.log(
              `❌ Student ${lobby[userId].name} left active game lobby ${lobbyKey}`
            );
            delete lobby[userId];
            io.emit(`${lobbyKey}:update`, Object.values(lobby));
          }
        }
      }, 3000); // 3s grace period
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Lobby server at http://${hostname}:${port}`);
  });
});
