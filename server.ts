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
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

interface QuestionState {
  id: string;
  status: "available" | "claimed" | "completed";
  claimedBy?: string; // student socket ID
  claimedByName?: string; // student name
  answer?: number;
  isCorrect?: boolean;
  completedAt?: Date;
}

interface GameSession {
  id: string;
  chapter: string;
  level: string;
  students: string[]; // socket IDs
  questions: Question[];
  questionStates: Record<string, QuestionState>; // questionId -> state
  startedAt: Date;
  isActive: boolean;
}

// Store active game sessions
const gameSessions: Record<string, GameSession> = {};

// Sample questions for Chapter 1 Level 1
const chapter1Level1Questions: Question[] = [
  {
    id: "c1l1q1",
    text: "When light travels from air into water, what happens to its speed?",
    options: ["Increases", "Decreases", "Stays the same", "Becomes zero"],
    correctAnswer: 1,
    points: 10,
  },
  {
    id: "c1l1q2",
    text: "What is the unit of measurement for the frequency of light?",
    options: ["Meters", "Hertz", "Joules", "Watts"],
    correctAnswer: 1,
    points: 10,
  },
  {
    id: "c1l1q3",
    text: "Which color of light has the shortest wavelength?",
    options: ["Red", "Green", "Blue", "Violet"],
    correctAnswer: 3,
    points: 10,
  },
  {
    id: "c1l1q4",
    text: "What phenomenon occurs when light bends as it passes through a lens?",
    options: ["Reflection", "Refraction", "Diffraction", "Interference"],
    correctAnswer: 1,
    points: 10,
  },
];

