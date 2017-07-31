export function selectImage(uuid: string | undefined) {
  return { type: "SELECT_IMAGE", payload: uuid };
}
