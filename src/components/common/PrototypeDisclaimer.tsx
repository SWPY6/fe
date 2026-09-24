export function PrototypeDisclaimer({
  message = "PLOUTOS 프로토타입은 실제 거래·알림 발송·인증을 지원하지 않습니다. 모든 정보는 화면 검증용 예시이며 투자 판단의 근거로 사용할 수 없습니다.",
}: {
  message?: string
}) {
  return (
    <footer className="border-t py-4 text-xs/relaxed text-muted-foreground">
      <p>{message}</p>
    </footer>
  )
}
