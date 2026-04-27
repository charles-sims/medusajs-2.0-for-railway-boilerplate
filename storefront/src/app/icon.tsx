import { renderIconMark } from "./_brand/icon-mark"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default async function Icon() {
  return renderIconMark(32, 28)
}
