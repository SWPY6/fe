import { Link } from "@tanstack/react-router"

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
        <Link
          to="/"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          메인으로 이동
        </Link>
      </div>
    </div>
  )
}
