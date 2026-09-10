import { expect, test as base } from "@playwright/test"

import { ErrorPolicyPage } from "../pages/errorPolicy"

type ErrorPolicyFixtures = {
  errorPolicyPage: ErrorPolicyPage
}

export const test = base.extend<ErrorPolicyFixtures>({
  errorPolicyPage: async ({ page }, provide) => {
    await provide(new ErrorPolicyPage(page))
  },
})

export { expect }
