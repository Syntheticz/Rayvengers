"use server";

import path from "path";
import { promises as fs } from "fs";

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
