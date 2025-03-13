/**
 * AI Helper Utilities
 * 
 * Functions for AI analysis capabilities with skin condition expertise
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
 * Generates a prompt for the AI based on the user's concerns and 
 * references skin condition expertise.
 */
export function generateAnalysisPrompt(userConcerns?: string[]): string {
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
 * Image analysis function for skin assessment
 */
export async function analyzeImageWithEnhancement(
  openaiClient: OpenAI,
  base64Image: string,
  userConcerns?: string[]
): Promise<string> {
  try {
    // Use the analysis prompt
    const analysisPrompt = generateAnalysisPrompt(userConcerns);
    
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
              text: analysisPrompt
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
    console.error("Error in image analysis:", error);
    throw error;
  }
}

/**
 * Extracts a personalized task list from the AI analysis
 * to be used in the routine tracker.
 */
export function generatePersonalizedTasks(aiResponse: string): { id: string; text: string; completed: boolean }[] {
  // Extract conditions from the AI response
  const detectedConditions: string[] = [];
  
  Object.keys(skinConditions).forEach(conditionKey => {
    const condition = skinConditions[conditionKey];
    if (
      aiResponse.toLowerCase().includes(condition.name.toLowerCase()) ||
      aiResponse.toLowerCase().includes(conditionKey.toLowerCase())
    ) {
      detectedConditions.push(conditionKey);
    }
  });
  
  // Get a personalized routine based on detected conditions
  const routine = getRecommendedRoutine(detectedConditions);
  
  // Create task items from the routine steps
  const morningTasks = routine.morning.map((step, index) => ({
    id: `morning_${index}`,
    text: `${step} 🌞`,
    completed: false
  }));
  
  const eveningTasks = routine.evening.map((step, index) => ({
    id: `evening_${index}`,
    text: `${step} 🌙`,
    completed: false
  }));
  
  const weeklyTasks = routine.weekly.map((step, index) => ({
    id: `weekly_${index}`,
    text: `${step} 📅`,
    completed: false
  }));
  
  // Combine all tasks
  return [...morningTasks, ...eveningTasks, ...weeklyTasks];
}

/**
 * Generate a prompt specifically for extracting routine tasks from an image
 */
export function generateTaskExtractionPrompt(): string {
  return `Analyze this photo of my face and provide a personalized skincare routine tasks list. Focus on creating actionable tasks for treating the specific skin conditions you observe.

IMPORTANT: Please format your response in a specific structured format that our system can easily parse:

BEGIN_MORNING_TASKS
TASK: [Morning task 1]
TASK: [Morning task 2]
TASK: [Morning task 3]
END_MORNING_TASKS

BEGIN_EVENING_TASKS
TASK: [Evening task 1]
TASK: [Evening task 2]
TASK: [Evening task 3]
END_EVENING_TASKS

BEGIN_WEEKLY_TASKS
TASK: [Weekly task 1]
TASK: [Weekly task 2]
END_WEEKLY_TASKS

You MUST follow this exact format with the BEGIN/END markers and TASK: prefix for each task.

Include the following in your recommendations:
1. Morning routine - Include cleansing, treatment products, moisturizer, and sunscreen
2. Evening routine - Include makeup removal (if needed), cleansing, treatment products, and moisturizer
3. Weekly treatments - Include exfoliation, masks, or other occasional treatments

Be specific about product ingredients and concentrations (e.g., "Apply 2.5% benzoyl peroxide to affected areas").
Add specific emojis for visual cues: 🌞 for morning tasks, 🌙 for evening tasks, and 📅 for weekly tasks.

Base your recommendations on what you observe in the image - be specific about the type of acne or skin conditions present and tailor the tasks accordingly.`;
}

/**
 * Parses AI response to extract task items when using the task-specific prompt
 */
export function parseTasksFromAIResponse(aiResponse: string): { id: string; text: string; completed: boolean }[] {
  try {
    const tasks: { id: string; text: string; completed: boolean }[] = [];
    
    // Extract morning tasks
    const morningTasksMatch = aiResponse.match(/BEGIN_MORNING_TASKS\n([\s\S]*?)\nEND_MORNING_TASKS/);
    if (morningTasksMatch && morningTasksMatch[1]) {
      const morningTaskLines = morningTasksMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('TASK:'));
        
      morningTaskLines.forEach((line, index) => {
        const taskText = line.replace('TASK:', '').trim();
        // Add morning emoji if not already present
        const textWithEmoji = taskText.includes('🌞') ? taskText : `${taskText} 🌞`;
        tasks.push({
          id: `morning_${index + 1}`,
          text: textWithEmoji,
          completed: false
        });
      });
    }
    
    // Extract evening tasks
    const eveningTasksMatch = aiResponse.match(/BEGIN_EVENING_TASKS\n([\s\S]*?)\nEND_EVENING_TASKS/);
    if (eveningTasksMatch && eveningTasksMatch[1]) {
      const eveningTaskLines = eveningTasksMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('TASK:'));
        
      eveningTaskLines.forEach((line, index) => {
        const taskText = line.replace('TASK:', '').trim();
        // Add evening emoji if not already present
        const textWithEmoji = taskText.includes('🌙') ? taskText : `${taskText} 🌙`;
        tasks.push({
          id: `evening_${index + 1}`,
          text: textWithEmoji,
          completed: false
        });
      });
    }
    
    // Extract weekly tasks
    const weeklyTasksMatch = aiResponse.match(/BEGIN_WEEKLY_TASKS\n([\s\S]*?)\nEND_WEEKLY_TASKS/);
    if (weeklyTasksMatch && weeklyTasksMatch[1]) {
      const weeklyTaskLines = weeklyTasksMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('TASK:'));
        
      weeklyTaskLines.forEach((line, index) => {
        const taskText = line.replace('TASK:', '').trim();
        // Add weekly emoji if not already present
        const textWithEmoji = taskText.includes('📅') ? taskText : `${taskText} 📅`;
        tasks.push({
          id: `weekly_${index + 1}`,
          text: textWithEmoji,
          completed: false
        });
      });
    }
    
    // If no structured tasks found, fall back to original parsing method
    if (tasks.length === 0) {
      console.warn("Structured task format not found, falling back to basic parsing");
      const taskLines = aiResponse.split('\n').filter(line => 
        line.trim().startsWith('TASK:')
      );
      
      return taskLines.map((line, index) => {
        const taskText = line.replace('TASK:', '').trim();
        return {
          id: `task_${index + 1}`,
          text: taskText,
          completed: false
        };
      });
    }
    
    return tasks;
  } catch (error) {
    console.error("Error parsing tasks from AI response:", error);
    // Return empty array in case of error
    return [];
  }
}

