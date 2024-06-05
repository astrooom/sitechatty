"use server"

import { StartTestTaskActionSchema, GetTasksStatusActionSchema, SetTaskNotifiedActionSchema, ClearTasksActionSchema, UseSiteSourceActionSchema, UnuseSiteSourceActionSchema, DeleteAddedSourceActionSchema, AddUsedSourcesTextInputActionSchema } from "../schemas/tasks";
import { deleteAddedSource, unuseSiteSource, useSiteSource, addUsedSourcesTextInput } from "../sites";
import { getTasksStatus, startTestTask, setNotifiedTask, clearTasks } from "../tasks";
import { action } from "@/lib/actions";


export const startTestTaskAction = action(StartTestTaskActionSchema, async (delay) => {
  return await startTestTask(delay);
})

export const getTasksStatusAction = action(GetTasksStatusActionSchema, async (task_ids) => {
  return await getTasksStatus(task_ids);
})

export const setTaskNotifiedAction = action(SetTaskNotifiedActionSchema, async (task_id) => {
  return await setNotifiedTask(task_id);
})

export const clearTasksAction = action(ClearTasksActionSchema, async (task_ids) => {
  return await clearTasks(task_ids);
})

export const useSiteSourceAction = action(UseSiteSourceActionSchema, async ({ site_id, added_source_id }) => {
  return await useSiteSource({ site_id, added_source_id })
})

export const unuseSiteSourceAction = action(UnuseSiteSourceActionSchema, async ({ site_id, source }) => {
  return await unuseSiteSource({ site_id, source })
})

export const deleteAddedSourceAction = action(DeleteAddedSourceActionSchema, async ({ site_id, added_source_id }) => {
  return await deleteAddedSource(site_id, added_source_id)
})

export const addUsedSourcesTextInputAction = action(AddUsedSourcesTextInputActionSchema, async ({ site_id, title, content }) => {
  return await addUsedSourcesTextInput({ site_id, title, content })
})