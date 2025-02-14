import { useAuth } from "@/hooks/use-auth";
import TaskList from "@/components/task-list";
import TaskForm from "@/components/task-form";
import AnalyticsDashboard from "@/components/analytics-dashboard";
import AiSuggestions from "@/components/ai-suggestions";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Welcome, {user?.username}</h1>
          <Button variant="outline" onClick={() => logoutMutation.mutate()}>
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
          <div className="space-y-8">
            <TaskForm />
            <TaskList />
          </div>
          <div className="space-y-8">
            <AiSuggestions />
            <AnalyticsDashboard />
          </div>
        </div>
      </main>
    </div>
  );
}
