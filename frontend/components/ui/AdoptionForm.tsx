'use client';

import { useState } from 'react';

type FormStep = 'questionnaire' | 'review' | 'submit';

export type AdoptionFormData = {
  housing_type: string;
  has_yard: string;
  other_pets: string;
  experience: string;
  daily_hours: string;
  motivation: string;
};

interface AdoptionFormProps {
  animalName: string;
  onSubmit: (data: { form_answers: AdoptionFormData; notes: string }) => void | Promise<void>;
  submitting?: boolean;
}

const QUESTIONS: { key: keyof AdoptionFormData; label: string; type: 'select' | 'textarea'; options?: string[] }[] = [
  {
    key: 'housing_type',
    label: '¿Qué tipo de vivienda tienes?',
    type: 'select',
    options: ['Apartamento', 'Casa', 'Finca', 'Otro'],
  },
  {
    key: 'has_yard',
    label: '¿Tienes patio o jardín?',
    type: 'select',
    options: ['Sí', 'No'],
  },
  {
    key: 'other_pets',
    label: '¿Tienes otras mascotas actualmente?',
    type: 'select',
    options: ['No', 'Sí, perro(s)', 'Sí, gato(s)', 'Sí, otros'],
  },
  {
    key: 'experience',
    label: '¿Tienes experiencia previa con mascotas?',
    type: 'select',
    options: ['Ninguna', 'Poca', 'Moderada', 'Mucha'],
  },
  {
    key: 'daily_hours',
    label: '¿Cuántas horas al día puedes dedicar a la mascota?',
    type: 'select',
    options: ['Menos de 2 horas', '2-4 horas', '4-6 horas', 'Más de 6 horas'],
  },
  {
    key: 'motivation',
    label: '¿Por qué deseas adoptar a este animal?',
    type: 'textarea',
  },
];

const EMPTY_FORM: AdoptionFormData = {
  housing_type: '',
  has_yard: '',
  other_pets: '',
  experience: '',
  daily_hours: '',
  motivation: '',
};

export default function AdoptionForm({ animalName, onSubmit, submitting = false }: AdoptionFormProps) {
  const [step, setStep] = useState<FormStep>('questionnaire');
  const [formData, setFormData] = useState<AdoptionFormData>(EMPTY_FORM);
  const [notes, setNotes] = useState('');

  const updateField = (key: keyof AdoptionFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const isQuestionnaireComplete = QUESTIONS.every((q) => formData[q.key].trim() !== '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'questionnaire') {
      setStep('review');
      return;
    }
    if (step === 'review') {
      setStep('submit');
      return;
    }
    void onSubmit({ form_answers: formData, notes });
  };

  const stepLabels: Record<FormStep, string> = {
    questionnaire: 'Cuestionario',
    review: 'Revisar',
    submit: 'Enviar',
  };

  const stepOrder: FormStep[] = ['questionnaire', 'review', 'submit'];
  const currentStepIdx = stepOrder.indexOf(step);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2" role="list" aria-label="Pasos del formulario">
        {stepOrder.map((s, idx) => (
          <div key={s} className="flex items-center gap-2" role="listitem">
            {idx > 0 && <div className={`w-8 h-0.5 rounded-full ${idx <= currentStepIdx ? 'bg-teal-500' : 'bg-stone-200'}`} />}
            <div className={`flex items-center gap-1.5 text-xs font-medium ${
              idx < currentStepIdx ? 'text-emerald-600' : idx === currentStepIdx ? 'text-teal-700' : 'text-stone-400'
            }`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 ${
                idx < currentStepIdx
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : idx === currentStepIdx
                    ? 'border-teal-500 text-teal-700'
                    : 'border-stone-200 text-stone-400'
              }`}>
                {idx < currentStepIdx ? '✓' : idx + 1}
              </span>
              <span className="hidden sm:inline">{stepLabels[s]}</span>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-stone-800">
        Solicitud de adopción para {animalName}
      </h3>

      {/* Step 1: Questionnaire */}
      {step === 'questionnaire' && (
        <div className="space-y-5">
          {QUESTIONS.map((q) => (
            <div key={q.key}>
              <label htmlFor={`adoption-${q.key}`} className="block text-sm font-medium text-stone-700">
                {q.label}
              </label>
              {q.type === 'select' ? (
                <select
                  id={`adoption-${q.key}`}
                  value={formData[q.key]}
                  onChange={(e) => updateField(q.key, e.target.value)}
                  className="mt-1 w-full rounded-xl border border-stone-200 p-3 text-sm text-stone-800 focus:border-teal-500 focus:ring-teal-500 outline-none"
                >
                  <option value="">Selecciona una opción</option>
                  {q.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <textarea
                  id={`adoption-${q.key}`}
                  value={formData[q.key]}
                  onChange={(e) => updateField(q.key, e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-stone-200 p-3 text-sm text-stone-800 focus:border-teal-500 focus:ring-teal-500 outline-none"
                  placeholder="Escribe tu respuesta..."
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step 2: Review */}
      {step === 'review' && (
        <div className="space-y-4">
          <p className="text-sm text-stone-500">Revisa tus respuestas antes de continuar:</p>
          <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-5 space-y-3">
            {QUESTIONS.map((q) => (
              <div key={q.key}>
                <dt className="text-xs font-medium text-stone-400">{q.label}</dt>
                <dd className="text-sm text-stone-800 mt-0.5">{formData[q.key]}</dd>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Notes + Submit */}
      {step === 'submit' && (
        <div className="space-y-4">
          <p className="text-sm text-stone-500">
            ¿Deseas agregar algún comentario adicional para el refugio?
          </p>
          <textarea
            id="adoption-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-stone-200 p-3 text-sm text-stone-800 focus:border-teal-500 focus:ring-teal-500 outline-none"
            placeholder="Notas adicionales (opcional)..."
          />
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center gap-3">
        {step !== 'questionnaire' && (
          <button
            type="button"
            onClick={() => setStep(stepOrder[currentStepIdx - 1])}
            className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
          >
            Atrás
          </button>
        )}
        <button
          type="submit"
          disabled={
            (step === 'questionnaire' && !isQuestionnaireComplete) ||
            (step === 'submit' && submitting)
          }
          className="flex-1 bg-teal-600 text-white rounded-full py-2.5 text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
        >
          {step === 'submit'
            ? submitting ? 'Enviando...' : 'Enviar solicitud'
            : 'Continuar'}
        </button>
      </div>
    </form>
  );
}
