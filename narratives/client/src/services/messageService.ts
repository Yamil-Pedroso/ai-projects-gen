import axiosInstance from "../api/axiosConfig";

export interface IMessage {
  message: string;
}

export const getMessages = async () => {
  try {
    const response = await axiosInstance.get("/messages");
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    return { message: "" };
  }
};

export const narrate = async (
  text: string,
  narrator: string
): Promise<string> => {
  try {
    const res = await axiosInstance.post(
      "/narrate",
      { text, narrator },
      { responseType: "blob", headers: { Accept: "audio/mpeg" } }
    );
    const ct = (res.headers?.["content-type"] || "").toLowerCase();
    const blob = new Blob([res.data], {
      type: ct.includes("audio") ? ct : "audio/mpeg",
    });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error(error);
    return "";
  }
};
