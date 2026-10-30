import ModelStudyArticle from '@/components/ModelStudyArticle';
import {brrrrStudyArticle} from '@/lib/model-study-articles';
import {brrrrCashFlowStudy} from '@/lib/model-study-meta';
import {pageMetadata} from '@/lib/seo';
const page=pageMetadata(brrrrCashFlowStudy.path,brrrrCashFlowStudy.title,brrrrCashFlowStudy.description);
export const metadata={...page,openGraph:{...page.openGraph,type:'article' as const,publishedTime:brrrrCashFlowStudy.publishedOn,modifiedTime:brrrrCashFlowStudy.publishedOn}};
export default function Page(){return <ModelStudyArticle study={brrrrStudyArticle}/>;}
