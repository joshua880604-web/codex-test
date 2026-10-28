import catalog from './catalog-data.json';
import migratedRoutes from './calculator-route-aliases.json';
import {categoryPaths} from './calculator-categories';

// Normalize known storage routes and migrated own-site URLs to their final public documents.
const documents = new Set([...Object.values(categoryPaths),...catalog.map(tool => tool.local_route), '/financial-calculator.html', '/about.html', '/privacy.html', '/methodology.html', '/loan-calculators.html', '/savings-investment-calculators.html']);
function relativeHref(href: string): string {
  const split = href.search(/[?#]/), path = split < 0 ? href : href.slice(0, split), suffix = split < 0 ? '' : href.slice(split);
  const legacyPath=path.endsWith('.html')?path.slice(0,-5):path;
  const migrated=(migratedRoutes as Record<string,string>)[legacyPath];
  if(migrated)return migrated+suffix;
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
