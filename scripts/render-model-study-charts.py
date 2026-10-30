"""Standalone shareable figures; build-time only, no browser plotting library."""
import os
os.environ.setdefault('MPLCONFIGDIR','/tmp/calculatorfree-matplotlib')
import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter,MaxNLocator
D=json.loads(Path('src/lib/model-study-data.json').read_text());out=Path('public/research-charts');out.mkdir(exist_ok=True)
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'svg.fonttype':'none','svg.hashsalt':'calculatorfree-model-studies-20261030','axes.spines.top':False,'axes.spines.right':False,'axes.edgecolor':'#b5c1d1','text.color':'#172236','axes.labelcolor':'#34445b','xtick.color':'#34445b','ytick.color':'#34445b','figure.facecolor':'white','axes.facecolor':'white'})
colors=['#3162bc','#ab4a18','#158064','#8544ac'];markers=['o','s','D','^'];styles=['-','--',':','-.']
def make(title,ylabel):
 f,a=plt.subplots(figsize=(10,6.3));f.subplots_adjust(left=.13,right=.96,top=.80,bottom=.28)
 f.suptitle(title,x=.13,y=.94,ha='left',fontweight='bold',fontsize=16);a.set_ylabel(ylabel);a.grid(axis='y',alpha=.25);a.set_axisbelow(True);a.yaxis.set_major_locator(MaxNLocator(5));a.axhline(0,color='#8c99ad',linewidth=1);return f,a
money=FuncFormatter(lambda n,pos:('-' if n<0 else '')+'$'+format(abs(n),',.0f'))
def save(f,a,name,note,path):
 f.text(.13,.16,note,fontsize=9,va='top',linespacing=1.5,color='#4b5d75')
 f.text(.13,.065,'CalculatorFree.io | Model scenarios checked October 30, 2026',fontsize=9,fontweight='bold',color='#6255aa')
 f.text(.13,.035,'https://www.calculatorfree.io'+path,fontsize=8,color='#4b5d75')
 f.savefig(out/(name+'.svg'),metadata={'Date':'2026-10-30','Description':'Hypothetical model sensitivity analysis; not observed financial outcomes.'});f.savefig(out/(name+'.png'),dpi=160,metadata={'Description':'Hypothetical model sensitivity analysis; not observed financial outcomes.'});plt.close(f)
f,a=make('How inflation changes the Coast FIRE threshold','Coast threshold (today USD)')
for i,n in enumerate([5,7,9]):
 rows=[r for r in D['coast'] if r['nominal']==n];a.plot([r['inflation'] for r in rows],[r['threshold'] for r in rows],color=colors[i],marker=markers[i],linestyle=styles[i],label=f'{n}% nominal return')
a.set_ylim(bottom=0);a.set_xlabel('Annual inflation assumption (%)');a.set_xticks([2,2.5,3,3.5,4]);a.yaxis.set_major_formatter(money);a.legend(frameon=False,fontsize=9)
save(f,a,'coast-inflation-chart','15 hypothetical cases. Age 35 to 65; $40,000 annual spending in today’s USD; 4% sizing assumption.\nConstant returns and inflation; no market sequences or success probabilities tested.','/guides/coast-fire-inflation-sensitivity/')
rows=[r for r in D['brrrr'] if r['rate']==7]
f,a=make('More refinance borrowing leaves less cash in the deal','Signed cash remaining (USD)');a.bar([r['arv']/1000 for r in rows],[r['cashLeft'] for r in rows],width=12,color=colors[0]);a.set_xlabel('After-repair value assumption (thousand USD)');a.set_xticks([225,250,275,300]);a.yaxis.set_major_formatter(money)
save(f,a,'brrrr-cash-left-chart','7% rate slice of 12 hypothetical cases. 75% LTV; $84,400 pre-refinance cash; $4,000 refinance costs.\nNegative cash remaining means financed cash above initial investment, not profit. Loan eligibility is not tested.','/guides/brrrr-refinance-cash-flow-analysis/')
f,a=make('Larger refinance loans reduce monthly cash flow','Monthly cash flow after reserve (USD)');a.plot([r['arv']/1000 for r in rows],[r['cashFlow'] for r in rows],color=colors[0],marker='o');a.set_xlabel('After-repair value assumption (thousand USD)');a.set_xticks([225,250,275,300]);a.yaxis.set_major_formatter(money)
save(f,a,'brrrr-cash-flow-chart','Same 7% slice. $1,490 monthly NOI; $100 capital reserve; 75% LTV; 30-year amortization.\nRents and operations stay fixed. These are model estimates, not lender quotes or observed deal returns.','/guides/brrrr-refinance-cash-flow-analysis/')
f,a=make('The same ROAS can imply a loss or a surplus','Post-ad contribution margin (%)')
for i,m in enumerate([20,30,40,50]):
 rows=[r for r in D['roas'] if r['margin']==m];a.plot([r['multiple'] for r in rows],[r['postAdMargin'] for r in rows],color=colors[i],marker=markers[i],linestyle=styles[i],label=f'{m}% pre-ad margin')
a.set_xlabel('Actual ROAS (revenue multiple)');a.set_xticks([2,3,4,5,6]);a.legend(frameon=False,fontsize=9,ncol=2)
save(f,a,'roas-margin-chart','20 hypothetical cases. Revenue fixed at $12,000; pre-ad margins include entered non-ad variable costs.\nPost-ad contribution is before fixed overhead, financing and income tax. Not a net-profit or campaign forecast.','/guides/roas-profit-margin-analysis/')
print('Rendered4standaloneSVG+4PNGfigures; no website runtime dependency.')
