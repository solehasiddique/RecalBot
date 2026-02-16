import axios from "axios";

export const generateQuestions = async (notes, memoryLevel) => {
  try {
    console.log("CALLING AI WITH:", { notes, memoryLevel });

    const response = await axios.post(
      "http://127.0.0.1:8001/generate",
      {
        notes: notes || "",
        memoryLevel: Number(memoryLevel)
      }
    );

    console.log("AI RAW RESPONSE:", response.data);

    return response.data;

  } catch (error) {
    console.error("AI Service FULL ERROR:", error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};
