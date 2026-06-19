export interface IconLibrary {
  name: string
  import: string
  usage: string
}

export const iconLibraries: Record<string, IconLibrary> = {
  lucide: {
    name: "lucide",
    import: "lucide-react-native",
    usage: "<Icon name={ICON} />",
  },
  "react-native-vector-icons": {
    name: "react-native-vector-icons",
    import: "react-native-vector-icons/MaterialIcons",
    usage: '<Icon name="ICON" />',
  },
}

export type IconLibraryName = keyof typeof iconLibraries
