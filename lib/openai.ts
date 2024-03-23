"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: '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',
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
