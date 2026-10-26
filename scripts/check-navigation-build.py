from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import json,xml.etree.ElementTree as E
root=Path(__file__).resolve().parents[1];out=root/'out'
class Page(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.title='';self.inside=False;self.seen=False
 def handle_starttag(self,t,a):
  if t=='a':self.links.append(dict(a).get('href',''))
  if t=='title' and not self.seen:self.inside=True;self.seen=True
 def handle_endtag(self,t):
  if t=='title':self.inside=False
 def handle_data(self,t):
  if self.inside:self.title+=t
links=0;titles=[]
for node in E.fromstring((out/'sitemap.xml').read_text()).findall('{*}url/{*}loc'):
 path=urlsplit(node.text).path;file=out/path.lstrip('/')
 file=file/'index.html' if path.endswith('/') else file.with_suffix('.html')
 p=Page();p.feed(file.read_text());assert len(p.title)<=70,(path,len(p.title),p.title);titles.append({'path':path,'title':p.title,'length':len(p.title)})
 for href in p.links:
  u=urlsplit(href)
  if u.netloc and u.netloc not in ['www.calculatorfree.io','calculatorfree.io']:continue
  if u.scheme not in ['','http','https'] or not u.path:continue
  assert not u.path.endswith('.html'),(path,href)
  assert u.path!='/',(path,href)
  dest=out/u.path.lstrip('/')
  if u.path.endswith('/'):dest=dest/'index.html'
  elif not dest.suffix:dest=dest.with_suffix('.html')
  assert dest.is_file(),(path,href,dest)
  links+=1
report={'pages':len(titles),'internalAnchorsChecked':links,'allTitlesAtMost70':True,'allInternalLinksFinalAndResolve':True,'titles':titles}
(root/'docs/financial-clone/evidence/direct-links-20261027.json').write_text(json.dumps(report,indent=2)+'\n');print({k:v for k,v in report.items() if k!='titles'})
