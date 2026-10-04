import { Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        페이지를 찾을 수 없습니다.
      </h2>
      <p className="mt-4 max-w-md typo-body text-muted-foreground">
        페이지의 주소가 잘못되었거나, 변경 또는 삭제되어 접근할 수 없습니다.
      </p>
      <div className="mt-8">
        <Button asChild size={"lg"}>
          <Link to="/">메인으로 이동</Link>
        </Button>
      </div>
    </div>
  )
}
