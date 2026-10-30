import ModelStudyArticle from '@/components/ModelStudyArticle';
import {roasStudyArticle} from '@/lib/model-study-articles';
import {roasMarginStudy} from '@/lib/model-study-meta';
import {pageMetadata} from '@/lib/seo';
const page=pageMetadata(roasMarginStudy.path,roasMarginStudy.title,roasMarginStudy.description);
export const metadata={...page,openGraph:{...page.openGraph,type:'article' as const,publishedTime:roasMarginStudy.publishedOn,modifiedTime:roasMarginStudy.publishedOn}};
export default function Page(){return <ModelStudyArticle study={roasStudyArticle}/>;}
