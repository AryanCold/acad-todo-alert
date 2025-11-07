import { useState, useEffect } from "react";
import { Task } from "@/types/task";
import { TaskCard } from "@/components/TaskCard";
import { TaskForm } from "@/components/TaskForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, CheckCircle2, ListTodo, Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem("taskify-tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    // Check notification permission
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem("taskify-tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Enable notifications
  useNotifications(notificationsEnabled ? tasks : []);

  const handleCreateTask = (taskData: Omit<Task, "id" | "createdAt">) => {
    if (editingTask) {
      setTasks(
        tasks.map((task) =>
          task.id === editingTask.id
            ? { ...task, ...taskData }
            : task
        )
      );
      toast({
        title: "Task updated! ✏️",
        description: "Your task has been successfully updated.",
      });
    } else {
      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setTasks([newTask, ...tasks]);
      toast({
        title: "Task created! 🎉",
        description: "Your task has been added to the list.",
      });
    }
    setEditingTask(undefined);
  };

  const handleToggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
    toast({
      title: "Task deleted! 🗑️",
      description: "Task has been removed from your list.",
    });
  };

  const handleEnableNotifications = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        toast({
          title: "Notifications enabled! 🔔",
          description: "You'll now receive reminders for your tasks.",
        });
      }
    }
  };

  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <ListTodo className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Taskify
            </h1>
          </div>
          <p className="text-muted-foreground">Stay organized and ace your semester! 📚</p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap gap-3 mb-6 justify-between items-center">
          <Button
            onClick={() => {
              setEditingTask(undefined);
              setIsFormOpen(true);
            }}
            size="lg"
            className="gap-2"
          >
            <Plus className="h-5 w-5" />
            New Task
          </Button>

          {!notificationsEnabled && (
            <Button
              onClick={handleEnableNotifications}
              variant="outline"
              className="gap-2"
            >
              <Bell className="h-4 w-4" />
              Enable Notifications
            </Button>
          )}
        </div>

        {/* Task Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="active" className="gap-2">
              <ListTodo className="h-4 w-4" />
              Active ({activeTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completed ({completedTasks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3">
            {activeTasks.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex h-20 w-20 rounded-full bg-secondary items-center justify-center mb-4">
                  <CheckCircle2 className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">All caught up! 🎉</h3>
                <p className="text-muted-foreground mb-4">
                  No active tasks. Create one to get started.
                </p>
                <Button
                  onClick={() => {
                    setEditingTask(undefined);
                    setIsFormOpen(true);
                  }}
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Task
                </Button>
              </div>
            ) : (
              activeTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3">
            {completedTasks.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex h-20 w-20 rounded-full bg-secondary items-center justify-center mb-4">
                  <ListTodo className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No completed tasks yet</h3>
                <p className="text-muted-foreground">
                  Complete some tasks to see them here!
                </p>
              </div>
            ) : (
              completedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Task Form Dialog */}
        <TaskForm
          open={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingTask(undefined);
          }}
          onSubmit={handleCreateTask}
          initialTask={editingTask}
        />
      </div>
    </div>
  );
};

export default Index;
