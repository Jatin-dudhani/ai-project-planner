import { z } from "zod";

export const techStackItemSchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
});

export const routeSchema = z.object({
  path: z.string(),
  description: z.string(),
});

export const dataModelEntitySchema = z.object({
  name: z.string(),
  fields: z.array(z.object({ name: z.string(), type: z.string() })),
});

export const buildPhaseSchema = z.object({
  phase: z.string(),
  tasks: z.array(z.string()),
});

export const riskSchema = z.object({
  risk: z.string(),
  mitigation: z.string(),
});

export const projectBriefSchema = z.object({
  summary: z.string(),
  targetUsers: z.array(z.string()),
  coreFeatures: z.array(z.string()),
  techStack: z.array(techStackItemSchema),
  routes: z.array(routeSchema),
  dataModel: z.array(dataModelEntitySchema),
  buildPhases: z.array(buildPhaseSchema),
  risks: z.array(riskSchema),
  starterPrompt: z.string(),
});

export type ProjectBriefOutput = z.infer<typeof projectBriefSchema>;
