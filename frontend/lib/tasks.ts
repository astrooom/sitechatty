import { flaskFetch } from "@/lib"
import { revalidateTag } from "next/cache";

type TaskStatus = 'started' | 'completed' | 'failed';

type CeleryTaskBase = {
  task_id: string;
  name: string;
  status: TaskStatus;
  start_time: string;
  do_periodical_refresh: boolean;
}

export type StartedTask = CeleryTaskBase & {
  status: 'started';
}

export type CompletedTask = CeleryTaskBase & {
  status: 'completed';
  result: string;
  has_notified?: boolean; // Has the user been notified of the status of the task?
}

export type FailedTask = CeleryTaskBase & {
  status: 'failed';
  error: string;
  has_notified?: boolean; // Has the user been notified of the status of the task?
}

export type CeleryTask = StartedTask | CompletedTask | FailedTask;

export async function getUserTasks(options?: RequestInit) {
  const response = await flaskFetch(`/api/task/list`, {
    method: 'GET',
    next: { revalidate: 30, tags: ['user-tasks'] },
    ...options
  });
  const data: CeleryTask[] = await response.json();
  return data;
}

export async function getTasksStatus(task_ids: string[]) {
  const response = await flaskFetch(`/api/task/status`, {
    method: 'POST',
    body: JSON.stringify({
      task_ids
    })
  });
  const data: CeleryTask[] = await response.json();
  return data;
}

export async function startTestTask(delay: number) {
  await flaskFetch(`/api/task/test`, {
    method: 'POST',
    body: JSON.stringify({
      delay
    })
  });

  revalidateTag('user-tasks');
  return
}

export async function clearTasks(task_ids: string[]) {
  await flaskFetch(`/api/task/clear`, {
    method: 'POST',
    body: JSON.stringify({
      task_ids
    })
  });
}

export async function setNotifiedTask(taskId: string) {
  await flaskFetch(`/api/task/${taskId}/set-notified`, {
    method: 'POST'
  });
}