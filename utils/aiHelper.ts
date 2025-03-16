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

Base your recommendations on what you observe in the image - be specific about the type of acne or skin conditions present and tailor the tasks accordingly.

DO NOT include any text outside the BEGIN/END markers. Your response should ONLY contain the three sections with their BEGIN/END markers and the tasks within them. Any explanations or additional text will break the parsing system.`;
}

/**
 * Parses AI response to extract task items when using the task-specific prompt
 */
export function parseTasksFromAIResponse(aiResponse: string): { id: string; text: string; completed: boolean }[] {
  try {
    console.log("Parsing AI response for tasks...");
    const tasks: { id: string; text: string; completed: boolean }[] = [];
    
    // Normalize the response - remove any extra whitespace and ensure consistent newlines
    const normalizedResponse = aiResponse.trim().replace(/\r\n/g, '\n');
    
    // Log the first 100 characters for debugging
    console.log("Response preview:", normalizedResponse.substring(0, 100));
    
    // Extract morning tasks
    const morningTasksMatch = normalizedResponse.match(/BEGIN_MORNING_TASKS\n([\s\S]*?)\nEND_MORNING_TASKS/);
    if (morningTasksMatch && morningTasksMatch[1]) {
      console.log("Found morning tasks section");
      const morningTaskLines = morningTasksMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('TASK:'));
        
      console.log(`Found ${morningTaskLines.length} morning tasks`);
      
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
    } else {
      console.log("Morning tasks section not found");
    }
    
    // Extract evening tasks
    const eveningTasksMatch = normalizedResponse.match(/BEGIN_EVENING_TASKS\n([\s\S]*?)\nEND_EVENING_TASKS/);
    if (eveningTasksMatch && eveningTasksMatch[1]) {
      console.log("Found evening tasks section");
      const eveningTaskLines = eveningTasksMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('TASK:'));
        
      console.log(`Found ${eveningTaskLines.length} evening tasks`);
      
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
    } else {
      console.log("Evening tasks section not found");
    }
    
    // Extract weekly tasks
    const weeklyTasksMatch = normalizedResponse.match(/BEGIN_WEEKLY_TASKS\n([\s\S]*?)\nEND_WEEKLY_TASKS/);
    if (weeklyTasksMatch && weeklyTasksMatch[1]) {
      console.log("Found weekly tasks section");
      const weeklyTaskLines = weeklyTasksMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('TASK:'));
        
      console.log(`Found ${weeklyTaskLines.length} weekly tasks`);
      
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
    } else {
      console.log("Weekly tasks section not found");
    }
    
    // Try alternative parsing if needed (looking for sections without the exact format)
    if (tasks.length === 0) {
      console.warn("No structured tasks found, trying alternative parsing methods");
      
      // Look for sections that might contain the keywords but not the exact format
      const morningSection = normalizedResponse.match(/morning[^]*?tasks?[^]*?(.*?)(evening|weekly|$)/i);
      const eveningSection = normalizedResponse.match(/evening[^]*?tasks?[^]*?(.*?)(morning|weekly|$)/i);
      const weeklySection = normalizedResponse.match(/weekly[^]*?tasks?[^]*?(.*?)(morning|evening|$)/i);
      
      // Function to extract task-like lines
      const extractTaskLines = (section: RegExpMatchArray | null): string[] => {
        if (!section || !section[1]) return [];
        return section[1]
          .split('\n')
          .map(line => line.trim())
          .filter(line => 
            line.length > 10 && 
            !line.startsWith('#') && 
            !line.match(/task/i) &&
            !line.match(/routine/i) &&
            !line.match(/^[0-9]+\./)
          );
      };
      
      // Extract potential tasks
      const morningLines = extractTaskLines(morningSection);
      const eveningLines = extractTaskLines(eveningSection);
      const weeklyLines = extractTaskLines(weeklySection);
      
      // Add tasks with appropriate IDs
      morningLines.forEach((line, index) => {
        tasks.push({
          id: `morning_${index + 1}`,
          text: `${line} 🌞`,
          completed: false
        });
      });
      
      eveningLines.forEach((line, index) => {
        tasks.push({
          id: `evening_${index + 1}`,
          text: `${line} 🌙`,
          completed: false
        });
      });
      
      weeklyLines.forEach((line, index) => {
        tasks.push({
          id: `weekly_${index + 1}`,
          text: `${line} 📅`,
          completed: false
        });
      });
    }
    
    // Last resort: extract any line that looks like a skincare task
    if (tasks.length === 0) {
      console.warn("Structured task format not found, falling back to basic parsing");
      
      // Look for lines that might be tasks
      const potentialTaskLines = normalizedResponse
        .split('\n')
        .map(line => line.trim())
        .filter(line => 
          // Filter lines that look like tasks
          (line.includes('cleanse') || 
           line.includes('apply') || 
           line.includes('use') || 
           line.includes('moisturize') ||
           line.includes('exfoliate') ||
           line.includes('sunscreen')) &&
          line.length > 10 &&
          !line.includes('BEGIN_') &&
          !line.includes('END_')
        );
      
      return potentialTaskLines.map((line, index) => {
        // Determine the likely category
        let category = 'other';
        if (line.toLowerCase().includes('morning') || line.includes('🌞')) {
          category = 'morning';
        } else if (line.toLowerCase().includes('evening') || line.toLowerCase().includes('night') || line.includes('🌙')) {
          category = 'evening';
        } else if (line.toLowerCase().includes('weekly') || line.toLowerCase().includes('once a week') || line.includes('📅')) {
          category = 'weekly';
        }
        
        // Add appropriate emoji if missing
        let taskText = line;
        if (category === 'morning' && !taskText.includes('🌞')) {
          taskText += ' 🌞';
        } else if (category === 'evening' && !taskText.includes('🌙')) {
          taskText += ' 🌙';
        } else if (category === 'weekly' && !taskText.includes('📅')) {
          taskText += ' 📅';
        }
        
        return {
          id: `${category}_${index + 1}`,
          text: taskText,
          completed: false
        };
      });
    }
    
    console.log(`Total tasks extracted: ${tasks.length}`);
    return tasks;
  } catch (error) {
    console.error("Error parsing tasks from AI response:", error);
    // Return fallback tasks in case of error
    return [
      { id: "morning_1", text: "Cleanse with gentle cleanser 🌞", completed: false },
      { id: "morning_2", text: "Apply moisturizer 🌞", completed: false },
      { id: "morning_3", text: "Apply sunscreen SPF 30+ 🌞", completed: false },
      { id: "evening_1", text: "Double cleanse to remove makeup/sunscreen 🌙", completed: false },
      { id: "evening_2", text: "Apply treatment serum 🌙", completed: false },
      { id: "evening_3", text: "Apply moisturizer 🌙", completed: false },
      { id: "weekly_1", text: "Exfoliate once a week 📅", completed: false },
      { id: "weekly_2", text: "Use a hydrating mask 📅", completed: false },
    ];
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
          content: "You are a dermatology AI assistant specialized in creating personalized skincare routines based on facial analysis. Your primary goal is to create actionable, specific tasks for the user's skincare routine based on what you observe in their skin. DO NOT include any explanatory text - ONLY output the exact format with BEGIN/END markers as specified in the user's request. Any additional text will break the system."
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
      temperature: 0.4, // Lower temperature for more consistent formatting
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
            content: "You are a dermatology AI assistant creating structured skincare routines. You MUST follow the EXACT format below with no deviations. Your entire response should ONLY contain these sections with tasks, nothing else."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this photo and create a structured skincare routine. Your response MUST follow this EXACT format, with no additional text or explanations:

BEGIN_MORNING_TASKS
TASK: Cleanse with gentle cleanser 🌞
TASK: Apply treatment product 🌞
TASK: Apply moisturizer 🌞
TASK: Apply sunscreen 🌞
END_MORNING_TASKS

BEGIN_EVENING_TASKS
TASK: Remove makeup/sunscreen 🌙
TASK: Cleanse face 🌙
TASK: Apply treatment 🌙
TASK: Apply moisturizer 🌙
END_EVENING_TASKS

BEGIN_WEEKLY_TASKS
TASK: Exfoliate once a week 📅
TASK: Use hydrating mask 📅
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
      const retryTasks = parseTasksFromAIResponse(retryResult);
      
      // If we still don't have tasks, try one more time with a simpler approach
      if (retryTasks.length === 0) {
        console.warn("Second task generation attempt returned no tasks, trying final approach");
        
        const finalResponse = await openaiClient.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are generating a skincare routine in a specific format. Output ONLY the exact format below."
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Look at this skin photo and provide ONLY this format with your recommendations - nothing else:

BEGIN_MORNING_TASKS
TASK: Task 1 🌞
TASK: Task 2 🌞
TASK: Task 3 🌞
END_MORNING_TASKS

BEGIN_EVENING_TASKS
TASK: Task 1 🌙
TASK: Task 2 🌙
TASK: Task 3 🌙
END_EVENING_TASKS

BEGIN_WEEKLY_TASKS
TASK: Task 1 📅
TASK: Task 2 📅
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
          temperature: 0.2,
        });
        
        const finalResult = finalResponse.choices[0]?.message?.content || "No analysis available";
        return parseTasksFromAIResponse(finalResult);
      }
      
      return retryTasks;
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