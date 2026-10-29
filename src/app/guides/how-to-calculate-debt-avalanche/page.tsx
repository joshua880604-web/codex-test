import DebtMethodGuide,{debtMethodMetadata} from '@/components/DebtMethodGuide';
export const metadata=debtMethodMetadata('avalanche');
export default function AvalancheGuide(){return <DebtMethodGuide strategy="avalanche"/>;}
