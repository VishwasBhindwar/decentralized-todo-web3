import { useQuery, useMutation } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Trash2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { verifyTask } from "@/lib/web3";

export default function TaskList() {
  const { toast } = useToast();
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const updateMutation = useMutation({
    mutationFn: async (task: Partial<Task> & { id: number }) => {
      try {
        // First update the task in the database
        const res = await apiRequest("PATCH", `/api/tasks/${task.id}`, task);
        const updatedTask = await res.json();

        // If task is being marked as completed, verify it on blockchain
        if (task.completed && !updatedTask.transactionHash) {
          console.log('Starting blockchain verification for task:', task.id);
          const transactionHash = await verifyTask(task.id, updatedTask.title);
          if (transactionHash) {
            // Update task with transaction hash
            await apiRequest("PATCH", `/api/tasks/${task.id}`, {
              transactionHash
            });

            toast({
              title: "Task Verified",
              description: "Task completion has been verified on the blockchain",
            });
          }
        }

        return updatedTask;
      } catch (error) {
        console.error('Task update failed:', error);
        throw error;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task Deleted",
        description: "Task has been successfully removed",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks?.map((task) => (
        <Card key={task.id}>
          <CardContent className="p-4 flex items-center gap-4">
            <Checkbox
              checked={task.completed}
              onCheckedChange={(checked) => {
                updateMutation.mutate({ 
                  id: task.id,
                  completed: checked === true
                });
              }}
              disabled={updateMutation.isPending}
            />
            <div className="flex-1">
              <h3 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
              )}
              {task.dueDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Due: {new Date(task.dueDate).toLocaleString()}
                </p>
              )}
              {task.transactionHash && (
                <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
                  <Shield className="h-3 w-3" />
                  <span>Verified on blockchain: {task.transactionHash.slice(0, 10)}...</span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteMutation.mutate(task.id)}
              disabled={deleteMutation.isPending || updateMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}