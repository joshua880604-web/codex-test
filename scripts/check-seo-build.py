"""Validate generated HTML without relying on client-side rendering."""
from pathlib import Path
from html.parser import HTMLParser
import json,sys
root=Path(__file__).resolve().parents[1]
origin=sys.argv[1] if len(sys.argv)>1 else None
class Page(HTMLParser):
 def __init__(self):super().__init__();self.metas={};self.canon=[];self.h1s=[];self.in_h1=False;self.in_schema=False;self.schema_text='';self.schemas=[];self.text=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='meta':self.metas[a.get('name',a.get('property',''))]=a.get('content','')
  if tag=='link' and a.get('rel')=='canonical':self.canon.append(a.get('href'))
  if tag=='h1':self.in_h1=True;self.h1s.append('')
  if tag=='script' and a.get('type')=='application/ld+json':self.in_schema=True;self.schema_text=''
 def handle_endtag(self,tag):
  if tag=='h1':self.in_h1=False
  if tag=='script' and self.in_schema:self.schemas.append(json.loads(self.schema_text));self.in_schema=False
 def handle_data(self,data):
  if self.in_h1:self.h1s[-1]+=data
  if self.in_schema:self.schema_text+=data
  self.text.append(data)
catalog=json.loads((root/'src/lib/catalog-data.json').read_text())
paths=[x['local_route'] for x in catalog]+['/financial-calculator.html','/about.html','/privacy.html','/methodology.html']
checks=[]
for route in paths:
 p=Page();p.feed((root/'.next/server/app'/(route[1:]+'.html')).read_text())
 assert len(p.h1s)==1,(route,p.h1s)
 assert p.metas.get('description'),route
 assert ('noindex' not in p.metas.get('robots','')) if origin else ('noindex' in p.metas.get('robots',''))
 assert p.canon==([origin+route] if origin else []),(route,p.canon)
 if route=='/methodology.html':assert p.h1s==['Calculation methodology and sources']
 entry=next((x for x in catalog if x['local_route']==route),None)
 if entry and entry['id']!='real-estate':
  assert len(p.schemas)==1,route
  for heading in ['Understanding this calculation','Worked examples','Common questions','Scope and assumptions','Sources']:
   assert heading in ''.join(p.text),(route,heading)
  graph=p.schemas[0]['@graph'];assert graph[0]['name']==entry['title']
  if origin:assert any(x['@type']=='BreadcrumbList' for x in graph)
 if route=='/vat-calculator.html':
  assert 'Remove 20% VAT from a gross price of 120' in ''.join(p.text)
  assert 'GOV.UK: VAT rates' in ''.join(p.text)
 checks.append({'route':route,'canonical':p.canon,'h1':p.h1s[0]})
sitemap=(root/'.next/server/app/sitemap.xml.body').read_text()
robots=(root/'.next/server/app/robots.txt.body').read_text()
assert 'Disallow: /api/' in robots
if origin:assert sitemap.count('<loc>')==79 and origin+'/sitemap.xml' in robots
else:assert '<loc>' not in sitemap and 'Sitemap:' not in robots
report={'passed':True,'configuration':'indexable-test-origin' if origin else 'default-noindex-preview','test_origin':origin,'pages':len(checks),'checks':checks,'no_live_indexing_or_ranking_claim':True}
out=root/'docs/financial-clone/evidence'/('seo-production-build.json' if origin else 'seo-preview-build.json')
out.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'passed':True,'pages':len(checks),'configuration':report['configuration']}))