const lobby: Record<string, LobbyStudent> = {};

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.use(async (socket, next) => {
    try {
      // create a fake request object for getToken
      const req = {
        headers: socket.handshake.headers,
        cookies: parse(socket.handshake.headers.cookie || ""),
      } as any;

      const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET,
      });

      if (!token) {
        return next(new Error("Unauthorized: no session token"));
      }

      // attach user to socket
      (socket as any).user = {
        id: token.id,
        role: token.role,
        name: token.name,
        section: token.section,
      };

      console.log("✅ Authenticated socket user:", token.name);
      next();
    } catch (err) {
      console.error("❌ Socket auth failed", err);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const user = (socket as any).user;
    console.log(`🔌 Connected: ${user.name} (${user.role})`);
    console.log(user);

    socket.emit("lobbyUpdate", Object.values(lobby));

    socket.on("joinLobby", async (payload, ack) => {
      try {
        // For now, use socket ID as identifier - should be using the database name and section
        const socketId = payload?.socketId || socket.id;
        const name = `${user.name}`;
        const section = user.section || ""; // Default section

        console.log("received joinLobby from", socket.id, "payload:", payload);
        lobby[socket.id] = {
          id: socket.id,
          name: name,
          section: section,
        };

        const updated = Object.values(lobby);
        io.emit("lobbyUpdate", updated);
        console.log(
          `Student joined: ${lobby[socket.id].name} [${
            lobby[socket.id].section
          }]`
        );
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

    // Handle game start from teacher
    socket.on("startGame", (gameData) => {
      console.log("🎮 Teacher started game:", gameData);
      console.log("📊 Current lobby students:", Object.keys(lobby));
      console.log("🔗 Total connected clients:", io.engine.clientsCount);

      // Create new game session
      const sessionId = `game_${Date.now()}`;
      const lobbyStudents = Object.keys(lobby);

      if (lobbyStudents.length === 0) {
        socket.emit("gameStartError", { message: "No students in lobby" });
        return;
      }

      // Initialize question states
      const questionStates: Record<string, QuestionState> = {};
      chapter1Level1Questions.forEach((q) => {
        questionStates[q.id] = {
          id: q.id,
          status: "available",
        };
      });

      // Create game session
      gameSessions[sessionId] = {
        id: sessionId,
        chapter: gameData.chapter || "chapter1",
        level: gameData.level || "level1",
        students: lobbyStudents,
        questions: chapter1Level1Questions,
        questionStates,
        startedAt: new Date(),
        isActive: true,
      };

      // First send a test event to check if students receive it
      io.emit("testEvent", { message: "Test event from server" });
      console.log("📤 Sent testEvent to all clients");

      // Notify all students in lobby to start the game
      const gameStartData = {
        sessionId,
        chapter: gameData.chapter || "chapter1",
        level: gameData.level || "level1",
        message: "Game is starting! Get ready...",
      };

      io.emit("gameStarted", gameStartData);
      console.log("📤 Sent gameStarted event to all clients:", gameStartData);

      // Send acknowledgment back to teacher
      socket.emit("gameStartAck", {
        sessionId,
        studentsNotified: lobbyStudents.length,
        totalClients: io.engine.clientsCount,
      });
    });

    // Handle student requesting questions list
    socket.on("getQuestions", (data) => {
      const { sessionId } = data;
      const session = gameSessions[sessionId];

      if (!session || !session.isActive) {
        socket.emit("questionsError", { message: "Game session not found" });
        return;
      }

      // Send questions with current states
      socket.emit("questionsUpdate", {
        questions: session.questions,
        questionStates: session.questionStates,
      });
    });

    // Handle student claiming a question
    socket.on("claimQuestion", (data) => {
      const { sessionId, questionId } = data;
      const session = gameSessions[sessionId];

      if (!session || !session.isActive) {
        socket.emit("claimError", { message: "Game session not found" });
        return;
      }

      const questionState = session.questionStates[questionId];
      if (!questionState || questionState.status !== "available") {
        socket.emit("claimError", { message: "Question not available" });
        return;
      }

      // Claim the question
      questionState.status = "claimed";
      questionState.claimedBy = socket.id;
      questionState.claimedByName =
        lobby[socket.id]?.name || `Student-${socket.id.slice(-4)}`;

      // Broadcast updated state to all students in the session
      session.students.forEach((studentId) => {
        const studentSocket = io.sockets.sockets.get(studentId);
        if (studentSocket) {
          studentSocket.emit("questionsUpdate", {
            questions: session.questions,
            questionStates: session.questionStates,
          });
        }
      });

      console.log(
        `📝 Question ${questionId} claimed by ${questionState.claimedByName}`
      );
    });

    // Handle student submitting answer
    socket.on("submitAnswer", (data) => {
      const { sessionId, questionId, answer } = data;
      const session = gameSessions[sessionId];

      if (!session || !session.isActive) {
        socket.emit("submitError", { message: "Game session not found" });
        return;
      }

      const questionState = session.questionStates[questionId];
      if (!questionState || questionState.claimedBy !== socket.id) {
        socket.emit("submitError", { message: "Question not claimed by you" });
        return;
      }

      const question = session.questions.find((q) => q.id === questionId);
      if (!question) {
        socket.emit("submitError", { message: "Question not found" });
        return;
      }

      // Process the answer
      const isCorrect = answer === question.correctAnswer;
      questionState.status = "completed";
      questionState.answer = answer;
      questionState.isCorrect = isCorrect;
      questionState.completedAt = new Date();

      // Broadcast updated state to all students
      session.students.forEach((studentId) => {
        const studentSocket = io.sockets.sockets.get(studentId);
        if (studentSocket) {
          studentSocket.emit("questionsUpdate", {
            questions: session.questions,
            questionStates: session.questionStates,
          });
        }
      });

      // Send individual result to the student
      socket.emit("answerResult", {
        questionId,
        isCorrect,
        points: isCorrect ? question.points : 0,
        correctAnswer: question.correctAnswer,
      });

      console.log(
        `✅ Question ${questionId} completed by ${
          questionState.claimedByName
        } - ${isCorrect ? "Correct" : "Wrong"}`
      );

      // Check if all questions are completed
      const allCompleted = Object.values(session.questionStates).every(
        (qs) => qs.status === "completed"
      );

      if (allCompleted) {
        // Game completed, send results
        session.isActive = false;
        session.students.forEach((studentId) => {
          const studentSocket = io.sockets.sockets.get(studentId);
          if (studentSocket) {
            studentSocket.emit("gameCompleted", {
              sessionId,
              results: session.questionStates,
            });
          }
        });
        console.log(`🎉 Game session ${sessionId} completed!`);
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
