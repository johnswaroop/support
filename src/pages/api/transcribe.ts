import fs from "fs";
const path = require("path");
const os = require("os");
import OpenAI from "openai";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

const openai = new OpenAI({
  apiKey: `${process.env.OPENAI_API_KEY}`,
});

// Function to convert base64 URL to a temporary audio file
const base64ToTempFile = async (base64URL: any) => {
  // Extracting base64 data from the URL
  const base64Data = base64URL.split(";base64,").pop();

  // Creating a temporary file path
  const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.wav`);

  // Decoding and writing the base64 data to a temporary file
  await fs.promises.writeFile(tempFilePath, base64Data, { encoding: "base64" });

  return tempFilePath;
};

// Function to perform transcription
const transcribeAudio = async (base64URL: string) => {
  // Converting base64 URL to a temporary file
  const tempFilePath = await base64ToTempFile(base64URL);

  try {
    // Running the transcription
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
    });

    // Outputting the result
    console.log("Transcription:", transcription);

    // Optionally, delete the temporary file after transcription
    fs.promises.unlink(tempFilePath);
    return transcription;
  } catch (error) {
    console.error("Error during transcription:", error);
  }
};

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  let file = req.body.file;
  let output = await transcribeAudio(file);
  res.status(200).json({ output: output });
}
