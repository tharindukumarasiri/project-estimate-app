"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function askOpenAi(question: string) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: question,
      },
    ],
    model: "gpt-3.5-turbo-0125",
  });
  return chatCompletion;
}
