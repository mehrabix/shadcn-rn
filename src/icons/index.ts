export interface IconLibrary {
  name: string
  import: string
  prefix: string
  component: string
}

export const iconLibraries: Record<string, IconLibrary> = {
  lucide: {
    name: "lucide-react-native",
    import: "lucide-react-native",
    prefix: "Lucide",
    component: "Icon",
  },
  "react-native-vector-icons": {
    name: "react-native-vector-icons",
    import: "react-native-vector-icons/MaterialIcons",
    prefix: "Material",
    component: "Icon",
  },
}

export function getIconLibrary(name: string): IconLibrary | undefined {
  return iconLibraries[name]
}

export function getIconLibraryNames(): string[] {
  return Object.keys(iconLibraries)
}
