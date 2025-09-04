import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { parse } from "path";
import { getToken } from "next-auth/jwt";
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

export interface GameState {
  isActive: boolean;
  chapter: string;
  level: string;
  startedAt?: Date;
  questionStates: Record<string, QuestionState>;
}

const prisma = new PrismaClient();

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
const activeGameLobby: Record<string, LobbyStudent> = {};
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
    // console.log(user);

    // Send user info to client
    socket.emit("userInfo", { id: user.id, name: user.name, role: user.role });

    socket.emit("lobbyUpdate", Object.values(waitingLobby));

    socket.on("getLobby", (ack) => {
      console.log("📥 getLobby called by client", socket.id);

      if (typeof ack === "function") {
        const data = Object.values(waitingLobby);
        console.log("📤 sending lobby data back:", data.length, "students");
        ack(data); // <-- respond directly to the client
      }
    });

    socket.on("joinLobby", (payload, ack) => {
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

      // Add student to waiting lobby
      waitingLobby[user.id] = {
        id: user.id,
        name: user.name,
        section: user.section,
        role: roleNorm,
      };

      socketToUser[socket.id] = user.id;

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
      const lobbyStudents = Object.values(waitingLobby);

      if (lobbyStudents.length === 0) {
        socket.emit("gameStartError", {
          message: "No students in waiting lobby",
        });
        return;
      }

      // Move waiting students into active game
      for (const student of lobbyStudents) {
        activeGameLobby[student.id] = student;
      }
      Object.keys(waitingLobby).forEach((id) => delete waitingLobby[id]);

      // Assign groups, init gameState, etc.
      gameState.isActive = true;
      gameState.chapter = gameData.chapter || "chapter1";
      gameState.level = gameData.level || "level1";

      io.emit("gameStarted", {
        students: Object.values(activeGameLobby),
        chapter: gameState.chapter,
        level: gameState.level,
      });

      // Update teacher’s view
      io.emit("gameLobbyUpdate", Object.values(activeGameLobby));
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

      if (allCompleted) {
        gameState.isActive = false;
        const nextLevel = getNextLevel(gameState.chapter, gameState.level);
        io.emit("gameCompleted", {
          results: gameState.questionStates,
          chapter: gameState.chapter,
          level: gameState.level,
          completedAt: new Date().toISOString(),
        });
        console.log(`🎉 Game completed!`);
      }
    });

    socket.on("endGame", () => {
      gameState.isActive = false;
      Object.keys(activeGameLobby).forEach((id) => delete activeGameLobby[id]);

      io.emit("gameEnded", { message: "Game session ended" });
      io.emit("waitingLobbyUpdate", Object.values(waitingLobby));
    });

    socket.on("disconnect", () => {
      const userId = socketToUser[socket.id];

      if (!userId) {
        console.log("❌ Socket disconnected (no userId)", socket.id);
        return;
      }

      // 1. If student was in waiting lobby
      if (waitingLobby[userId]) {
        console.log(
          "❌ Student left waiting lobby:",
          waitingLobby[userId].name
        );
        delete waitingLobby[userId];
        io.emit("waitingLobbyUpdate", Object.values(waitingLobby));
      }

      // 2. If student was in active game lobby
      else if (activeGameLobby[userId]) {
        console.log(
          "❌ Student left active game lobby:",
          activeGameLobby[userId].name
        );
        delete activeGameLobby[userId];
        io.emit("gameLobbyUpdate", Object.values(activeGameLobby));
      }

      // 3. Clean up reference
      delete socketToUser[socket.id];
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Lobby server at http://${hostname}:${port}`);
  });
});
