import { Combobox } from "@base-ui/react/combobox"
import { cn } from "cn"
import { CheckIcon } from "lucide-react"
import { useId } from "react"

import { Input } from "./input"
import { Label } from "./label"
import { Typography } from "./typography"

type AutocompleteOption = {
  value: string
  label: string
  description?: string
}

type AutocompleteProps = Pick<
  Combobox.Root.Props<AutocompleteOption>,
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "inputValue"
  | "onInputValueChange"
  | "filter"
  | "disabled"
> & {
  items: AutocompleteOption[]
  label: string
  placeholder?: string
  emptyMessage?: string
  className?: string
}

function Autocomplete({
  label,
  placeholder,
  emptyMessage = "일치하는 결과가 없습니다.",
  className,
  ...props
}: AutocompleteProps) {
  const id = useId()

  return (
    <div className={cn("grid w-full min-w-0 gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Combobox.Root
        {...props}
        itemToStringLabel={(item) => item.label}
        itemToStringValue={(item) => item.value}
        isItemEqualToValue={(item, value) => item.value === value.value}
      >
        <Combobox.Input id={id} placeholder={placeholder} render={<Input />} />
        <Combobox.Portal>
          <Combobox.Positioner
            side="bottom"
            sideOffset={4}
            align="start"
            collisionAvoidance={{ side: "none", align: "shift", fallbackAxisSide: "none" }}
            className="z-50"
          >
            <Combobox.Popup
              data-slot="autocomplete-popup"
              className={cn(
                "w-(--anchor-width) max-w-(--available-width)",
                "max-h-[min(18rem,var(--available-height))] overflow-y-auto",
                "rounded-md border border-border bg-popover text-popover-foreground shadow-md",
              )}
            >
              <Combobox.Empty
                className="block px-3 py-4 wrap-anywhere empty:p-0"
                render={
                  <Typography as="output" variant="body-sm" className="text-muted-foreground" />
                }
              >
                {emptyMessage}
              </Combobox.Empty>
              <Combobox.List className="p-1 empty:p-0">
                {(item: AutocompleteOption) => (
                  <Combobox.Item
                    key={item.value}
                    value={item}
                    className={cn(
                      "flex min-h-10 w-full cursor-default items-center gap-1.5 rounded-md p-2",
                      "text-left typo-label whitespace-normal text-foreground outline-none",
                      "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                    )}
                  >
                    <span className="grid min-w-0 gap-0.5 wrap-anywhere">
                      <span>{item.label}</span>
                      {item.description && (
                        <Typography variant="caption" className="text-muted-foreground">
                          {item.description}
                        </Typography>
                      )}
                    </span>
                    <Combobox.ItemIndicator className="ml-auto shrink-0">
                      <CheckIcon aria-hidden="true" className="size-4" />
                    </Combobox.ItemIndicator>
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </div>
  )
}

export { Autocomplete, type AutocompleteOption, type AutocompleteProps }
