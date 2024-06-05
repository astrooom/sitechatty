import { z } from "zod";

export const StartTestTaskActionSchema = z.number();

export const GetTasksStatusActionSchema = z.array(z.string())

export const ClearTasksActionSchema = z.array(z.string())

export const SetTaskNotifiedActionSchema = z.string()

export const UseSiteSourceActionSchema = z.object({
  site_id: z.number(),
  added_source_id: z.number(),
})

export const DeleteAddedSourceActionSchema = z.object({
  site_id: z.number(),
  added_source_id: z.number(),
})

export const UnuseSiteSourceActionSchema = z.object({
  site_id: z.number(),
  source: z.string(),
})

export const AddUsedSourcesTextInputActionSchema = z.object({
  site_id: z.number(),
  title: z.string(),
  content: z.string(),
})