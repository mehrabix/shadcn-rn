export const registry = {
  name: "shadcn-rn",
  homepage: "https://github.com/mehrabix/shadcn-rn",
  items: [
    {
      name: "button",
      type: "registry:ui",
      description: "A button component for React Native",
      dependencies: ["react-native"],
      files: [
        {
          path: "src/components/ui/button.tsx",
          type: "registry:ui"
        }
      ]
    },
    {
      name: "card",
      type: "registry:ui",
      description: "A card component for React Native",
      dependencies: ["react-native"],
      files: [
        {
          path: "src/components/ui/card.tsx",
          type: "registry:ui"
        }
      ]
    },
    {
      name: "input",
      type: "registry:ui",
      description: "An input component for React Native",
      dependencies: ["react-native"],
      files: [
        {
          path: "src/components/ui/input.tsx",
          type: "registry:ui"
        }
      ]
    },
    {
      name: "badge",
      type: "registry:ui",
      description: "A badge component for React Native",
      dependencies: ["react-native"],
      files: [
        {
          path: "src/components/ui/badge.tsx",
          type: "registry:ui"
        }
      ]
    }
  ]
}
