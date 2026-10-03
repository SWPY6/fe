import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Tabs as TabsPrimitive } from "radix-ui"
import * as React from "react"

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
  "group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
  {
    variants: {
      variant: {
        segmented: "gap-0.75 rounded-lg bg-secondary p-0.75",
        underline: "relative rounded-none bg-transparent p-0",
      },
    },
    defaultVariants: {
      variant: "segmented",
    },
  },
)

function TabsList({
  className,
  variant: appearance = "segmented",
  size = "default",
  showIndicator = true,
  ref,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: VariantProps<typeof tabsListVariants>["variant"] | "default" | "line"
  size?: "default" | "compact"
  showIndicator?: boolean
}) {
  const variant =
    appearance === "line" ? "underline" : appearance === "default" ? "segmented" : appearance
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
    if (!showIndicator || variant !== "underline" || !listRef.current) return

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
  }, [variant, showIndicator])

  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      data-size={size}
      ref={setListRef}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    >
      {props.children}
      {showIndicator && variant === "underline" && (
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
        "relative inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 bg-transparent whitespace-nowrap text-muted-foreground transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=underline]/tabs-list:h-11 group-data-[variant=underline]/tabs-list:rounded-none group-data-[variant=underline]/tabs-list:px-4 group-data-[variant=underline]/tabs-list:typo-label group-data-[variant=underline]/tabs-list:data-[state=active]:typo-label-strong group-data-[variant=underline]/tabs-list:data-[state=active]:text-primary",
        "group-data-[variant=segmented]/tabs-list:h-9 group-data-[variant=segmented]/tabs-list:rounded-md group-data-[variant=segmented]/tabs-list:px-3 group-data-[variant=segmented]/tabs-list:typo-label-sm group-data-[variant=segmented]/tabs-list:data-[state=active]:bg-primary group-data-[variant=segmented]/tabs-list:data-[state=active]:text-primary-foreground",
        "group-data-[variant=segmented]/tabs-list:group-data-[size=compact]/tabs-list:h-8 group-data-[variant=segmented]/tabs-list:group-data-[size=compact]/tabs-list:typo-label-xs",
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
