import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export interface TaskSuggestion {
  task: Task;
  priority: number;
  recommendedOrder: number;
  urgencyDescription: string;
  suggestion: string;
}

export function useAiSuggestions() {
  return useQuery<TaskSuggestion[], Error>({
    queryKey: ["/api/tasks/prioritize"],
    queryFn: async () => {
      const res = await apiRequest("POST", "/api/tasks/prioritize");
      return res.json();
    }
  });
}