// Keep conference facts intact while separating their existing translations.
export function splitBilingualText(text: string): string[] {
  const explicitLines = text.split("\n").filter(Boolean);
  if (explicitLines.length > 1) return explicitLines;
  const sentence = text.match(/^([\s\S]*?[.!?])\s+((?:\d+)?\p{Script=Han}[\s\S]*)$/u);
  if (sentence) return [sentence[1], sentence[2]];
  const label = text.match(/^([\s\S]*?)\s+[·/]\s*((?:\d+)?\p{Script=Han}[\s\S]*)$/u);
  return label ? [label[1], label[2]] : [text];
}
