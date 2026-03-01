import { z } from 'zod';

const createOrderZodSchema = z.object({
  body: z.object({
    item: z.string({ required_error: 'Item is required' }),
  }),
});

const updateOrderZodSchema = z.object({
  body: z.object({
    item: z.string().optional(),
  }),
});

export const OrderValidation = {
  createOrderZodSchema,
  updateOrderZodSchema,
};

