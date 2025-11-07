import { useEffect } from "react";
import { Task } from "@/types/task";
import { toast } from "@/hooks/use-toast";

export const useNotifications = (tasks: Task[]) => {
  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Check for overdue tasks every minute
    const checkOverdueTasks = () => {
      const now = new Date();
      const incompleteTasks = tasks.filter((task) => !task.completed && task.dueDate);

      incompleteTasks.forEach((task) => {
        const dueDate = new Date(task.dueDate!);
        const hoursDiff = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        // Notify if task is overdue or due within 24 hours
        if (hoursDiff < 0 && hoursDiff > -24) {
          // Overdue
          showNotification(
            "Task Overdue! ⏰",
            `"${task.title}" was due and is still incomplete.`
          );
        } else if (hoursDiff > 0 && hoursDiff < 24) {
          // Due soon
          showNotification(
            "Task Due Soon! 📚",
            `"${task.title}" is due in ${Math.round(hoursDiff)} hours.`
          );
        }
      });
    };

    const showNotification = (title: string, body: string) => {
      // Show browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
        });
      }

      // Show toast notification
      toast({
        title,
        description: body,
        duration: 5000,
      });
    };

    // Initial check
    checkOverdueTasks();

    // Check every 30 minutes
    const interval = setInterval(checkOverdueTasks, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [tasks]);
};
