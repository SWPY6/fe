import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

type RelatedArticleCardProps = {
  kind: "news" | "disclosure"
  title: string
  source: string
  publishedAt: string
  publishedAtLabel: string
  summary: string
  originalUrl: string
}

export function RelatedArticleCard({
  kind,
  title,
  source,
  publishedAt,
  publishedAtLabel,
  summary,
  originalUrl,
}: RelatedArticleCardProps) {
  const kindLabel = kind === "news" ? "뉴스" : "공시"

  return (
    <article>
      <Card className="h-full">
        <CardHeader>
          <p className="text-sm text-muted-foreground">
            {kindLabel} · {source}
          </p>

          <time dateTime={publishedAt} className="text-sm text-muted-foreground">
            {publishedAtLabel}
          </time>

          <h3 className="text-base font-semibold wrap-break-word">{title}</h3>
        </CardHeader>

        <CardContent>
          <p className="text-sm/relaxed wrap-break-word">{summary}</p>
        </CardContent>

        <CardFooter className="mt-auto">
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            원문 보기
            <span aria-hidden="true"> ↗</span>
            <span className="sr-only">: {title} (새 탭에서 열림)</span>
          </a>
        </CardFooter>
      </Card>
    </article>
  )
}
