"""Validate generated HTML without relying on client-side rendering."""
from pathlib import Path
from html.parser import HTMLParser
import json,sys,re
import xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1]
origin=sys.argv[1].rstrip('/') if len(sys.argv)>1 else None
if origin=='https://calculatorfree.io':origin='https://www.calculatorfree.io'
def canonical(route):
 return origin+(route[:-5] if origin=='https://www.calculatorfree.io' and route.endswith('.html') else route)
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
terms=json.loads((root/'src/lib/glossary-data.json').read_text())
paths=[x['local_route'] for x in catalog]+['/loan-calculators.html','/savings-investment-calculators.html','/financial-calculator.html','/about.html','/privacy.html','/methodology.html','/glossary/']+['/glossary/'+term['slug']+'/' for term in terms]
paths+=['/guides/should-i-pay-off-debt-or-save/','/guides/apr-vs-interest-rate/','/guides/is-refinancing-worth-it/','/guides/roth-ira-vs-traditional-ira/','/guides/how-much-emergency-fund-should-i-have/','/guides/rent-vs-buy-a-house/','/guides/are-mortgage-points-worth-it/','/guides/pay-off-car-loan-early/','/guides/biweekly-vs-monthly-mortgage-payments/','/guides/cd-vs-savings-account/','/guides/','/guides/mortgage-recast-vs-refinance/','/guides/debt-snowball-vs-avalanche/']
new_categories=['/retirement-calculators.html','/tax-income-calculators.html','/business-calculators.html','/everyday-calculators.html']
paths+=new_categories
checks=[]
for route in paths:
 file=root/'out'/route[1:]
 if route.endswith('/'):file=file/'index.html'
 elif route in new_categories:file=file.with_suffix('.html')
 p=Page();p.feed(file.read_text())
 assert len(p.h1s)==1,(route,p.h1s)
 assert p.metas.get('description'),route
 assert ('noindex' not in p.metas.get('robots','')) if origin else ('noindex' in p.metas.get('robots',''))
 assert p.canon==([canonical(route)] if origin else []),(route,p.canon)
 if route in new_categories:
  graph=p.schemas[0]['@graph'];assert graph[0]['@type']=='CollectionPage'
  assert any(x['@type']=='ItemList' for x in graph)
  assert any(x['@type']=='BreadcrumbList' for x in graph)
 if route=='/methodology.html':assert p.h1s==['Calculation methodology and sources']
 entry=next((x for x in catalog if x['local_route']==route),None)
 if entry and entry['id']!='real-estate':
  assert len(p.schemas)==1,route
  for heading in ['Understanding this calculation','Worked examples','Common questions','Scope and assumptions','Sources']:
   assert heading in ''.join(p.text),(route,heading)
  graph=p.schemas[0]['@graph'];assert graph[0]['name']==entry['title']
  app=graph[0];assert app['offers']['price']=='0' and app['offers']['priceCurrency']=='USD'
  assert 'aggregateRating' not in app and 'review' not in app
  if origin:assert app['url']==canonical(route) and app['offers']['url']==canonical(route)
  if origin:assert any(x['@type']=='BreadcrumbList' for x in graph)
 if route=='/vat-calculator.html':
  assert 'Remove 20% VAT from a gross price of 120' in ''.join(p.text)
  assert 'GOV.UK: VAT rates' in ''.join(p.text)
 if route.startswith('/glossary/'):
  assert len(p.schemas)==1,route
  kind='DefinedTermSet' if route=='/glossary/' else 'DefinedTerm'
  assert p.schemas[0]['@graph'][0]['@type']==kind,route
  if origin:assert any(x['@type']=='BreadcrumbList' for x in p.schemas[0]['@graph'])
  term=next((x for x in terms if route=='/glossary/'+x['slug']+'/'),None)
  if term:
   assert term['definition'] in ''.join(p.text),route
   assert term['example']['answer'] in ''.join(p.text),route
 if route.startswith('/guides/'):
  assert len(p.schemas)==1,route
  graph=p.schemas[0]['@graph'];assert graph[0]['@type']==('CollectionPage' if route=='/guides/' else 'Article')
  if route!='/guides/':
   assert graph[0]['headline']==p.h1s[0]
   if 'mortgage-recast' in route:expected=['$1,610.75','$153,213.95','$1,753.77','27.9 months','not an equal-cash ranking']
   elif 'cd-vs-savings' in route:expected=['$10,450.00','$10,425.00','$10,374.73','$10,499.88','$10,122.52','$87.76','50-digit Decimal','not current bank offers','does not model early closure or penalties']
   elif 'are-mortgage-points-worth-it' in route:expected=['40.44 months','month 32','-$439.14','$955.14','$516.00','-$484.00','4,680','50-digit Decimal','not current rates']
   elif 'should-i-pay-off-debt' in route:expected=['$3,254.63','$1,739.24','$1,204.64','50-digit Decimal','not a complete simulation']
   elif 'apr-vs-interest-rate' in route:expected=['9.175%','$4,761.44','$4,331.67','not a replacement','50-digit Decimal']
   elif 'is-refinancing-worth-it' in route:expected=['27.27 months','$318,212.12','$9,873.45','$8,567.62','50-digit Decimal']
   elif 'roth-ira-vs-traditional' in route:expected=['$369,992.31','$417,427.22','$322,557.40','$7,500','50-digit Decimal']
   elif 'how-much-emergency-fund' in route:expected=['$19,200.00','$13,200.00','1.875 months','50-digit Decimal','30th','not a personalized recommendation']
   elif 'rent-vs-buy-a-house' in route:expected=['$89,600','$14,576.51','$4,280.33','$36,426.94','50-digit Decimal','240 yearly rows','not a declining-price test']
   elif 'pay-off-car-loan' in route:expected=['$701.94','$2,370.33','$137.70','50-digit Decimal','daily-interest','precomputed']
   elif 'biweekly-vs-monthly' in route:expected=['$74,436.02','$770.66','$73,665.36','638 periods','50-digit Decimal','not a daily-interest']
   else:expected=['$1,792.13','$2,204.57','$412.44','Month 6','Month 22','50-digit decimal']
   for text in expected:
    assert text in ''.join(p.text),(route,text)
   expected_date='2026-10-28' if route in ['/guides/should-i-pay-off-debt-or-save/','/guides/apr-vs-interest-rate/','/guides/is-refinancing-worth-it/','/guides/roth-ira-vs-traditional-ira/','/guides/how-much-emergency-fund-should-i-have/','/guides/rent-vs-buy-a-house/'] else '2026-10-27'
   assert graph[0]['datePublished']==expected_date
 checks.append({'route':route,'canonical':p.canon,'h1':p.h1s[0]})
