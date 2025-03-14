import { Request, Response } from "express";
import openai from "../services/openaiService";

interface ChatRequestBody {
  message: string;
}

interface ChatResponse {
  reply?: string;
  error?: string;
}

export const getMessages = async (req: Request, res: Response) => {
  res.status(200).json({ message: "Business Chat ai" });
};

export const businessChatbot = async (
  req: Request<{}, {}, ChatRequestBody>,
  res: Response<ChatResponse>
) => {
  const context = `
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
    `;

  const { message }: { message?: string } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: context },
        {
          role: "system",
          content:
            "You must respond as briefly and directly as possible, using the fewest tokens.",
        },
        { role: "user", content: message },
      ],
      max_tokens: 200,
    });

    const reply = response.choices[0]?.message?.content || "No respose from AI";

    res.status(200).json({ reply: reply ?? undefined });
  } catch (error) {
    console.error("Business Chatbot error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
