'use client';

interface Step {
  number: number;
  title: string;
  description: string;
  accentColor: string;
}

interface HowItWorksProps {
  title?: string;
  subtitle?: string;
  steps?: Step[];
}

const defaultSteps: Step[] = [
  {
    number: 1,
    title: 'Explora',
    description: 'Filtra por especie, tamaño, edad y ubicación. Encuentra al compañero ideal.',
    accentColor: 'bg-teal-50 text-teal-600',
  },
  {
    number: 2,
    title: 'Conecta',
    description: 'Envía tu solicitud de adopción o elige apadrinar mensualmente.',
    accentColor: 'bg-amber-50 text-amber-600',
  },
  {
    number: 3,
    title: 'Transforma',
    description: 'Dale un hogar, sigue su progreso, y recibe actualizaciones del refugio.',
    accentColor: 'bg-emerald-50 text-emerald-600',
  },
];

export default function HowItWorks({
  title = '¿Cómo funciona?',
  subtitle = 'Tres pasos sencillos para transformar una vida',
  steps = defaultSteps,
}: HowItWorksProps) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-stone-800">{title}</h2>
      <p className="mt-2 text-stone-500 max-w-lg mx-auto">{subtitle}</p>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <div key={step.number} className="bg-white rounded-2xl border border-stone-200 p-8">
            <div className={`w-12 h-12 rounded-full ${step.accentColor} flex items-center justify-center text-xl font-bold mx-auto`}>
              {step.number}
            </div>
            <h3 className="mt-4 font-semibold text-stone-800">{step.title}</h3>
            <p className="mt-2 text-sm text-stone-500">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
