export function getIdeasPath(clippingsPath: string): string {
  const trimmed = clippingsPath.replace(/[\\/]+$/, "");
  const lastSlash = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("\\"));

  if (lastSlash <= 0) {
    return `${trimmed}/Ideas`;
  }

  return `${trimmed.slice(0, lastSlash)}/Ideas`;
}
