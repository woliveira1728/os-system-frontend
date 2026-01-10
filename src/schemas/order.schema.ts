import { z } from 'zod';

export const orderCreateSchema = z.object({
  title: z.string().min(3, 'Título obrigatório (mínimo 3 caracteres)'),
  description: z.string().min(5, 'Descrição obrigatória (mínimo 5 caracteres)'),
});

export type OrderCreateForm = z.infer<typeof orderCreateSchema>;