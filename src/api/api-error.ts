// 서버 요청 실패를 웹 공통 에러로 정리. 에러 메시지와 HTTP 상태 코드를 함께 출력.
export class ApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)

    this.name = "ApiError"
    this.status = status
  }
}
