import DebtMethodGuide,{debtMethodMetadata} from '@/components/DebtMethodGuide';
export const metadata=debtMethodMetadata('snowball');
export default function SnowballGuide(){return <DebtMethodGuide strategy="snowball"/>;}
