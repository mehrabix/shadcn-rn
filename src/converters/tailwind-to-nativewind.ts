const WEB_ONLY_UTILITIES: Record<string, string | null> = {
  "overflow-hidden": "overflow-hidden",
  "overflow-auto": "overflow-hidden",
  "overflow-scroll": "overflow-hidden",
  "overflow-x-hidden": "overflow-hidden",
  "overflow-y-hidden": "overflow-hidden",
  cursorPointer: null,
  cursorDefault: null,
  cursorWait: null,
  selectNone: null,
  selectAll: null,
  appearanceNone: null,
  outlineNone: null,
  "pointer-events-none": "pointer-events-none",
  "pointer-events-auto": "pointer-events-auto",
}

const DANGEROUSLY_UNSAFE_WEB: string[] = [
  "backdrop-blur",
  "backdrop-filter",
  "clip-path",
  "mask-image",
  "mask-size",
  "mask-position",
  "mask-repeat",
  "shape-outside",
  "shape-image-threshold",
  "scroll-snap-type",
  "scroll-snap-align",
  "scroll-margin",
  "scroll-padding",
  "columns-",
  "break-before",
  "break-after",
  "break-inside",
  "grid-auto-flow",
  "grid-auto-rows",
  "grid-auto-columns",
  "justify-items",
  "place-content",
  "place-items",
  "place-self",
]

const RN_UNSUPPORTED_PROPERTIES: string[] = [
  "min-width",
  "max-width",
  "width",
  "height",
  "min-height",
  "max-height",
]

export function convertTailwindClass(className: string): string {
  let converted = className

  converted = converted.replace(/^(flex-)?grow(?:-(\d+))?$/, (_, prefix, n) => {
    return n ? `flex-grow-${n}` : "flex-grow"
  })

  converted = converted.replace(/^(flex-)?shrink(?:-(\d+))?$/, (_, prefix, n) => {
    return n ? `flex-shrink-${n}` : "flex-shrink"
  })

  converted = converted.replace(
    /^rounded-(\w+)$/,
    (_, size) => `rounded-${size}`
  )

  converted = converted.replace(
    /^text-(\w+)-(\d+)$/,
    (_, weight, size) => `font-${weight} text-${size}`
  )

  converted = converted.replace(
    /^shadow-(sm|md|lg|xl|2xl|inner)$/,
    (_, size) => `shadow-${size}`
  )

  converted = converted.replace(
    /^transition-(\w+)$/,
    (_, prop) => `duration-${prop === "all" ? "300" : prop}`
  )

  converted = converted.replace(
    /^ease-(\w+)$/,
    (_, easing) => `ease-${easing}`
  )

  return converted
}

export function isWebOnlyUtility(className: string): boolean {
  return className in WEB_ONLY_UTILITIES
}

export function isUnsafeWebUtility(className: string): boolean {
  return DANGEROUSLY_UNSAFE_WEB.some((prefix) => className.startsWith(prefix))
}

export function isUnsupportedRNProperty(className: string): boolean {
  return RN_UNSUPPORTED_PROPERTIES.some((prop) => className.startsWith(prop))
}

export function convertTailwindClasses(classes: string): string {
  return classes
    .split(/\s+/)
    .filter(Boolean)
    .map((cls) => {
      if (isUnsafeWebUtility(cls)) {
        return `/* UNSUPPORTED: ${cls} */`
      }
      if (isWebOnlyUtility(cls)) {
        return `/* WEB ONLY: ${cls} */`
      }
      return convertTailwindClass(cls)
    })
    .join(" ")
}

export const TAILWIND_COLOR_MAP: Record<string, string> = {
  "bg-primary": "bg-primary",
  "bg-primary-foreground": "bg-primary-foreground",
  "bg-secondary": "bg-secondary",
  "bg-secondary-foreground": "bg-secondary-foreground",
  "bg-muted": "bg-muted",
  "bg-muted-foreground": "bg-muted-foreground",
  "bg-accent": "bg-accent",
  "bg-accent-foreground": "bg-accent-foreground",
  "bg-destructive": "bg-destructive",
  "bg-destructive-foreground": "bg-destructive-foreground",
  "bg-card": "bg-card",
  "bg-card-foreground": "bg-card-foreground",
  "bg-popover": "bg-popover",
  "bg-popover-foreground": "bg-popover-foreground",
  "bg-border": "bg-border",
  "bg-input": "bg-input",
  "bg-ring": "bg-ring",
}

export const SPACING_SCALES: Record<string, number> = {
  "0": 0,
  "0.5": 2,
  "1": 4,
  "1.5": 6,
  "2": 8,
  "2.5": 10,
  "3": 12,
  "3.5": 14,
  "4": 16,
  "5": 20,
  "6": 24,
  "7": 28,
  "8": 32,
  "9": 36,
  "10": 40,
  "11": 44,
  "12": 48,
  "14": 56,
  "16": 64,
  "20": 80,
  "24": 96,
  "28": 112,
  "32": 128,
  "36": 144,
  "40": 160,
  "44": 176,
  "48": 192,
  "52": 208,
  "56": 224,
  "60": 240,
  "64": 256,
  "72": 288,
  "80": 320,
  "96": 384,
}
