const keys=[['sin','sin('],['cos','cos('],['tan','tan('],['sin⁻¹','asin('],['cos⁻¹','acos('],['tan⁻¹','atan('],['ln','ln('],['log','log('],['√','sqrt('],['x²','square'],['xʸ','^'],['1/x','reciprocal'],['π','pi'],['e','e'],['n!','factorial'],['±','negate']];
export default function QuickScientificKeys({press}:{press:(key:string)=>void}){
 return <div className="quick-scientific-keys" role="group" aria-label="Scientific functions">{keys.map(([label,action])=><button type="button" key={label} aria-label={label} title={['square','reciprocal','factorial','negate'].includes(action)?'Apply to selected text or the entire expression':undefined} onMouseDown={e=>e.preventDefault()} onClick={()=>press(action)}>{label}</button>)}</div>;
}
