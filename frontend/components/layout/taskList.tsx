'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { clearTasksAction, getTasksStatusAction, setTaskNotifiedAction, startTestTaskAction } from '@/lib/actions/tasks';
import { CeleryTask, CompletedTask, FailedTask } from '@/lib/tasks';
import { CheckCircle2, LayoutList, Loader2, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TooltipContent } from '@radix-ui/react-tooltip';
export function TaskList({ tasks }: { tasks: CeleryTask[] }) {
  const { refresh } = useRouter();

  const { toast } = useToast();

  const pollableTasks = tasks.filter(
    // @ts-ignore: Property 'has_notified' does not exist on type 'CeleryTask'
    t => !!!t.has_notified
  );

  const notifyTask = async (task: CompletedTask | FailedTask) => {
    if (!!!task.has_notified) {
      if (task.status === 'failed') {
        toast({
          title: `Task "${task.name}" failed`,
          description: task?.error || 'Task failed',
          variant: 'destructive'
        });
      }
      if (task.status === 'completed') {
        toast({
          title: `Task "${task.name}" completed`,
          description: task?.result || 'Task completed',
          variant: 'success'
        });
      }
      await setTaskNotifiedAction(task.task_id);
      refresh()
    }
  }

  const fetchTaskStatuses = async () => {
    try {
      const polledTasks = await getTasksStatusAction(pollableTasks.map(t => t.task_id));
      if (!polledTasks.data) {
        return
      }

      // Check the task statuses and throw a toast accordingly.
      for (const task of polledTasks.data) {
        if (task.status === 'failed') {
          notifyTask(task);
        }
        if (task.status === 'completed') {
          notifyTask(task);
        }
      }

    } catch (error) {
      console.error('Error fetching task statuses:', error);
    }
  };

  useEffect(() => {
    // Fetch statuses immediately
    if (pollableTasks.length === 0) return;

    fetchTaskStatuses();

    // Set up polling
    const intervalId = setInterval(() => {
      fetchTaskStatuses();
    }, 5000); // Poll every 5 seconds

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [tasks]);

  const startTestTask = async (delay: number) => {
    await startTestTaskAction(delay);
    refresh()
  }

  const clearTasks = async (task_ids: string[]) => {
    await clearTasksAction(task_ids);
    refresh()
  }

  // If there any active tasks, start polling for them
  const getIcon = (status: string) => {
    switch (status) {
      case 'started':
        return <Loader2 className="h-[1.1rem] w-[1.1rem] animate-spin" />
      case 'completed':
        return <CheckCircle2 className="h-[1.1rem] w-[1.1rem]" />
      case 'failed':
        return <XCircle className="h-[1.1rem] w-[1.1rem]" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {pollableTasks.length > 0 ? <Loader2 className="h-[1.2rem] w-[1.2rem] animate-spin" /> : <LayoutList className="h-[1.2rem] w-[1.2rem]" />}
          <span className="sr-only">List ongoing tasks</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col ">
            <p className="text-sm font-medium leading-none">Ongoing Tasks</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>

          {tasks.map((task) => (
            <DropdownMenuItem key={task.task_id}>
              {task.name}
              <DropdownMenuShortcut>
                {getIcon(task.status)}
              </DropdownMenuShortcut>

              <TooltipProvider>
                <Tooltip key={task.task_id}>
                  <TooltipTrigger asChild>
                    <XCircle color='red' className="ml-2 h-[1.1rem] w-[1.1rem] cursor-pointer" onClick={(e) => {
                      e.preventDefault();
                      clearTasks([task.task_id])
                    }} />
                  </TooltipTrigger>
                  <TooltipContent
                    align="center"
                    side="left"
                    sideOffset={8}>
                    Clear
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

            </DropdownMenuItem>
          ))}
          <DropdownMenuItem key={"test_task"} onClick={() => {
            startTestTask(10)
          }}>
            Start Test Task
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
