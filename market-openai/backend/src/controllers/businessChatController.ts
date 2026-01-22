import { Request, Response } from "express";
import openai from "../services/openaiService";
import { ChatCompletionMessageParam } from "openai/resources/chat";

interface ChatRequestBody {
  userId: number;
  message: string;
}

interface ChatResponse {
  reply?: string;
  error?: string;
}

export const getMessages = async (req: Request, res: Response) => {
  res.status(200).json({ message: "Business Chat ai" });
};

/** Role, Objective, Business's Information, how to interact with customers, limitations, and what to avoid, User's consultation history */

const context: ChatCompletionMessageParam = {
  role: "system",
  content: `
      You are a support assistant for the supermarket 'Coop Supermarkt Zürich Brotgasse'.
      Business information:
         - Location: Seefeldstrasse 35, 8008 Zürich
         - Opening hours: Monday to Saturday from 8:00 to 20:00, Sunday is closed
         - Services: Fresh products, bakery, dairy products, and more
         - Products: Vegetables, fruits, meat, bread, milk, cheese, drinks, eggs, and more
         - Brands: Coop, Bio, Naturaplan, Coca-Cola, Nestlé, Coop Naturaplan, Coop prix garantie, Coop fine food, and more
         - Payment methods: Cash, credit card, Visa, Mastercard, American Express, ZKB, PostFinance, TWINT
         - Contact: 044 388 58 58
      You can only answer questions related to the store. Any other questions are prohibited.
  `,
};

const conversations: Record<string, ChatCompletionMessageParam[]> = {};

export const businessChatbot = async (
  req: Request<{}, {}, ChatRequestBody>,
  res: Response<ChatResponse>
) => {
  const { userId, message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const safeUserId = String(userId);

  console.log("userId", userId);

  if (!conversations[userId]) {
    conversations[userId] = [
      context,
      {
        role: "system",
        content:
          "You must respond as briefly and directly as possible, using the fewest tokens.",
      },
    ];
  }

  conversations[userId].push({ role: "user", content: message });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversations[safeUserId],
      max_tokens: 200,
    });

    const reply = response.choices[0]?.message?.content || "No respose from AI";

    conversations[safeUserId].push({ role: "assistant", content: reply });

    // Limit messages numbers
    if (conversations[safeUserId].length > 12) {
      conversations[safeUserId] = [
        context,
        ...conversations[safeUserId].slice(-10),
      ];
    }

    console.log("Conversations", conversations);

    res.status(200).json({ reply: reply ?? undefined });
  } catch (error) {
    console.error("Business Chatbot error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
