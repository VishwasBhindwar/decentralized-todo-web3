import { useAiSuggestions, type TaskSuggestion } from "@/hooks/use-ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle, Clock } from "lucide-react";

export default function AiSuggestions() {
  const { data: suggestions, isLoading } = useAiSuggestions();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          AI Task Prioritization
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : suggestions && suggestions.length > 0 ? (
          <div className="space-y-4">
            {suggestions
              .sort((a, b) => (b.recommendedOrder || 0) - (a.recommendedOrder || 0))
              .map((suggestion, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-md ${
                    suggestion.priority >= 4
                      ? 'bg-red-500/10 border border-red-500/20'
                      : suggestion.priority === 3
                      ? 'bg-orange-500/10 border border-orange-500/20'
                      : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {suggestion.priority >= 4 && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <h3 className="font-medium">{suggestion.task.title}</h3>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {suggestion.urgencyDescription}
                  </div>
                  <div className="text-sm mt-2">{suggestion.suggestion}</div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No tasks available for suggestions. Add some tasks to get AI recommendations!
          </p>
        )}
      </CardContent>
    </Card>
  );
}