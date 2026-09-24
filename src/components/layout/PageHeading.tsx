export function PageHeading({
  title,
  path,
  description,
}: {
  title: string
  path: string[]
  description?: string
}) {
  return (
    <div className="space-y-2">
      <nav aria-label="현재 위치">
        <ol className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {path.map((label, index) => (
            <li key={label} aria-current={index === path.length - 1 ? "page" : undefined}>
              {index > 0 && (
                <span aria-hidden="true" className="mr-2">
                  /
                </span>
              )}
              {label}
            </li>
          ))}
        </ol>
      </nav>
      <h1 className="text-2xl font-bold wrap-break-word">{title}</h1>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  )
}
