import { Request, Response } from "express";
import { messages } from "../data/messages";
import openai from "../services/openaiService";

export const getMessages = async (req: Request, res: Response) => {
  res.status(200).json(messages);
};

export const translate = async (req: Request, res: Response) => {
  const { text, targetLang } = req.body;

  const promptSystem1 = "You are a proffesional translator. You have been hired to translate a text from one language to another.";
  const promptSystem2 = "Only you can awnser with a direct translation of the text that the user has provided."
                        + "Any other response or conversation will be considered forbidden.";
  const promptUser = `Translate the following text to ${targetLang}: ${text}`;

  try {
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: promptSystem1 },
            { role: "system", content: promptSystem2 },
            { role: "user", content: promptUser },
        ],
        max_tokens: 500,
        response_format: { type: "text" },
    });

    const translatedText = completion.choices[0].message.content;

    res.status(200).json({ translatedText });

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
