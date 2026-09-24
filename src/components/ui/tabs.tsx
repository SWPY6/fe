import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Tabs as TabsPrimitive } from "radix-ui"

function TabsRoot({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn("group/tabs flex gap-2 data-[orientation=horizontal]:flex-col", className)}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted group-data-[orientation=horizontal]/tabs:h-9",
        line: "relative gap-1 bg-transparent p-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function TabsList({
  className,
  variant = "default",
  ref,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  const listRef = React.useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = React.useState<{
    offset: number
    size: number
    vertical: boolean
  } | null>(null)

  const setListRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      listRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )

  React.useLayoutEffect(() => {
    if (variant !== "line" || !listRef.current) return

    const list = listRef.current
    const updateIndicator = () => {
      const active = list.querySelector<HTMLElement>(
        '[data-slot="tabs-trigger"][data-state="active"]',
      )
      if (!active) {
        setIndicator(null)
        return
      }

      const listBounds = list.getBoundingClientRect()
      const activeBounds = active.getBoundingClientRect()
      const vertical =
        list.closest('[data-slot="tabs"]')?.getAttribute("data-orientation") === "vertical"
      setIndicator({
        offset: vertical ? activeBounds.top - listBounds.top : activeBounds.left - listBounds.left,
        size: vertical ? activeBounds.height : activeBounds.width,
        vertical,
      })
    }

    updateIndicator()
    const mutationObserver = new MutationObserver(updateIndicator)
    mutationObserver.observe(list, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state"],
    })
    const resizeObserver = new ResizeObserver(updateIndicator)
    resizeObserver.observe(list)
    list.querySelectorAll('[data-slot="tabs-trigger"]').forEach((trigger) => {
      resizeObserver.observe(trigger)
    })

    return () => {
      mutationObserver.disconnect()
      resizeObserver.disconnect()
    }
  }, [variant])

  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      ref={setListRef}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    >
      {props.children}
      {variant === "line" && (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute bg-primary transition-[transform,width,height] duration-200 ease-out motion-reduce:transition-none",
            indicator?.vertical ? "-right-1 w-0.5" : "bottom-0 left-0 h-0.5",
          )}
          style={
            indicator?.vertical
              ? { height: indicator.size, transform: `translateY(${indicator.offset}px)` }
              : {
                  width: indicator?.size ?? 0,
                  transform: `translateX(${indicator?.offset ?? 0}px)`,
                }
          }
        />
      )}
    </TabsPrimitive.List>
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent",
        "data-[state=active]:bg-background data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground",
        "group-data-[variant=line]/tabs-list:data-[state=active]:text-primary",
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
}
