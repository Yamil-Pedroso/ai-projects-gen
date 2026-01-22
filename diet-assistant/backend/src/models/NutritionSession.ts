// models/NutritionSession.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface Answers {
  [key: string]: any;
}

export interface INutritionSession extends Document {
  userId: string;
  step: number;
  answers: Map<string, any>;
  lastPlan?: any; // opcional: guardar último plan generado
  createdAt: Date;
  updatedAt: Date;
}

const NutritionSessionSchema = new Schema<INutritionSession>(
  {
    userId: { type: String, required: true, index: true },
    step: { type: Number, default: 0 },
    answers: { type: Map, of: Schema.Types.Mixed, default: {} },
    lastPlan: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Evita recompilar en dev con HMR/ts-node
export const NutritionSession: Model<INutritionSession> =
  mongoose.models.NutritionSession ||
  mongoose.model<INutritionSession>("NutritionSession", NutritionSessionSchema);
