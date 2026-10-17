import { cn } from "cn"
import type { ComponentProps, ReactNode } from "react"

import { Button } from "./button"

type ResultProps = Omit<ComponentProps<"div">, "title" | "children"> & {
  title: ReactNode
  description?: ReactNode
  button?: ReactNode
}

export function Result({ title, description, button, className, ...props }: ResultProps) {
  return (
    <div
      data-slot="result"
      className={cn(
        "flex flex-col items-center justify-center gap-6 px-6 py-12 text-center",
        className,
      )}
      {...props}
    >
      <div className="flex w-full max-w-sm flex-col gap-2">
        <h2 className="typo-subheading text-balance wrap-break-word whitespace-pre-line">
          {title}
        </h2>
        {description != null && (
          <p className="typo-body-sm wrap-break-word whitespace-pre-line text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {button}
    </div>
  )
}

function ResultButton({ className, ...props }: ComponentProps<typeof Button>) {
  return <Button type="button" className={cn("min-h-11 px-5", className)} {...props} />
}

Result.Button = ResultButton
