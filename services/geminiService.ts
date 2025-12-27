
import { GoogleGenAI } from "@google/genai";
import { DecompositionResult } from "../types";

export const analyzeSpatialContext = async (data: DecompositionResult) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    As a robotics and computer vision expert, analyze this 3x4 transformation matrix data:
    
    Translation (X, Y, Z): ${data.translation.x}, ${data.translation.y}, ${data.translation.z}
    Euler Angles (Degrees - Roll, Pitch, Yaw): ${data.eulerDegrees.roll}, ${data.eulerDegrees.pitch}, ${data.eulerDegrees.yaw}
    
    Rotation Matrix:
    [${data.matrix.r11}, ${data.matrix.r12}, ${data.matrix.r13}]
    [${data.matrix.r21}, ${data.matrix.r22}, ${data.matrix.r23}]
    [${data.matrix.r31}, ${data.matrix.r32}, ${data.matrix.r33}]
    
    Please provide:
    1. A brief interpretation of what this orientation looks like (e.g., "pointing mostly forward but tilted slightly down").
    2. Check if the rotation matrix is orthogonal (unitary check).
    3. Potential physical context (is this a typical camera pose, sensor mount, etc?).
    4. Mathematical summary of the transformation.
    
    Keep the explanation professional and concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Could not perform AI analysis at this time.";
  }
};
