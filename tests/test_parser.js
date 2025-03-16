// Test script for verifying the task parser works correctly

const fs = require('fs');
const path = require('path');

// Mock implementation of parseTasksFromAIResponse based on our real function
function parseTasksFromAIResponse(aiResponse) {
    console.log("Parsing AI response for tasks...");
    const tasks = [];

    // Normalize the response - remove any extra whitespace and ensure consistent newlines
    const normalizedResponse = aiResponse.trim().replace(/\r\n/g, '\n');

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

    console.log(`Total tasks extracted: ${tasks.length}`);
    return tasks;
}

// Read the test response file
const testFilePath = path.join(__dirname, 'test_ai_response.txt');
fs.readFile(testFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error("Error reading test file:", err);
        return;
    }

    console.log("Test file content:");
    console.log("-------------------");
    console.log(data);
    console.log("-------------------\n");

    // Parse the tasks
    const tasks = parseTasksFromAIResponse(data);

    // Output the parsed tasks
    console.log("\nParsed Tasks:");
    console.log("-------------------");
    tasks.forEach(task => {
        console.log(`${task.id}: ${task.text} (${task.completed ? '✓' : '✗'})`);
    });
    console.log("-------------------");

    // Verify everything was parsed correctly
    console.log("\nVerification:");
    console.log(`- Expected format followed: ${tasks.length > 0 ? 'Yes' : 'No'}`);
    console.log(`- Morning tasks: ${tasks.filter(t => t.id.startsWith('morning')).length}`);
    console.log(`- Evening tasks: ${tasks.filter(t => t.id.startsWith('evening')).length}`);
    console.log(`- Weekly tasks: ${tasks.filter(t => t.id.startsWith('weekly')).length}`);
}); 