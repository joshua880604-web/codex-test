"""Build-time standalone chart artifacts; no new browser library."""
import os
os.environ.setdefault('MPLCONFIGDIR','/tmp/calculatorfree-matplotlib')
import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter,MaxNLocator
D=json.loads(Path('src/lib/guide-check-data.json').read_text());out=Path('public/research-charts')
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'svg.fonttype':'none','svg.hashsalt':'calculatorfree-guide-check-20261030','axes.spines.top':False,'axes.spines.right':False,'axes.edgecolor':'#b5c1d1','text.color':'#172236','axes.labelcolor':'#34445b','xtick.color':'#34445b','ytick.color':'#34445b','figure.facecolor':'white','axes.facecolor':'white'})
colors=['#3162bc','#ab4a18','#158064'];markers=['o','s','D'];styles=['-','--',':']
def make(title,ylabel):
 f,a=plt.subplots(figsize=(10,6.3));f.subplots_adjust(left=.14,right=.97,top=.80,bottom=.28);f.suptitle(title,x=.14,y=.94,ha='left',fontweight='bold',fontsize=16);a.set_ylabel(ylabel);a.grid(axis='y',alpha=.25);a.set_axisbelow(True);a.yaxis.set_major_locator(MaxNLocator(5));a.yaxis.set_major_formatter(FuncFormatter(lambda n,p:('-' if n<0 else '')+'$'+format(abs(n),',.0f')));a.axhline(0,color='#8c99ad',linewidth=1);return f,a
def save(f,a,name,note,path):
 f.text(.14,.16,note,fontsize=9,va='top',linespacing=1.5,color='#4b5d75');f.text(.14,.065,'CalculatorFree.io | Hypothetical model checks, October 30, 2026',fontsize=9,fontweight='bold',color='#6255aa');f.text(.14,.035,'https://www.calculatorfree.io'+path,fontsize=8,color='#4b5d75')
 f.savefig(out/(name+'.svg'),metadata={'Date':'2026-10-30','Description':'Hypothetical model scenarios, not observed borrower outcomes.'});f.savefig(out/(name+'.png'),dpi=160,metadata={'Description':'Hypothetical model scenarios, not observed borrower outcomes.'});plt.close(f)
f,a=make('Compare debt strategies at the same monthly budget','Total modeled interest (USD)')
for i,strategy in enumerate(['snowball','avalanche']):
 rows=[r for r in D['debt'] if r['strategy']==strategy];a.plot([r['budget'] for r in rows],[r['interest'] for r in rows],label=strategy.title(),color=colors[i],marker=markers[i],linestyle=styles[i])
a.set_ylim(bottom=0);a.set_xlabel('Total monthly budget (USD)');a.set_xticks([300,400,500,600,700]);a.legend(frameon=False)
save(f,a,'debt-budget-interest-chart','10 hypothetical runs. Same $8,500 principal, fixed APRs and minimums; payment rollover stays on.\nNo new borrowing, fees, rate changes or repayment behavior is modeled.','/guides/debt-snowball-vs-avalanche/')
f,a=make('Separate extra annual payments from payment frequency','Total future interest (USD)')
for i,(key,label) in enumerate([('standardInterest','Standard monthly: 12M/year'),('biweeklyInterest','Biweekly: 13M/year'),('matchedInterest','Matched monthly: 13M/year')]):a.plot([r['rate'] for r in D['biweekly']],[r[key] for r in D['biweekly']],label=label,color=colors[i],marker=markers[i],linestyle=styles[i])
a.set_ylim(bottom=0);a.set_xlabel('Nominal annual rate (%)');a.set_xticks([0,2,4,6,8]);a.legend(frameon=False,fontsize=9)
save(f,a,'biweekly-budget-interest-chart','Five hypothetical rate cases; three plans each. $300,000; 30 years; M is scheduled monthly P&I.\nBiweekly uses 26 equal periods, not exact calendar days. No service fees or delayed crediting.','/guides/biweekly-vs-monthly-mortgage-payments/')
f,a=make('Higher fees delay a lower-rate quote’s cost advantage','Net borrowing-cost saving for B (USD)')
for i,fee in enumerate([3000,4000]):
 rows=[r for r in D['points'] if r['feeB']==fee];a.plot([r['hold'] for r in rows],[r['netSaving'] for r in rows],label=f'Extra upfront B: ${fee+1000:,}',color=colors[i],marker=markers[i],linestyle=styles[i])
a.set_xlabel('Scheduled monthly payments made');a.set_xticks([0,12,24,36,48,60]);a.legend(frameon=False,fontsize=9)
save(f,a,'points-holding-cost-chart','12 hypothetical quote comparisons. $400,000; 30 years; A 6.75%/0 points, B 6.375%/1 point.\nPositive favors B; negative favors A. Cash-paid costs; no tax benefit, discounting or opportunity cost.','/guides/are-mortgage-points-worth-it/')
print('Rendered3SVG+3PNGdownloadablefigures.')
