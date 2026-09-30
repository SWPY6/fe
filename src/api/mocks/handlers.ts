import { http, HttpResponse } from "msw"
import { z } from "zod"

import { getPloutosApiMock, getSignUpResponseMock } from "../generated/api.msw"

export const handlers = [
  http.post("*/api/v1/auth/signup", async ({ request }) => {
    const body = await request.json()
    if (!z.object({ termsAccepted: z.literal(true) }).safeParse(body).success) {
      return HttpResponse.json(
        {
          error: {
            name: "InvalidInputValueException",
            code: "P001",
            message: "잘못된 입력값입니다.",
            errors: [{ field: "termsAccepted" }],
          },
        },
        { status: 400 },
      )
    }

    return HttpResponse.json(getSignUpResponseMock(), { status: 201 })
  }),
  ...getPloutosApiMock(),
]
