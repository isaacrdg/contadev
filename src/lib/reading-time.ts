/**
 * Calcula tempo estimado de leitura em minutos.
 * Base: 200 palavras por minuto (média leitura adulta em PT-BR).
 */
const WPM = 200;

export function readingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.ceil(words / WPM));
}
