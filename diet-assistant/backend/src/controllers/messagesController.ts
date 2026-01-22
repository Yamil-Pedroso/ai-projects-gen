// controllers/messagesController.ts
import type { RequestHandler } from "express";
import { messages } from "../data/messages";
import openai from "../services/openaiService";
import { NutritionSession } from "../models/NutritionSession";

const steps = [
  {
    key: "goal",
    q: "What is your primary goal? (lose weight / gain muscle / maintain / body recomposition)",
    type: "choice",
    options: ["lose weight", "gain muscle", "maintain", "body recomposition"],
  },
  { key: "age", q: "How old are you?", type: "number", min: 12, max: 100 },
  {
    key: "sex",
    q: "What is your biological sex? (M/F)",
    type: "choice",
    options: ["M", "F"],
  },
  {
    key: "height_cm",
    q: "What is your height in centimeters?",
    type: "number",
    min: 120,
    max: 230,
  },
  {
    key: "weight_kg",
    q: "What is your current weight in kilograms?",
    type: "number",
    min: 30,
    max: 300,
  },
  {
    key: "target_weight_kg",
    q: "What is your target weight in kilograms?",
    type: "number",
    min: 30,
    max: 300,
  },
  {
    key: "allergies",
    q: "Do you have any food allergies or intolerances? (comma-separated or 'none')",
    type: "text",
  },
  {
    key: "medical",
    q: "Any medical conditions or medications that affect diet? (or 'none')",
    type: "text",
  },
  {
    key: "activity",
    q: "What is your daily activity level? (sedentary / light / moderate / high)",
    type: "choice",
    options: ["sedentary", "light", "moderate", "high"],
  },
  {
    key: "workouts",
    q: "How many workouts per week? What type and duration?",
    type: "text",
  },
  {
    key: "diet_style",
    q: "Any dietary style or restrictions? (omnivorous / vegetarian / vegan / pescetarian / halal / kosher / keto / low-carb / other)",
    type: "text",
  },
  { key: "likes", q: "Which cuisines or foods do you enjoy?", type: "text" },
  { key: "dislikes", q: "Which foods do you want to avoid?", type: "text" },
  {
    key: "meals_per_day",
    q: "How many meals per day do you prefer? (2–5)",
    type: "number",
    min: 2,
    max: 5,
  },
] as const;

export const getMessages: RequestHandler = async (_req, res) => {
  res.status(200).json(messages);
};

/** Helpers */
function nextQuestion(stepIndex: number): string {
  const next = steps[stepIndex];
  return next
    ? next.q
    : "All set. Type 'plan' to receive your personalized nutrition plan, or 'reset' to start over.";
}

function validateAndSave(
  answers: Map<string, any>,
  stepDef: (typeof steps)[number],
  raw: string
) {
  const v = raw?.toString().trim();
  switch (stepDef.type) {
    case "number": {
      const num = Number(v.replace(",", "."));
      if (Number.isNaN(num))
        return { ok: false, error: "Please provide a number." };
      if (stepDef.min !== undefined && num < stepDef.min)
        return { ok: false, error: `Value must be >= ${stepDef.min}.` };
      if (stepDef.max !== undefined && num > stepDef.max)
        return { ok: false, error: `Value must be <= ${stepDef.max}.` };
      answers.set(stepDef.key, num);
      return { ok: true };
    }
    case "choice": {
      const norm = v.toLowerCase();
      const match = stepDef.options.find((o) => o.toLowerCase() === norm);
      if (!match)
        return {
          ok: false,
          error: `Please choose one of: ${stepDef.options.join(", ")}.`,
        };
      answers.set(stepDef.key, match);
      return { ok: true };
    }
    case "text":
    default: {
      answers.set(stepDef.key, v || "");
      return { ok: true };
    }
  }
}

