import { useId, type ReactNode } from "react"

type TabsProps<T extends string> = {
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
  children: ReactNode
}

export function Tabs<T extends string>({
  label,
  value,
  options,
  onChange,
  children,
}: TabsProps<T>) {
  const id = useId()
  return (
    <div className="space-y-3">
      <div
        role="tablist"
        aria-label={label}
        className="flex flex-wrap gap-1 rounded-xl bg-muted p-1"
      >
        {options.map((option, index) => (
          <button
            key={option.value}
            id={`${id}-${index}`}
            type="button"
            role="tab"
            aria-selected={value === option.value}
            aria-controls={`${id}-panel`}
            tabIndex={value === option.value ? 0 : -1}
            className="min-h-10 rounded-lg px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-selected:bg-card aria-selected:text-primary aria-selected:shadow-sm"
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => {
              let next: number
              if (event.key === "ArrowRight") next = (index + 1) % options.length
              else if (event.key === "ArrowLeft")
                next = (index - 1 + options.length) % options.length
              else if (event.key === "Home") next = 0
              else if (event.key === "End") next = options.length - 1
              else return
              event.preventDefault()
              onChange(options[next].value)
              document.getElementById(`${id}-${next}`)?.focus()
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-${options.findIndex((option) => option.value === value)}`}
        tabIndex={0}
        className="rounded-lg focus-visible:outline-2 focus-visible:outline-ring"
      >
        {children}
      </div>
    </div>
  )
}
