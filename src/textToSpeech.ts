let getSound = async (text: string) => {
  const response = await fetch("https://api.neets.ai/v1/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": "9fc6b108565f4757b33b47f718209502",
    },
    body: JSON.stringify({
      text: text,
      voice_id: "us-male-3",
      params: {
        model: "style-diff-500",
      },
    }),
  });

  // Wait for the response to be converted to an ArrayBuffer
  const buffer = await response.arrayBuffer();
  let blob = new Blob([buffer], { type: "audio/mp3" });
  return blob;
};

import OpenAI from "openai";

const getSoundGPT = async (text: string) => {
  const openai = new OpenAI({
    apiKey: `${process.env.OPENAI_API_KEY}`,
    dangerouslyAllowBrowser: true,
  });

  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: text,
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  let blob = new Blob([buffer], { type: "audio/mp3" });
  return blob;
};

export default getSoundGPT;
