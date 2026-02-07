export function normalizeHorseId(
    horseId: unknown,
  ): string | undefined {
    if (Array.isArray(horseId)) horseId = horseId[0];
    if (typeof horseId !== "string") return undefined;
  
    const trimmed = horseId.trim();
    if (!trimmed || trimmed === "null" || trimmed === "undefined") {
      return undefined;
    }
  
    return trimmed;
}