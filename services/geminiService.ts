import { GoogleGenAI, Type } from "@google/genai";
import { User } from "../types";

export const getSkillRecommendations = async (currentUser: User, allUsers: User[]) => {
  const apiKey = process.env.API_KEY;
  const others = allUsers.filter(u => u.id !== currentUser.id && u.role !== 'admin');
  
  // IF LOCAL (No API Key), use a Heuristic Mock AI matching system
  if (!apiKey || apiKey === '') {
    console.warn("Smart Match: No API Key found locally. Using Heuristic Matching Fallback.");
    
    // Logic: Find users who offer what I request, OR request what I offer
    const myRequestedIds = currentUser.skillsRequested.map(s => s.id);
    const myOfferedIds = currentUser.skillsOffered.map(s => s.id);
    
    const heuristicMatches = others.map(other => {
      let score = 0;
      // High score if they offer what I want
      const matchRequests = other.skillsOffered.filter(s => myRequestedIds.includes(s.id)).length;
      score += matchRequests * 10;
      
      // Medium score if I offer what they want (swap potential)
      const matchOffers = other.skillsRequested.filter(s => myOfferedIds.includes(s.id)).length;
      score += matchOffers * 5;

      return { id: other.id, score };
    })
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score);

    // If no direct skill matches, just return the 3 most active users
    if (heuristicMatches.length === 0) {
      return others.slice(0, 3).map(u => u.id);
    }

    return heuristicMatches.slice(0, 3).map(m => m.id);
  }

  // IF API KEY EXISTS, use Gemini Pro for intelligent matching
  try {
    const ai = new GoogleGenAI({ apiKey });
    
    if (others.length === 0) return [];

    const prompt = `
      Act as a talent scout for a skill exchange platform. Match the current user with the 3 best potential partners from the list.
      
      Current User Profile:
      - Name: ${currentUser.name}
      - Bio: ${currentUser.bio}
      - Teaches: ${currentUser.skillsOffered.map(s => s.name).join(', ')}
      - Wants: ${currentUser.skillsRequested.map(s => s.name).join(', ')}

      Potential Partners List:
      ${others.map(u => `
      ID: ${u.id}
      Name: ${u.name}
      Bio: ${u.bio}
      Teaches: ${u.skillsOffered.map(s => s.name).join(', ')}
      Wants: ${u.skillsRequested.map(s => s.name).join(', ')}
      `).join('\n')}

      Evaluate based on:
      1. Direct skill overlaps (they teach what I want).
      2. Mutual benefit (I teach what they want).
      3. Personality/Bio compatibility.

      Return ONLY a JSON object with a key "recommendedIds" containing an array of ID strings.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedIds: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "The IDs of the recommended users"
            }
          },
          required: ["recommendedIds"]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{"recommendedIds": []}');
    return parsed.recommendedIds || [];
  } catch (error) {
    console.error("Smart Match AI Error:", error);
    // Silent fallback on error
    return others.slice(0, 3).map(u => u.id);
  }
};
