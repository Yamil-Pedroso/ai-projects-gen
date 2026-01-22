import { Request, Response } from "express";
import { messages } from "../data/messages";
import openai from "../services/openaiService";
import fs from "fs";
import path from "path";

export const getMessages = async (req: Request, res: Response) => {
  res.status(200).json(messages);
};

export const narrate = async (req: Request, res: Response) => {
  const { text, narrator } = req.body;

  if (!text || !narrator) {
    return res.status(400).json({ message: "Text and narrator are required" });
  }

  try {
    const completion = await openai.audio.speech.create({
      model: "tts-1",
      voice: narrator,
      input: text,
      response_format: "mp3",
    });

    const audioBuffer = Buffer.from(await completion.arrayBuffer());
    const audioFilePath = path.join(process.cwd(), "temp_audio.mp3");

    fs.writeFileSync(audioFilePath, audioBuffer);

    res.setHeader("Content-Type", "audio/mp3");
    res.sendFile(audioFilePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).end();
      }
      fs.unlinkSync(audioFilePath);
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
