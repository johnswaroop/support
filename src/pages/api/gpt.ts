// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

type Data = any;

const openai = new OpenAI({
  apiKey: `${process.env.OPENAI_API_KEY}`,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  let messages = req.body.messages;

  let prePrompt: any = [
    { role: "system", content: "You are a helpful assistant." },
    ...messages,
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    max_tokens: 1500,
    messages: prePrompt,
  });
  console.log(response);
  res.status(200).json({ result: response.choices[0] });
}
