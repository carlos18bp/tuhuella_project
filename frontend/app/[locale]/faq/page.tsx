import FAQAccordion from '@/components/ui/FAQAccordion';
import { homeFaqs, animalsFaqs, sheltersFaqs, campaignsFaqs, buscoAdoptarFaqs } from '@/lib/data/faqs';

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-3xl font-bold text-stone-800">Preguntas Frecuentes</h1>
      <p className="mt-2 text-stone-500">Resolvemos tus dudas sobre Tu Huella</p>

      <FAQAccordion items={homeFaqs} title="General" />
      <FAQAccordion items={animalsFaqs} title="Adopción" />
      <FAQAccordion items={sheltersFaqs} title="Refugios" />
      <FAQAccordion items={campaignsFaqs} title="Campañas y donaciones" />
      <FAQAccordion items={buscoAdoptarFaqs} title="Busco Adoptar" />
    </div>
  );
}