function buildPrompt(raw: Record<string, any>) {
  const normalizeList = (x: string) =>
    !x || x.toLowerCase() === "none"
      ? []
      : x
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

  const payload = {
    goal: raw.goal,
    age: raw.age,
    sex: raw.sex,
    height_cm: raw.height_cm,
    weight_kg: raw.weight_kg,
    target_weight_kg: raw.target_weight_kg,
    allergies: normalizeList(raw.allergies),
    medical: raw.medical || "none",
    activity: raw.activity,
    workouts: raw.workouts || "",
    diet_style: raw.diet_style || "omnivorous",
    likes: normalizeList(raw.likes),
    dislikes: normalizeList(raw.dislikes),
    meals_per_day: raw.meals_per_day,
  };

  const system = `
You are a registered dietitian assistant. Create a realistic, safe 7-day meal plan tailored to the user's data.
Follow these rules:
- If there are medical conditions or pregnancy/lactation, avoid contraindicated advice and recommend consulting a clinician.
- Estimate daily calories and macros (protein, carbs, fat). Briefly explain the calculation and goal alignment.
- Provide 7 days × (Breakfast, Lunch, Dinner, optional Snacks), with approximate quantities and short recipes.
- Adapt to dietary style, preferences/aversions, activity, and meal count preference.
- Offer simple substitutions if an ingredient is unavailable.
- Include a shopping list grouped by category and a simple prep plan (batch cooking).
- Provide adjustment guidelines (e.g., how to tweak calories if progress stalls).
- Keep language clear and concise. Return **valid JSON** only following the schema.
`;

  const schema = `
{
  "calories_per_day": 0,
  "macros": { "protein_g": 0, "carbs_g": 0, "fat_g": 0 },
  "logic": "short explanation of calorie/macro rationale",
  "guidelines": ["..."],
  "meal_plan_7d": [
    {
      "day": 1,
      "meals": [
        { "name": "Breakfast", "items": [{"food":"...", "qty":"..."}], "recipe":"...", "prep_time_min": 10 },
        { "name": "Lunch",     "items": [{"food":"...", "qty":"..."}], "recipe":"...", "prep_time_min": 20 },
        { "name": "Dinner",    "items": [{"food":"...", "qty":"..."}], "recipe":"...", "prep_time_min": 20 },
        { "name": "Snack",     "items": [{"food":"...", "qty":"..."}] }
      ]
    }
  ],
  "shopping_list": [{ "category":"produce", "items":["..."] }],
  "substitutions": [{ "ingredient":"...", "alternatives":["...", "..."] }],
  "prep_plan": ["..."],
  "adjustments": ["..."],
  "disclaimers": ["This is not a substitute for professional medical advice..."]
}
`;

  const user = JSON.stringify(payload, null, 2);

  return {
    system,
    user: `User data:\n${user}\n\nReturn ONLY valid JSON following this schema (do not add extra text):\n${schema}`,
  };
}

/** POST /api/nutrition-chat */
export const nutritionPlan: RequestHandler = async (req, res) => {
  const userId = String(req.body.id || "");
  const userInput = String(req.body.input || "").trim();
  if (!userId) {
    res.status(400).json({ error: "Missing id" });
    return;
  }

  // Cargar o crear sesión
  let session = await NutritionSession.findOne({ userId });
  if (!session) {
    session = await NutritionSession.create({ userId, step: 0, answers: {} });
  }

  // Comandos
  if (/^reset$/i.test(userInput)) {
    session.step = 0;
    session.answers = new Map();
    await session.save();
    res.json({ iaQuestion: steps[0].q });
    return;
  }

  if (/^plan$/i.test(userInput)) {
    if (session.step < steps.length) {
      res.json({
        iaQuestion: `We still need more info. ${nextQuestion(session.step)}`,
      });
      return;
    }
    // Construir prompt
    const rawAnswers = Object.fromEntries(session.answers.entries());
    const { system, user } = buildPrompt(rawAnswers);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      });

      const content = completion.choices?.[0]?.message?.content || "";
      let plan: any = content;
      try {
        plan = JSON.parse(content);
      } catch {
        // mantener texto original
      }

      // opcional: persistir plan
      session.lastPlan = plan;
      await session.save();

      res.json({ nutritionPlan: plan });
      return;
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to generate the nutrition plan." });
      return;
    }
  }

  // Flujo normal de preguntas
  const currentStep = steps[session.step];
  if (!currentStep) {
    res.json({
      iaQuestion:
        "All set. Type 'plan' to receive your plan, or 'reset' to start over.",
    });
    return;
  }

  const ok = validateAndSave(session.answers, currentStep, userInput);
  if (!ok.ok) {
    res.json({ iaQuestion: `Invalid input: ${ok.error} ${currentStep.q}` });
    return;
  }

  session.step += 1;
  await session.save();

  res.json({ iaQuestion: nextQuestion(session.step) });
};
