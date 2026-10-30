import ModelStudyArticle from '@/components/ModelStudyArticle';
import {coastStudyArticle} from '@/lib/model-study-articles';
import {coastInflationStudy} from '@/lib/model-study-meta';
import {pageMetadata} from '@/lib/seo';
const page=pageMetadata(coastInflationStudy.path,coastInflationStudy.title,coastInflationStudy.description);
export const metadata={...page,openGraph:{...page.openGraph,type:'article' as const,publishedTime:coastInflationStudy.publishedOn,modifiedTime:coastInflationStudy.publishedOn}};
export default function Page(){return <ModelStudyArticle study={coastStudyArticle}/>;}
