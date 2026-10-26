import content from './category-page-content.json';
import {categoryPaths} from './calculator-categories';
export const categoryPages = content.map(page=>({...page,path:categoryPaths[page.id]}));
export type CategoryPage = typeof categoryPages[number];
export function categoryPageBySlug(slug:string){return categoryPages.find(page=>page.path==='/'+slug);}
