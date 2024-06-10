import { z } from "zod";

export const StartTestTaskActionSchema = z.number();

export const GetTasksStatusActionSchema = z.array(z.string())

export const ClearTasksActionSchema = z.array(z.string())

export const SetTaskNotifiedActionSchema = z.string()

export const UseSiteSourceActionSchema = z.object({
  site_id: z.number(),
  added_source_id: z.number(),
})

export const addSiteAddedWebpageActionSchema = z.object({
  site_id: z.number(),
  url: z.string(),
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

export const EditUsedSourcesTextInputSchema = z.object({
  site_id: z.number(),
  current_title: z.string(),
  title: z.string(),
  content: z.string(),
})

export const AddSiteScanActionSchema = z.object({
  site_id: z.number(),
  url: z.string(),
  max_depth: z.number().optional(),
})

export const GetPlaygroundWsDetailsActionSchema = z.object({
  site_id: z.number(),
  type: z.enum(['chat', 'sources']),
})