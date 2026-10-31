import type {Field,Values} from '@/lib/types';
import {inputReviewLabel,inputReviewPreview,inputReviewValue} from '@/lib/input-review';
export default function InputReviewSummary({title,fields,values,shared=null,context}:{title:string;fields:Field[];values:Values;shared?:Values|null;context?:string}){
 const preview=inputReviewPreview(fields,values);
 return <><span className="input-review-heading"><span>{title}<span className="input-review-source">{inputReviewLabel(fields,values,shared)}</span></span><span className="input-review-edit"><span className="input-review-closed">Edit</span><span className="input-review-open">Close</span><span aria-hidden="true">▾</span></span></span>{context&&<span className="input-review-context">{context}</span>}<span className="input-review-values">{preview.map(f=><span key={f.key}><span>{f.label}</span><strong>{inputReviewValue(f,values)}</strong></span>)}</span>{fields.length>preview.length&&<span className="input-review-more">+{fields.length-preview.length} more settings in this section</span>}</>;
}
