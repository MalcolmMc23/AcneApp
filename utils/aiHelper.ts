/**
 * AI Helper Utilities
 * 
 * Functions to enhance AI analysis capabilities with skin condition expertise
 * and personalized recommendations.
 */

import { skinConditions, getRecommendedRoutine } from './skinConditions';
import OpenAI from 'openai';

/**
 * Enhances the AI response with additional specific information based on
 * detected skin conditions.
 */
export function enhanceAiResponse(aiResponse: string): string {
  // Extract potential conditions mentioned in the AI response
  const detectedConditions: string[] = [];
  
  Object.keys(skinConditions).forEach(conditionKey => {
    const condition = skinConditions[conditionKey];
    // Check if the condition is mentioned in the response
    if (
      aiResponse.toLowerCase().includes(condition.name.toLowerCase()) ||
      aiResponse.toLowerCase().includes(conditionKey.toLowerCase())
    ) {
      detectedConditions.push(conditionKey);
    }
  });
  
  // If no conditions were detected, return the original response
  if (detectedConditions.length === 0) {
    return aiResponse;
  }
  
  // Get a personalized routine based on detected conditions
  const routine = getRecommendedRoutine(detectedConditions);
  
  // Format the enhanced response
  const enhancedResponse = `
${aiResponse}

---

🔬 DETAILED TREATMENT INFORMATION:

Based on the analysis of your skin, here's more specific information about the identified condition(s):
${detectedConditions.map(conditionId => {
  const condition = skinConditions[conditionId];
  return `
• ${condition.name}:
  ${condition.description}
  
  Recommended ingredients: ${condition.treatments.topical.slice(0, 3).join(', ')}
`;
}).join('')}

💧 PERSONALIZED SKINCARE ROUTINE:

Morning:
${routine.morning.map(step => `• ${step}`).join('\n')}

Evening:
${routine.evening.map(step => `• ${step}`).join('\n')}

Weekly:
${routine.weekly.map(step => `• ${step}`).join('\n')}

⚠️ Remember: This is personalized based on the image analysis, but a dermatologist can provide the most accurate diagnosis and treatment plan for your specific needs.
`;

  return enhancedResponse;
}

/**
 * Generates a better prompt for the AI based on the user's concerns and 
 * references skin condition expertise.
 */
export function generateEnhancedPrompt(userConcerns?: string[]): string {
  const baseSkinConcerns = [
    "acne type identification (papules, pustules, nodules, cysts, comedones)",
    "severity assessment",
    "potential causes",
    "specific treatment recommendations",
    "personalized routine"
  ];

  const concerns = userConcerns || baseSkinConcerns;
  
  // Create a condensed reference of skin conditions for the AI
  const conditionReference = Object.keys(skinConditions)
    .map(key => {
      const condition = skinConditions[key];
      return `${condition.name}: ${condition.description.substring(0, 50)}... Key ingredients: ${condition.treatments.topical.slice(0, 2).join(', ')}`;
    })
    .join('; ');

  return `Analyze this photo of my face and provide a detailed skin assessment with personalized recommendations. Please include:

1. SPECIFIC DIAGNOSIS: Identify the exact types of acne present (e.g., inflammatory papules, pustules, nodules, cystic acne, comedones, blackheads, whiteheads) and their specific locations on my face.

2. SEVERITY ASSESSMENT: Rate the severity on a scale from mild to severe and explain why.

3. ROOT CAUSES: Provide a detailed analysis of potential underlying causes including hormonal factors, diet, product usage, or environmental factors that might be contributing to my specific acne pattern.

4. PERSONALIZED TREATMENT PLAN: Recommend specific active ingredients (with percentages if relevant) and product types for my specific skin needs. Include morning and evening routines.

5. LIFESTYLE RECOMMENDATIONS: Suggest specific dietary changes, stress management techniques, or habit adjustments that would benefit my particular skin condition.

6. PROFESSIONAL TREATMENT OPTIONS: Suggest specific in-office treatments that would address my particular skin concerns if they appear moderate to severe.

Reference information on skin conditions: ${conditionReference}

Make your advice extremely specific to what you observe in the image rather than generic. Use a compassionate but direct tone. Conclude with a brief encouraging message.`;
}

/**
 * Enhanced image analysis function that can be used as a replacement for the basic OpenAI analysis
 */
export async function analyzeImageWithEnhancement(
  openaiClient: OpenAI,
  base64Image: string,
  userConcerns?: string[]
): Promise<string> {
  try {
    // Use an enhanced prompt with skin condition expertise
    const enhancedPrompt = generateEnhancedPrompt(userConcerns);
    
    // Call the OpenAI API
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a dermatology AI assistant specialized in acne and skin conditions analysis. Provide detailed, specific, and personalized advice based on visual skin assessments. Always be thorough, empathetic, and practical in your recommendations.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: enhancedPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });
    
    // Extract the AI's analysis
    const result = response.choices[0]?.message?.content || "No analysis available";
    
    // Enhance the AI's response with additional information
    const enhancedResult = enhanceAiResponse(result);
    
    return enhancedResult;
  } catch (error) {
    console.error("Error in enhanced image analysis:", error);
    throw error;
  }
}

export default {
  enhanceAiResponse,
  generateEnhancedPrompt,
  analyzeImageWithEnhancement
}; 