sitemap=(root/'out/sitemap.xml').read_text()
robots=(root/'out/robots.txt').read_text()
assert 'User-Agent: *' in robots and 'Allow: /' in robots
namespace={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
locations=[node.text for node in ET.fromstring(sitemap).findall('s:url/s:loc',namespace)]
if origin:
 assert len(locations)==len(set(locations))==len(checks)
 assert set(locations)=={canonical(route) for route in paths}
 assert all('?' not in url and '#' not in url for url in locations)
 assert origin+'/sitemap.xml' in robots
else:assert not locations and 'Sitemap:' not in robots
llms=(root/'out/llms.txt').read_text()
assert llms==(root/'public/llms.txt').read_text()
llms_links=re.findall(r'^- \[[^]]+\]\(([^)]+)\)',llms,re.M)
assert llms.startswith('# CalculatorFree.io\n') and len(llms_links)==len(set(llms_links))
# The curated guide uses the established public origin even for noindex previews.
canonical_origin='https://www.calculatorfree.io'
assert all(url.startswith(canonical_origin+'/') and '?' not in url and '#' not in url for url in llms_links)
assert set(llms_links)<={canonical_origin+(route[:-5] if route.endswith('.html') else route) for route in paths}|{canonical_origin+'/sitemap.xml'}
assert llms.index('## Business finance')<llms.index('## Supporting general-purpose calculators')
report={'passed':True,'configuration':'indexable-test-origin' if origin else 'default-noindex-preview','test_origin':origin,'pages':len(checks),'checks':checks,'no_live_indexing_or_ranking_claim':True}
out=root/'docs/financial-clone/evidence'/('seo-production-build.json' if origin else 'seo-preview-build.json')
out.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'passed':True,'pages':len(checks),'configuration':report['configuration']}))
