export function DemoNotice({
  message = "가격·그래프·뉴스는 디자인 확인용 정적 예시입니다. 실제 시세나 투자 예측이 아닙니다.",
}: {
  message?: string
}) {
  return (
    <aside
      aria-label="예시 데이터 안내"
      className="rounded-lg border border-primary/30 bg-accent p-3 text-sm text-accent-foreground"
    >
      <strong>DEMO · 예시 데이터</strong>
      <p className="mt-1 wrap-break-word">{message}</p>
    </aside>
  )
}
