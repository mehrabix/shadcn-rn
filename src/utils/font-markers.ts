export interface FontMarker {
  marker: string
  utility: string
  supportToken: string
}

export function getSupportedFontMarkers(
  cssContent: string,
  extraMarkers: string[] = []
): string[] {
  const supported = [...extraMarkers]

  const markers: FontMarker[] = [
    {
      marker: "cn-font-heading",
      utility: "font-heading",
      supportToken: "--font-heading:",
    },
  ]

  for (const marker of markers) {
    if (cssContent.includes(marker.supportToken)) {
      supported.push(marker.marker)
    }
  }

  return supported
}
