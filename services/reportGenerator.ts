import { GoogleGenAI, Type } from "@google/genai";
import { ApplicantData, InterviewReport, TranscriptItem } from "../types";

export const generateInterviewReport = async (
  applicant: ApplicantData,
  transcript: TranscriptItem[]
): Promise<InterviewReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // If transcript is empty (e.g. mic issues or short call), provide a mock or minimal report
  const transcriptText = transcript.length > 0 
    ? transcript.map(t => `${t.role.toUpperCase()}: ${t.text}`).join('\n') 
    : "No audible conversation recorded.";

  const prompt = `
    You are an expert HR Analyst. Analyze the following job interview transcript between an HR Manager (Beatrice) and an Applicant (${applicant.name}).
    
    APPLICANT ROLE: ${applicant.role}
    EXPERIENCE: ${applicant.experience}
    
    TRANSCRIPT:
    ${transcriptText}
    
    Based on the interview, generate a structured evaluation report.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Executive summary of the interview performance" },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of key strengths demonstrated" },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of areas for improvement or red flags" },
            score: { type: Type.NUMBER, description: "Overall fit score from 0 to 100" },
            recommendation: { type: Type.STRING, enum: ["HIRE", "CONSIDER", "PASS"], description: "Final hiring recommendation" },
          },
          required: ["summary", "strengths", "weaknesses", "score", "recommendation"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");

    return {
      applicantId: applicant.id,
      summary: data.summary || "Analysis failed or insufficient data.",
      strengths: data.strengths || [],
      weaknesses: data.weaknesses || [],
      score: data.score || 0,
      recommendation: data.recommendation || "CONSIDER",
      transcript: transcript
    };

  } catch (error) {
    console.error("Report generation failed:", error);
    return {
      applicantId: applicant.id,
      summary: "Automated analysis failed due to technical error.",
      strengths: [],
      weaknesses: [],
      score: 0,
      recommendation: "CONSIDER",
      transcript: transcript
    };
  }
};
