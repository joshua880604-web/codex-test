import tools from './embed-tools.json';
export type EmbedTheme = 'light' | 'dark';
export const embedHeights = [600, 650, 800, 1000, 1200] as const;
export function validEmbedHeight(height:number){return Number.isInteger(height)&&height>=400&&height<=2400;}
export function embedTool(id: string) { return tools.find(tool => tool.id === id); }
export function embedURL(id: string, theme: EmbedTheme = 'light') {
  const tool = embedTool(id);
  if (!tool) throw new Error('Embedding is unavailable for this calculator.');
  if (!['light', 'dark'].includes(theme)) throw new Error('Choose a supported theme.');
  return `https://www.calculatorfree.io/embed/${tool.slug}/?theme=${theme}`;
}
export function embedCode(id: string, theme: EmbedTheme, height: number) {
  const tool = embedTool(id);
  if (!tool || !validEmbedHeight(height)) throw new Error('Choose a supported calculator and height.');
  return `<iframe src="${embedURL(id, theme)}" title="${tool.title} by CalculatorFree.io" width="100%" height="${height}" style="border:0;border-radius:12px;" loading="lazy" referrerpolicy="no-referrer"></iframe>\n<p>Calculator by <a href="https://www.calculatorfree.io/${tool.slug}" target="_blank" rel="nofollow noopener">CalculatorFree.io</a></p>`;
}
