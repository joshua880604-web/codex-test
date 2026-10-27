import catalog from './catalog-data.json';
import {categoryPaths} from './calculator-categories';

// File routes remain stable. Only links to known public documents are normalized.
const documents = new Set([...Object.values(categoryPaths),...catalog.map(tool => tool.local_route), '/financial-calculator.html', '/about.html', '/privacy.html', '/methodology.html', '/loan-calculators.html', '/savings-investment-calculators.html']);
function relativeHref(href: string): string {
  const split = href.search(/[?#]/), path = split < 0 ? href : href.slice(0, split), suffix = split < 0 ? '' : href.slice(split);
  if (path === '/') return '/financial-calculator' + suffix;
  if (documents.has(path)) return path.slice(0, -5) + suffix;
  if (path === '/glossary') return path + '/' + suffix;
  return href;
}
export function navigationHref(href: string): string {
  if (href.startsWith('/') && !href.startsWith('//')) return relativeHref(href);
  if (/^(?:https?:)?\/\//i.test(href)) {
    try {
      const url = new URL(href, 'https://www.calculatorfree.io');
      if (['calculatorfree.io', 'www.calculatorfree.io'].includes(url.hostname) && !url.port && !url.username && !url.password)
        return 'https://www.calculatorfree.io' + relativeHref(url.pathname + url.search + url.hash);
    } catch { /* Leave non-site links untouched. */ }
  }
  return href;
}
