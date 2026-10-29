export type MinimumPlan={balance:number;apr:number;percent:number;floor:number;interestExtra:boolean;extra:number};
export function minimumPaymentPlan(x:MinimumPlan){
 if(Object.values(x).some(v=>typeof v==='number'&&!Number.isFinite(v))||x.balance<0||x.balance>1e12||x.apr<0||x.apr>1000||x.percent<0||x.percent>100||x.floor<0||x.extra<0)throw new Error('Use a nonnegative balance, payment floor and extra payment, APR from 0% to 1000%, and minimum percent from 0% to 100%.');
 let balance=x.balance,total=0;const rows:number[][]=[];let firstMinimum=0;
 for(let i=1;i<=12000&&balance>1e-7;i++){
  const interest=balance*x.apr/1200,minimum=Math.min(balance+interest,Math.max(x.floor,balance*x.percent/100+(x.interestExtra?interest:0))),payment=Math.min(balance+interest,minimum+x.extra);
  if(i===1)firstMinimum=minimum;
  if(payment<=interest)throw new Error('Minimum payment plus extra does not cover interest. Increase the payment or review the minimum rule.');
  const principal=payment-interest;balance=Math.max(0,balance-principal);total+=interest;rows.push([i,payment,interest,principal,balance]);
 }
 if(balance>1e-6)throw new Error('Balance is not repaid within the supported 1,000-year term.');
 return {rows,total,firstMinimum,firstPayment:rows[0]?.[1]??0,months:rows.length,totalPayments:x.balance+total};
}
