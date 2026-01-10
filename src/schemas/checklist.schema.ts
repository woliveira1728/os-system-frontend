import { z } from 'zod';

export const checklistItemSchema = z.object({
  title: z.string().min(2, 'Título obrigatório'),
  checked: z.boolean().default(false),
});

export const checklistCreateSchema = z.object({
  title: z.string().min(2, 'Título obrigatório'),
});

export type ChecklistItem = z.infer<typeof checklistItemSchema>;
export type ChecklistCreateForm = z.infer<typeof checklistCreateSchema>;