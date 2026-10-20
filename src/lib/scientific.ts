export function scientific(expression:string,angle:'Degrees'|'Radians'='Degrees'):number {
 if(!['Degrees','Radians'].includes(angle))throw new Error('Choose Degrees or Radians.');
 if(!expression.trim())throw new Error('Enter an expression.');
 if(expression.length>2000)throw new Error('Expression is too long (maximum 2,000 characters).');
 const source=expression.replaceAll('π','pi').replaceAll('×','*').replaceAll('÷','/').replaceAll('−','-').toLowerCase();
 const tokens:string[]=[];let index=0;
 while(index<source.length){if(/\s/.test(source[index])){index++;continue;}const match=/^(?:(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|[a-z]+|[()+\-*/^!%])/.exec(source.slice(index));if(!match)throw new Error('Unsupported character at position '+(index+1)+'.');tokens.push(match[0]);index+=match[0].length;if(tokens.length>512)throw new Error('Too many expression tokens.');}
 let cursor=0,depth=0;
 const finite=(n:number)=>{if(!Number.isFinite(n))throw new Error('Expression has no finite real result. Check domains, powers and division.');return n;};
 const take=(value:string)=>{if(tokens[cursor]!==value)throw new Error('Expected '+value+' in the expression.');cursor++;};
 function call(name:string,x:number):number {
  const radians=angle==='Degrees'?x*Math.PI/180:x;
  const output=(x:number)=>angle==='Degrees'?x*180/Math.PI:x;
  if(['asin','acos'].includes(name)&&(x < -1||x>1))throw new Error(name+' requires a value between -1 and 1.');
  if(name==='sqrt'&&x<0)throw new Error('Square root requires a nonnegative real value.');
  if(['ln','log','log10'].includes(name)&&x<=0)throw new Error('Logarithms require a positive value.');
  if(name==='tan'&&Math.abs(Math.cos(radians))<1e-14)throw new Error('Tangent is undefined at this angle.');
  if(angle==='Degrees'&&['sin','cos'].includes(name)&&Number.isInteger(x/90)) {const q=((x/90)%4+4)%4;return name==='sin'?[0,1,0,-1][q]:[1,0,-1,0][q];}
  const functions:Record<string,(v:number)=>number>={sin:()=>Math.sin(radians),cos:()=>Math.cos(radians),tan:()=>Math.tan(radians),asin:v=>output(Math.asin(v)),acos:v=>output(Math.acos(v)),atan:v=>output(Math.atan(v)),ln:Math.log,log:Math.log10,log10:Math.log10,sqrt:Math.sqrt,cbrt:Math.cbrt,abs:Math.abs,exp:Math.exp};
  if(!functions[name])throw new Error('Unknown function: '+name+'.');return finite(functions[name](x));
 }
 function parse(min=0):number {
  if(++depth>64)throw new Error('Expression nesting is too deep.');
  const token=tokens[cursor++];let left:number;
  if(token===undefined)throw new Error('Expression is incomplete.');
  if(token==='+'||token==='-')left=(token==='-'?-1:1)*parse(30);
  else if(token==='('){left=parse();take(')');}
  else if(token==='pi')left=Math.PI;
  else if(token==='e')left=Math.E;
  else if(/^(?:\d|\.)/.test(token))left=finite(Number(token));
  else if(/^[a-z]+$/.test(token)){take('(');left=call(token,parse());take(')');}
  else throw new Error('Expected a number, constant or function.');
  while(cursor<tokens.length){
   const next=tokens[cursor];
   if(next==='!'||next==='%'){if(50<min)break;cursor++;if(next==='%')left/=100;else {if(!Number.isInteger(left)||left<0||left>170)throw new Error('Factorial requires a whole number from 0 through 170.');let result=1;for(let n=2;n<=left;n++)result*=n;left=result;}continue;}
   const implicit=next==='('||/^[a-z]+$/.test(next);
   const operator=implicit?'*':next,precedence=operator==='+'||operator==='-'?10:operator==='*'||operator==='/'?20:operator==='^'?40:-1;
   if(precedence<min||precedence<0)break;
   if(!implicit)cursor++;
   const right=parse(precedence+(operator==='^'?0:1));
   if(operator==='/'&&right===0)throw new Error('Cannot divide by zero.');
   if(operator==='^'&&left===0&&right===0)throw new Error('Zero to the power zero is indeterminate in this calculator.');
   left=finite(operator==='+'?left+right:operator==='-'?left-right:operator==='*'?left*right:operator==='/'?left/right:Math.pow(left,right));
  }
  depth--;return finite(left);
 }
 const answer=parse();if(cursor!==tokens.length)throw new Error('Unexpected token or missing operator near '+tokens[cursor]+'.');return Object.is(answer,-0)?0:answer;
}
