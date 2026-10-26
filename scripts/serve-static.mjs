import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('out'),port=Number(process.env.PORT??3000);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.txt':'text/plain; charset=utf-8','.xml':'application/xml','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.woff2':'font/woff2'};
try{await stat(root)}catch{throw new Error('Run npm run build first to generate out/.');}
createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/'){res.writeHead(301,{Location:'/financial-calculator'});res.end();return;}
  let file=resolve(root,'.'+pathname);
  if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  if (!extname(pathname) && !pathname.endsWith('/')) {
   try { await stat(file); } catch (error) { if (error.code !== 'ENOENT') throw error; file += '.html'; }
  }
  if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  if((await stat(file)).isDirectory()){
   if(!pathname.endsWith('/')){const url=new URL(req.url,'http://localhost');res.writeHead(301,{Location:pathname+'/'+url.search});res.end();return;}
   file=resolve(file,'index.html');
  }
  const data=await readFile(file);
  res.writeHead(200,{'Content-Type':types[extname(file)]??'application/octet-stream'});res.end(req.method==='HEAD'?undefined:data);
 }catch{
  res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(req.method==='HEAD'?undefined:await readFile(resolve(root,'404.html')).catch(()=>Buffer.from('Not found')));
 }
}).listen(port,'0.0.0.0',()=>console.log(`Static preview: http://localhost:${port}`));
