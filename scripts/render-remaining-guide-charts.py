"""Standard plotting at authoring time; no plotting dependency is sent to browsers."""
import os,textwrap,json
os.environ.setdefault('MPLCONFIGDIR','/tmp/calculatorfree-matplotlib')
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter,MaxNLocator
entries=json.loads(Path('src/lib/remaining-guide-data.json').read_text())
plt.rcParams.update({'text.parse_math':False,'font.family':'DejaVu Sans','font.size':10,'svg.fonttype':'none','svg.hashsalt':'remaining-guides-20261030','axes.spines.top':False,'axes.spines.right':False,'figure.facecolor':'white','axes.facecolor':'white','text.color':'#172236','axes.labelcolor':'#34445b'})
notes={
'recast':'$300,000; 6%; 25 years. Both alternatives use the same lump sum. Future interest excludes the $300 recast fee; later monthly budgets differ.',
'cd':'$10,000; constant effective APY for one year; no tax, fees or withdrawal. Hypothetical rates, not bank offers or changing-rate savings accounts.',
'car':'$20,000; 6% nominal annual rate; $400 regular payment plus entered monthly extra. Capped final payment; no prepayment charge.',
'emergency':'$3,200 monthly essential expenses; $4,000 existing reserves; no interest. Target is not a measured probability of covering emergencies.',
'rent':'$400,000 home; 20% down; 6% mortgage; 5-year exit; 3% purchase and 6% selling costs. Rent/cost growth, investment return and tax benefit are zero.',
'debt-save':'$6,000 debt; 18% APR; $200 required payment; $200 spare cash split between extra debt and cash. Debt interest only, not terminal wealth or liquidity value.',
'apr':'$20,000; 5 years; 6% nominal rate; monthly payments; no financed fees. Cash-paid upfront fees vary. Chart shows dollars, not an APR percentage.',
'refinance':'$250,000 balance refinanced at 5%; $3,000 cash-paid fee. Full-term interest plus fee; different end dates and monthly budgets, no discounting.',
'ira':'Age 35 to 65; $6,000 pretax annual budget; 6% return; 20% current tax. Roth receives $4,800/year. Assumed eligibility, deductibility and qualified withdrawals.',
'margin':'$100 unit cost; price = cost × (1 + markup). Gross profit excludes unentered costs and does not estimate net profit or customer demand.',
'coast':'Current age 35; $40,000 real annual spending; 4% target-sizing assumption. 7% nominal return, 2.5% inflation; no pre-retirement withdrawals or success probability.',
'snowball':'$5,000 at 22%/$150 minimum; $3,000 at 18%/$100 minimum. $400 total monthly budget; one extra $1,000 payment; monthly accrual; rollover on.',
'avalanche':'$5,000 at 22%/$150 minimum; $3,000 at 18%/$100 minimum. $400 total monthly budget; one extra $1,000 payment; monthly accrual; rollover on.',
'barista':'Age 45 to 65; $36,000 annual bridge spending; $24,000 part-time income. $600,000 terminal target; zero return/inflation isolates cash-flow timing.'}
titles={'recast':'Mortgage Recast vs. Refinance','cd':'CD vs. Savings Account','car':'Paying Off a Car Loan Early','emergency':'Emergency Fund Coverage','rent':'Rent vs. Buy a House','debt-save':'Pay Off Debt or Save','apr':'APR vs. Interest Rate','refinance':'Is Refinancing Worth It?','ira':'Roth IRA vs. Traditional IRA','margin':'Margin vs. Markup','coast':'How to Calculate Coast FIRE','snowball':'Debt Snowball Payment Timing','avalanche':'Debt Avalanche Payment Timing','barista':'Barista FIRE vs. Coast FIRE'}
for e in entries:
 fig,ax=plt.subplots(figsize=(11,7));fig.subplots_adjust(left=.15,right=.97,top=.82,bottom=.32)
 fig.suptitle('Model check: '+titles[e['id']],x=.15,y=.95,ha='left',fontweight='bold',fontsize=14)
 for i,label in enumerate(e['seriesLabels']):ax.plot([r['x'] for r in e['rows']],[r['outputs'][i] for r in e['rows']],label=label,color=['#3162bc','#ab4a18'][i],marker=['o','s'][i],linestyle=['-','--'][i])
 ax.set_ylim(bottom=0);ax.set_xticks([r['x'] for r in e['rows']]);ax.set_xlabel(e['axisLabel']);ax.set_ylabel('Modeled amount (USD)');ax.yaxis.set_major_locator(MaxNLocator(5));ax.yaxis.set_major_formatter(FuncFormatter(lambda n,p:'$'+format(n,',.0f')));ax.grid(axis='y',alpha=.25);ax.legend(frameon=False,fontsize=9)
 fig.text(.15,.22,'\n'.join(textwrap.wrap(notes[e['id']],115)),fontsize=9,va='top',linespacing=1.5,color='#4b5d75')
 fig.text(.15,.09,'CalculatorFree.io | 5 hypothetical deterministic cases | Checked October 30, 2026',fontsize=9,fontweight='bold',color='#6255aa')
 fig.text(.15,.05,'https://www.calculatorfree.io/guides/'+e['slug']+'/',fontsize=8,color='#4b5d75')
 out=Path('public/research-charts')/('guide-'+e['id']+'-check')
 fig.savefig(str(out)+'.svg',metadata={'Date':'2026-10-30','Description':notes[e['id']]});fig.savefig(str(out)+'.png',dpi=160,metadata={'Description':notes[e['id']]});plt.close(fig)
print('Rendered 14 SVG and 14 PNG standalone chart downloads.')
