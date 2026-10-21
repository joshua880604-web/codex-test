from pathlib import Path
from html.parser import HTMLParser
import json
root=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.links=[];self.parts=[];self.skip=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag in ['script','style']:self.skip+=1
  if 'id' in a:self.ids.append(a['id'])
  if tag=='a':self.links.append(a.get('href',''))
 def handle_endtag(self,tag):
  if tag in ['script','style']:self.skip=max(0,self.skip-1)
 def handle_data(self,data):
  if not self.skip:self.parts.append(data)
insights=json.loads((root/'src/lib/guide-insights.json').read_text());catalog=json.loads((root/'src/lib/catalog-data.json').read_text());checks=[]
for entry in catalog:
 if entry['id']=='real-estate':continue
 p=Page();p.feed((root/'out'/entry['local_route'][1:]).read_text())
 assert len(p.ids)==len(set(p.ids)),entry['id']+' duplicate IDs'
 for anchor in ['worked-examples','common-questions','scope-assumptions','sources']:
  assert anchor in p.ids and '#'+anchor in p.links,(entry['id'],anchor)
 item=insights.get(entry['id'])
 if item:
  text=' '.join(' '.join(p.parts).split())
  for value in [item['answer'],*[r['meaning'] for r in item['results']],*item['compare'],*item['checks']]:assert ' '.join(value.split()) in text,(entry['id'],value)
  for anchor in ['reading-results','compare-scenarios']:assert anchor in p.ids and '#'+anchor in p.links
 checks.append({'id':entry['id'],'rich_result_explanations':bool(item),'guide_navigation':True})
report={'passed':True,'pages':len(checks),'enhanced_guides':len(insights),'checks':checks,'ranking_or_ai_citation_effect':'not measured'}
(root/'docs/financial-clone/evidence/guide-insights-qa.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'passed':True,'pages':len(checks),'enhanced_guides':len(insights)}))
