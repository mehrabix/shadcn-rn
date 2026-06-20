const HTML_TO_RN_MAP: Record<string, string> = {
  div: "View",
  span: "Text",
  p: "Text",
  h1: "Text",
  h2: "Text",
  h3: "Text",
  h4: "Text",
  h5: "Text",
  h6: "Text",
  a: "Link",
  button: "Pressable",
  input: "TextInput",
  textarea: "TextInput",
  img: "Image",
  ul: "View",
  ol: "View",
  li: "Text",
  label: "Text",
  select: "Picker",
  option: "Picker",
  table: "View",
  thead: "View",
  tbody: "View",
  tr: "View",
  td: "View",
  th: "View",
  header: "View",
  footer: "View",
  nav: "View",
  main: "View",
  section: "View",
  article: "View",
  aside: "View",
  form: "View",
  hr: "View",
  br: "Text",
  strong: "Text",
  em: "Text",
  b: "Text",
  i: "Text",
  u: "Text",
  small: "Text",
  code: "Text",
  pre: "Text",
}

const HTML_IMPORTS: Record<string, { package: string; names: string[] }> = {
  View: { package: "react-native", names: ["View"] },
  Text: { package: "react-native", names: ["Text"] },
  TextInput: { package: "react-native", names: ["TextInput"] },
  Image: { package: "react-native", names: ["Image"] },
  Pressable: { package: "react-native", names: ["Pressable"] },
  Link: { package: "expo-linking", names: ["Link"] },
  Picker: { package: "@react-native-picker/picker", names: ["Picker"] },
}

export function convertHtmlTag(tagName: string): string {
  return HTML_TO_RN_MAP[tagName] || "View"
}

export function getRequiredImports(componentNames: string[]): Record<string, string[]> {
  const imports: Record<string, string[]> = {}

  for (const name of componentNames) {
    const importInfo = HTML_IMPORTS[name]
    if (importInfo) {
      if (!imports[importInfo.package]) {
        imports[importInfo.package] = []
      }
      imports[importInfo.package].push(...importInfo.names)
    }
  }

  for (const pkg of Object.keys(imports)) {
    imports[pkg] = [...new Set(imports[pkg])]
  }

  return imports
}

export const WEB_ATTR_TO_RN: Record<string, string> = {
  class: "className",
  tabindex: "tabIndex",
  readonly: "editable",
  maxlength: "maxLength",
  minlength: "minLength",
  colspan: "colSpan",
  rowspan: "rowSpan",
  autofocus: "autoFocus",
  autocomplete: "autoComplete",
  enctype: "encoding",
  for: "htmlFor",
  accesskey: "accessKey",
  contenteditable: "contentEditable",
  crossOrigin: "crossOrigin",
}

export const EVENT_HANDLERS: Record<string, string> = {
  onClick: "onPress",
  onDoubleClick: "onPress",
  onMouseDown: "onPressIn",
  onMouseUp: "onPressOut",
  onMouseEnter: "onPressIn",
  onMouseLeave: "onPressOut",
  onChange: "onChangeText",
  onInput: "onChangeText",
  onSubmit: "onSubmitEditing",
  onFocus: "onFocus",
  onBlur: "onBlur",
  onKeyDown: "onKeyPress",
  onKeyUp: "onKeyPress",
}
