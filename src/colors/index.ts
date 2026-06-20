import { neutral } from "./neutral"
import { zinc } from "./zinc"
import { slate } from "./slate"
import { stone } from "./stone"

export { neutral } from "./neutral"
export { zinc } from "./zinc"
export { slate } from "./slate"
export { stone } from "./stone"

export const colors = {
  neutral,
  zinc,
  slate,
  stone,
}

export type ColorName = keyof typeof colors
