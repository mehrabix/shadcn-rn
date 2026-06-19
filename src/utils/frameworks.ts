export interface Framework {
  name: string
  label: string
  link: string
  tailwindLink: string
  installation: string
  icon: string
}

export const FRAMEWORKS: Framework[] = [
  {
    name: "expo",
    label: "Expo",
    link: "https://docs.expo.dev",
    tailwindLink: "https://www.nativewind.dev",
    installation: "npx create-expo-app",
    icon: "expo",
  },
  {
    name: "bare-react-native",
    label: "Bare React Native",
    link: "https://reactnative.dev",
    tailwindLink: "https://www.nativewind.dev",
    installation: "npx react-native init",
    icon: "react-native",
  },
]

export function getFramework(name: string): Framework | undefined {
  return FRAMEWORKS.find((f) => f.name === name)
}
