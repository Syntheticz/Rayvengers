"use server";

import path from "path";
import { promises as fs } from "fs";
import { Lobby, LobbyStatus } from "@prisma/client";
import { prisma } from "./prisma";
import { LobbyWithRelation } from "@/types/lobby";
import { tree } from "next/dist/build/templates/app-page";

//Types
export interface Question {
  questionId: string;
  chapterId: string;
  questionTitle: string;
  description: string;
  answer: string;
}

async function loadQuestions(): Promise<Question[]> {
  const filePath = path.join(process.cwd(), "data", "questionare.json");
  const fileData = await fs.readFile(filePath, "utf-8");
  return JSON.parse(fileData) as Question[];
}

export async function getQuestionById(id: string) {
  const questions = await loadQuestions();
  return questions.find((q) => q.questionId === id) ?? null;
}

export async function validateAnswer(id: string, givenAnswer: string) {
  const question = await getQuestionById(id);

  if (!question) {
    return { success: false, message: "Question not found" };
  }

  const isCorrect =
    question.answer.trim().toLowerCase() === givenAnswer.trim().toLowerCase();

  return {
    success: isCorrect,
    correctAnswer: question.answer,
    message: isCorrect ? "Correct!" : "Incorrect",
  };
}

export async function createLobby(data: Lobby) {
  try {
    const lobby = await prisma.lobby.create({
      data: {
        createdBy: data.createdBy,
        name: data.name,
        status: "WAITING",
        maxPlayers: data.maxPlayers,
      },
    });
    return { success: true, data: lobby };
  } catch (error) {
    console.log(error);
    return { success: false, error: (error as Error).message, data: null };
  }
}

export async function getLobbies(status?: LobbyStatus) {
  try {
    const data: LobbyWithRelation[] = await prisma.lobby.findMany({
      where: status ? { status } : undefined, // only filter if provided
      include: {
        users: {
          include: {
            lobby: true,
            user: true,
          },
        },
      },
    });

    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: (error as Error).message, data: null };
  }
}

export async function getLobby(id: string) {
  try {
    const data = await prisma.lobby.findUnique({
      where: { id },
    });

    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: (error as Error).message, data: null };
  }
}

export async function updateLobby(data: {
  id: string;
  updates: Partial<Lobby>;
}) {
  try {
    const lobby = await prisma.lobby.update({
      where: { id: data.id },
      data: data.updates,
    });

    return { success: true, data: lobby };
  } catch (error) {
    console.error(error);
    return { success: false, error: (error as Error).message, data: null };
  }
}

export async function deleteLobby(data: { id: string }) {
  try {
    const lobby = await prisma.lobby.delete({
      where: { id: data.id },
    });

    return { success: true, data: lobby };
  } catch (error) {
    console.error(error);
    return { success: false, error: (error as Error).message, data: null };
  }
}

export async function deleteAllLobbies() {
  try {
    const result = await prisma.lobby.deleteMany(); // no filter = all rows

    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: (error as Error).message, data: null };
  }
}

export async function joinUserLobby(data: { userId: string; lobbyId: string }) {
  try {
    const { lobbyId, userId } = data;
    const user = await prisma.lobbyUser.create({
      data: {
        lobbyId,
        userId,
      },
    });

    return { success: true, data: user };
  } catch (error) {
    console.error(error);
    return { success: false, error: (error as Error).message, data: null };
  }
}

export async function transferUserLobby(data: {
  userId: string;
  lobbyId: string;
}) {
  try {
    const { lobbyId, userId } = data;

    await prisma.$transaction(async (tx) => {
      // Remove user from any existing lobby
      await tx.lobbyUser.deleteMany({
        where: { userId },
      });

      // Add user to the new lobby
      const userLobby = await tx.lobbyUser.create({
        data: {
          lobbyId,
          userId,
        },
      });
    });

    return { success: true, data: {} };
  } catch (error) {
    console.error(error);
    return { success: false, error: (error as Error).message, data: null };
  }
}

export async function removeUserFromLobby(data: {
  userId: string;
  lobbyId: string;
}) {
  try {
    const { userId, lobbyId } = data;

    const result = await prisma.lobbyUser.deleteMany({
      where: {
        userId,
        lobbyId,
      },
    });

    return { success: true, data: result }; // result = { count: number }
  } catch (error) {
    console.error(error);
    return { success: false, error: (error as Error).message, data: null };
  }
}
