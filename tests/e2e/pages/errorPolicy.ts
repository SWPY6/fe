import type { Locator, Page } from "@playwright/test"

export class ErrorPolicyPage {
  readonly queryResult: Locator
  readonly requestStatus: Locator
  readonly recoveryScreen: Locator
  readonly errorNotification: Locator
  readonly featureError: Locator
  readonly offlineNotice: Locator
  readonly retryButton: Locator
  readonly refreshButton: Locator
  readonly mutationButton: Locator
  readonly startQueryButton: Locator

  constructor(private readonly page: Page) {
    this.queryResult = page.getByLabel("조회 결과")
    this.requestStatus = page.getByLabel("요청 상태")
    this.recoveryScreen = page.getByRole("alert")
    this.errorNotification = page.getByRole("region", { name: /^알림/ }).getByRole("listitem")
    this.featureError = page.getByLabel("기능 오류")
    this.offlineNotice = page.getByLabel("연결 상태 안내")
    this.retryButton = page.getByRole("button", { name: "다시 시도" })
    this.refreshButton = page.getByRole("button", { name: "새로고침" })
    this.mutationButton = page.getByRole("button", { name: "변경 실행" })
    this.startQueryButton = page.getByRole("button", { name: "조회 시작" })
  }

  async openInitialQuery() {
    await this.page.goto("/errorPolicyTest?scenario=initial")
  }

  async openBackgroundQuery() {
    await this.page.goto("/errorPolicyTest?scenario=background")
  }

  async openFeatureHandledQuery() {
    await this.page.goto("/errorPolicyTest?scenario=local")
  }

  async openMutation() {
    await this.page.goto("/errorPolicyTest?scenario=mutation")
  }

  async openOfflineQuery() {
    await this.page.goto("/errorPolicyTest?scenario=offline")
  }

  async retry() {
    await this.retryButton.click()
  }

  async refresh() {
    await this.refreshButton.click()
  }

  async executeMutation() {
    await this.mutationButton.click()
  }

  async startQuery() {
    await this.startQueryButton.click()
  }
}
