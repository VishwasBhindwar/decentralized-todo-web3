import OpenAI from "openai";
import { Task } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

export async function generateTaskSuggestions(tasks: Task[]) {
  try {
    const systemPrompt = `You are a task prioritization expert. Analyze the tasks and provide:
    1. Priority level (1-5, where 5 is highest)
    2. Recommended order of completion
    3. An urgency description based on due dates
    4. Specific suggestions for task completion

    Format your response as a JSON object with an array of suggestions, each containing:
    {
      "taskId": number,
      "priority": number,
      "recommendedOrder": number,
      "urgencyDescription": string,
      "suggestion": string
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Analyze these tasks: ${JSON.stringify(tasks.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description,
            dueDate: t.dueDate,
            completed: t.completed
          })))}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from AI service");
    }

    const result = JSON.parse(content);
    return result.suggestions.map((suggestion: any) => {
      const task = tasks.find(t => t.id === suggestion.taskId);
      if (!task) return null;
      return {
        task,
        priority: suggestion.priority,
        recommendedOrder: suggestion.recommendedOrder,
        urgencyDescription: suggestion.urgencyDescription,
        suggestion: suggestion.suggestion,
      };
    }).filter(Boolean);
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    // Fallback to basic prioritization
    return tasks.map((task) => ({
      task,
      priority: getPriorityScore(task),
      recommendedOrder: getBasicOrder(task),
      urgencyDescription: getUrgencyDescription(task),
      suggestion: generateBasicSuggestion(task),
    }));
  }
}

function getPriorityScore(task: Task): number {
  if (task.completed) return 0;
  if (!task.dueDate) return 2;

  const daysUntilDue = Math.ceil(
    (new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilDue <= 1) return 5;
  if (daysUntilDue <= 3) return 4;
  if (daysUntilDue <= 7) return 3;
  return 2;
}

function getBasicOrder(task: Task): number {
  if (task.completed) return -1;
  if (!task.dueDate) return 0;

  return new Date(task.dueDate).getTime();
}

function getUrgencyDescription(task: Task): string {
  if (task.completed) return "Completed";
  if (!task.dueDate) return "No due date set";

  const daysUntilDue = Math.ceil(
    (new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilDue <= 0) return "Overdue!";
  if (daysUntilDue <= 1) return "Due within 24 hours";
  if (daysUntilDue <= 3) return `Due in ${daysUntilDue} days`;
  if (daysUntilDue <= 7) return "Due this week";
  return `Due in ${Math.ceil(daysUntilDue / 7)} weeks`;
}

function generateBasicSuggestion(task: Task): string {
  if (task.completed) {
    return "Task already completed";
  }

  if (!task.dueDate) {
    return "Consider setting a due date to help with prioritization";
  }

  const daysUntilDue = Math.ceil(
    (new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilDue <= 1) {
    return "High priority task! Focus on completing this immediately. Break it down into smaller steps if needed.";
  } else if (daysUntilDue <= 3) {
    return "Important task approaching due date. Start working on this soon to ensure timely completion.";
  } else if (daysUntilDue <= 7) {
    return "Plan your week to include time for this task. Create a timeline for completion.";
  }

  return "You have some time for this task, but don't wait too long. Set milestones to track progress.";
}