/**
 * Image analysis specifically for generating personalized routine tasks
 */
export async function analyzeImageForTasks(
  openaiClient: OpenAI,
  base64Image: string
): Promise<{ id: string; text: string; completed: boolean }[]> {
  try {
    // Use the task extraction prompt
    const taskPrompt = generateTaskExtractionPrompt();
    
    // Call the OpenAI API with a stronger system message to enforce formatting
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a dermatology AI assistant specialized in creating personalized skincare routines based on facial analysis. Your goal is to create actionable, specific tasks for the user's skincare routine based on what you observe in their skin. IMPORTANT: You MUST follow the exact formatting instructions in the user's request, using the BEGIN_TASKS/END_TASKS markers exactly as specified."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: taskPrompt
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
      temperature: 0.5, // Lower temperature for more consistent formatting
    });
    
    // Extract the AI's task list
    const result = response.choices[0]?.message?.content || "No analysis available";
    
    // Parse the tasks from the response
    const tasks = parseTasksFromAIResponse(result);
    
    // If we got no tasks, try again with a more explicit prompt
    if (tasks.length === 0) {
      console.warn("First task generation attempt returned no tasks, trying again with more explicit prompt");
      
      const retryResponse = await openaiClient.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a dermatology AI assistant creating structured skincare routines. You MUST follow the exact format shown below with the BEGIN_TASKS/END_TASKS markers:"
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this photo and create a structured skincare routine. Your response MUST follow this EXACT format:

BEGIN_MORNING_TASKS
TASK: Cleanse with gentle cleanser
TASK: Apply treatment product
TASK: Apply moisturizer
TASK: Apply sunscreen
END_MORNING_TASKS

BEGIN_EVENING_TASKS
TASK: Remove makeup/sunscreen
TASK: Cleanse face
TASK: Apply treatment
TASK: Apply moisturizer
END_EVENING_TASKS

BEGIN_WEEKLY_TASKS
TASK: Exfoliate once a week
TASK: Use hydrating mask
END_WEEKLY_TASKS`
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
        temperature: 0.3,
      });
      
      const retryResult = retryResponse.choices[0]?.message?.content || "No analysis available";
      return parseTasksFromAIResponse(retryResult);
    }
    
    return tasks;
  } catch (error) {
    console.error("Error in image analysis for tasks:", error);
    // Return default tasks in case of error
    return [
      { id: "morning_1", text: "Cleanse with gentle cleanser 🌞", completed: false },
      { id: "morning_2", text: "Apply moisturizer 🌞", completed: false },
      { id: "morning_3", text: "Apply sunscreen SPF 30+ 🌞", completed: false },
      { id: "evening_1", text: "Remove makeup/sunscreen 🌙", completed: false },
      { id: "evening_2", text: "Cleanse face 🌙", completed: false },
      { id: "evening_3", text: "Apply moisturizer 🌙", completed: false },
      { id: "weekly_1", text: "Exfoliate once a week 📅", completed: false },
    ];
  }
}

export default {
  enhanceAiResponse,
  generateAnalysisPrompt,
  analyzeImageWithEnhancement,
  generatePersonalizedTasks,
  generateTaskExtractionPrompt,
  parseTasksFromAIResponse,
  analyzeImageForTasks
}; 