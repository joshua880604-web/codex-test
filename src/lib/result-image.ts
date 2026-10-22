import {siteName} from './site';
import type {Metric} from './types';
import {formatMetric} from './sharing';
import {resultCardAddress} from './result-card-copy';

// Fixed 5:7 portrait report, generated locally without external images or fonts.
export async function resultImage(title:string,mode:string,metrics:Metric[],notes:string[],toolURL:string,copy:{interpretation:string|null;tagline:string}={interpretation:null,tagline:'A clearer plan starts with clearer numbers.'}){
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1680;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Image export is unavailable in this browser. Copy the summary instead.');
 type Text={text:string;x:number;y:number;font:string;color:string};
 type Box={x:number;y:number;w:number;h:number;fill:string;stroke:string};
 const texts:Text[]=[],boxes:Box[]=[];
 const ink='#18374d',muted='#536878',teal='#145b53',left=64,width=1072;
 const address=resultCardAddress(toolURL);
 const font=(size:number,bold=false)=>`${bold?'600 ':''}${size}px Arial, sans-serif`;
 const lineHeight=(size:number)=>Math.ceil(size*1.2);
 function lines(text:string,width:number,size:number,bold=false){
  ctx!.font=font(size,bold);const output:string[]=[];let line='';
  const flush=()=>{if(line){output.push(line);line='';}};
  for(const word of text.trim().split(/\s+/)){
   if(ctx!.measureText(line?line+' '+word:word).width<=width){line=line?line+' '+word:word;continue;}
   flush();for(const char of word){if(ctx!.measureText(line+char).width>width)flush();line+=char;}
  }flush();return output;
 }
 function write(text:string,x:number,y:number,width:number,size:number,color=ink,bold=false,maxLines=Infinity){
  const wrapped=lines(text,width,size,bold),visible=wrapped.slice(0,maxLines);
  if(wrapped.length>visible.length&&visible.length){
   let last=visible[visible.length-1];ctx!.font=font(size,bold);
   while(last&&ctx!.measureText(last+'…').width>width)last=last.slice(0,-1);
   visible[visible.length-1]=last.trimEnd()+'…';
  }
  for(const text of visible){texts.push({text,x,y,font:font(size,bold),color});y+=lineHeight(size);}
  return y;
 }
 function value(metric:Metric,x:number,y:number,width:number,size:number,color=ink){
  const text=formatMetric(metric);
  // Fit long amounts before wrapping; never abbreviate, round or cut their digits.
  while(size>40&&lines(text,width,size,true).length>1)size-=2;
  return write(text,x,y,width,size,color,true);
 }
 // Anchor the website and tool link to the bottom, independent of result length.
 const footerURL=address.label.startsWith('LOCAL PREVIEW')?'LOCAL PREVIEW • '+address.url:address.url;
 const disclaimer='Selected results. Review full inputs and assumptions at the tool link.';
 const footerHeight=lines(copy.tagline,width,32,true).length*lineHeight(32)+20+lineHeight(64)+12+
  lines(footerURL,width,30).length*lineHeight(30)+16+lines(disclaimer,width,30).length*lineHeight(30);
 const footerTop=1616-footerHeight;
 let y=64;
 y=write('RESULT SUMMARY • '+new Date().toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}),left,y,width,30,'#b8d7e2',true)+18;
 y=write(title,left,y,width,52,'#ffffff',true)+10;
 if(mode.trim().toLowerCase()!==title.trim().toLowerCase())y=write(mode,left,y,width,32,'#d5e6ed')+10;
 const headerBottom=y+18;y=headerBottom+24;
 if(metrics[0]){
  const top=y;y=write(metrics[0].label,90,y+24,1020,34,teal,true)+12;
  y=value(metrics[0],90,y,1020,84,teal)+24;
  boxes.push({x:left,y:top,w:width,h:y-top,fill:'#edf6f5',stroke:'#cfe3df'});
 }
 y+=18;
 for(let i=1;i<metrics.length;i+=2){
  const top=y;let bottom=y;
  for(let j=i;j<Math.min(i+2,metrics.length);j++){
   const x=left+(j-i)*548;
   let end=write(metrics[j].label,x+22,top+20,480,32,muted)+10;
   end=value(metrics[j],x+22,end,480,48)+20;bottom=Math.max(bottom,end);
  }
  for(let j=i;j<Math.min(i+2,metrics.length);j++)boxes.push({x:left+(j-i)*548,y:top,w:524,h:bottom-top,fill:'#fff',stroke:'#dce5eb'});
  y=bottom+16;
 }
 const bodyBottom=footerTop-32;
 if(y>bodyBottom)throw new Error('These results are too long for a portrait card. Copy the result summary to keep every value.');
 if(copy.interpretation){
  const available=Math.min(5,Math.floor((bodyBottom-y-38-12-40)/lineHeight(32)));
  if(available>=2){
   const top=y;y=write('READING YOUR RESULT',86,y+20,1028,30,muted,true)+12;
   y=write(copy.interpretation,86,y,1028,32,ink,false,available)+20;
   boxes.push({x:left,y:top,w:width,h:y-top,fill:'#f1f5f8',stroke:'#e0e8ef'});y+=18;
  }
 }
 if(notes.length){
  const available=Math.min(3,Math.floor((bodyBottom-y-lineHeight(30)-10)/lineHeight(30)));
  if(available>=1){
   y=write('MODEL NOTE • FULL DETAILS AT THE TOOL LINK',left,y,width,30,muted,true)+10;
   write(notes.slice(0,2).join(' '),left,y,width,30,muted,false,available);
  }
 }
 const divider=footerTop-20;
 y=write(copy.tagline,left,footerTop,width,32,teal,true)+20;
 y=write(siteName,left,y,width,64,teal,true)+12;
 y=write(footerURL,left,y,width,30,'#285d80')+16;
 write(disclaimer,left,y,width,30,muted);
 ctx.fillStyle='#f6f8fb';ctx.fillRect(0,0,1200,1680);
 ctx.beginPath();ctx.roundRect(32,24,1136,1632,24);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='#dce5eb';ctx.stroke();
 ctx.save();ctx.beginPath();ctx.roundRect(32,24,1136,1632,24);ctx.clip();ctx.fillStyle=ink;ctx.fillRect(32,24,1136,headerBottom-24);ctx.fillStyle='#3a9d91';ctx.fillRect(32,24,1136,8);ctx.restore();
 for(const box of boxes){ctx.beginPath();ctx.roundRect(box.x,box.y,box.w,box.h,14);ctx.fillStyle=box.fill;ctx.fill();ctx.strokeStyle=box.stroke;ctx.lineWidth=1;ctx.stroke();}
 ctx.strokeStyle='#d6e0e8';ctx.beginPath();ctx.moveTo(left,divider);ctx.lineTo(1136,divider);ctx.stroke();
 ctx.textBaseline='top';for(const t of texts){ctx.font=t.font;ctx.fillStyle=t.color;ctx.fillText(t.text,t.x,t.y);}
 return new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Unable to create an image. Copy the summary instead.')),'image/png'));
}
