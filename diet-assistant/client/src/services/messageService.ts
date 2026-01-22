/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "../api/axiosConfig";

export interface IMessage {
  message: string;
}

/** Opcional: sigues usando /messages para instrucciones */
export const getMessages = async (): Promise<IMessage[]> => {
  try {
    const response = await axiosInstance.get("/messages");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

/** Nuevo: respuesta del backend del chat nutricional */
export interface INutritionResponse {
  iaQuestion?: string;
  nutritionPlan?: any; // puede venir JSON o string
  error?: string;
}

/** Envía un turno de conversación: { id, input } */
export const sendNutritionMessage = async (
  userId: string,
  input: string
): Promise<INutritionResponse> => {
  try {
    const { data } = await axiosInstance.post("/nutrition-chat", {
      id: userId,
      input,
    });
    return data as INutritionResponse;
  } catch (error) {
    console.error(error);
    return { error: "Network error" };
  }
};

// Obtener último plan persistido
export const getLastNutritionPlan = async (userId: string) => {
  try {
    const response = await axiosInstance.get(`/nutrition-plan/${userId}`);
    return response.data as { nutritionPlan: any };
  } catch (error) {
    console.error("Error fetching last nutrition plan:", error);
    return { nutritionPlan: null };
  }
};
