import { z } from "zod"
//data의 타입을 엄격하게 검사하지 않음
export const successResponseSchema = z.object({
  data: z.unknown(),
})

export const errorResponseSchema = z.object({
  error: z.object({
    name: z.string(),
    code: z.string(),
    message: z.string(),
    errors: z.array(z.object({ field: z.string() })).optional(),
  }),
})
