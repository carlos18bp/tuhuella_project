'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export type AdoptionFormData = {
  // Section 1: Basic info
  full_name: string;
  phone: string;
  email: string;
  city: string;
  // Section 2: Home & context
  housing_type: string;
  has_yard: string;
  hours_alone: string;
  // Section 3: Experience
  previous_pets: string;
  current_pets: string;
  experience: string;
  // Section 4: Compatibility
  has_children: string;
  children_ages: string;
  has_cats: string;
  has_other_dogs: string;
  // Section 5: Commitment
  accepts_vaccination: boolean;
  accepts_sterilization: boolean;
  accepts_followup: boolean;
  // Section 6: Logistics
  availability_date: string;
  has_transport: string;
  delivery_preference: string;
  // Extra
  motivation: string;
};

interface AdoptionFormProps {
  animalName: string;
  onSubmit: (data: { form_answers: AdoptionFormData; notes: string }) => void | Promise<void>;
  submitting?: boolean;
  defaultValues?: Partial<AdoptionFormData>;
}

type FormStep = 'questionnaire' | 'review' | 'submit';

type FieldDef = {
  key: keyof AdoptionFormData;
  type: 'select' | 'textarea' | 'text' | 'checkbox';
  options?: string[];
  optionKeys?: string[];
  required?: boolean;
};

type SectionDef = {
  titleKey: string;
  fields: FieldDef[];
};

const SECTIONS: SectionDef[] = [
  {
    titleKey: 'sectionBasicInfo',
    fields: [
      { key: 'full_name', type: 'text', required: true },
      { key: 'phone', type: 'text', required: true },
      { key: 'email', type: 'text', required: true },
      { key: 'city', type: 'text', required: true },
    ],
  },
  {
    titleKey: 'sectionHomeContext',
    fields: [
      { key: 'housing_type', type: 'select', optionKeys: ['apartment', 'house', 'farm', 'other'], required: true },
      { key: 'has_yard', type: 'select', optionKeys: ['yes', 'no'], required: true },
      { key: 'hours_alone', type: 'select', optionKeys: ['lessThan2', '2to4', '4to6', 'moreThan6'], required: true },
    ],
  },
  {
    titleKey: 'sectionExperience',
    fields: [
      { key: 'previous_pets', type: 'select', optionKeys: ['none', 'dogs', 'cats', 'both', 'other'], required: true },
      { key: 'current_pets', type: 'select', optionKeys: ['none', 'dogs', 'cats', 'both', 'other'], required: true },
      { key: 'experience', type: 'select', optionKeys: ['none', 'little', 'moderate', 'extensive'], required: true },
    ],
  },
  {
    titleKey: 'sectionCompatibility',
    fields: [
      { key: 'has_children', type: 'select', optionKeys: ['yes', 'no'], required: true },
      { key: 'children_ages', type: 'text' },
      { key: 'has_cats', type: 'select', optionKeys: ['yes', 'no'], required: true },
      { key: 'has_other_dogs', type: 'select', optionKeys: ['yes', 'no'], required: true },
    ],
  },
  {
    titleKey: 'sectionCommitment',
    fields: [
      { key: 'accepts_vaccination', type: 'checkbox', required: true },
      { key: 'accepts_sterilization', type: 'checkbox', required: true },
      { key: 'accepts_followup', type: 'checkbox', required: true },
    ],
  },
  {
    titleKey: 'sectionLogistics',
    fields: [
      { key: 'availability_date', type: 'text', required: true },
      { key: 'has_transport', type: 'select', optionKeys: ['yes', 'no'], required: true },
      { key: 'delivery_preference', type: 'select', optionKeys: ['pickup', 'delivery', 'flexible'], required: true },
      { key: 'motivation', type: 'textarea', required: true },
    ],
  },
];

const EMPTY_FORM: AdoptionFormData = {
  full_name: '',
  phone: '',
  email: '',
  city: '',
  housing_type: '',
  has_yard: '',
  hours_alone: '',
  previous_pets: '',
  current_pets: '',
  experience: '',
  has_children: '',
  children_ages: '',
  has_cats: '',
  has_other_dogs: '',
  accepts_vaccination: false,
  accepts_sterilization: false,
  accepts_followup: false,
  availability_date: '',
  has_transport: '',
  delivery_preference: '',
  motivation: '',
};

export default function AdoptionForm({ animalName, onSubmit, submitting = false, defaultValues }: AdoptionFormProps) {
  const t = useTranslations('adoption');
  const [step, setStep] = useState<FormStep>('questionnaire');
  const [formData, setFormData] = useState<AdoptionFormData>({ ...EMPTY_FORM, ...defaultValues });
  const [notes, setNotes] = useState('');

  const updateField = (key: keyof AdoptionFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const isQuestionnaireComplete = SECTIONS.every((section) =>
    section.fields.every((f) => {
      if (!f.required) return true;
      const val = formData[f.key];
      if (f.type === 'checkbox') return val === true;
      return typeof val === 'string' && val.trim() !== '';
    })
  );

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
    questionnaire: t('stepQuestionnaire'),
    review: t('stepReview'),
    submit: t('stepSubmit'),
  };

  const stepOrder: FormStep[] = ['questionnaire', 'review', 'submit'];
  const currentStepIdx = stepOrder.indexOf(step);

  const getOptionLabel = (fieldKey: keyof AdoptionFormData, optionKey: string) => {
    return t(`options.${fieldKey}.${optionKey}`);
  };

  const getDisplayValue = (field: FieldDef) => {
    const val = formData[field.key];
    if (field.type === 'checkbox') return val ? t('yes') : t('no');
    if (field.type === 'select' && field.optionKeys && typeof val === 'string' && val) {
      return getOptionLabel(field.key, val);
    }
    return String(val || '—');
  };

  const inputClasses = 'mt-1 w-full rounded-xl border border-border-primary shadow-[inset_0_1px_2px_rgb(0,0,0,0.04)] p-3 text-sm text-text-primary focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2" role="list" aria-label={t('stepsLabel')}>
        {stepOrder.map((s, idx) => (
          <div key={s} className="flex items-center gap-2" role="listitem">
            {idx > 0 && <div className={`w-8 h-0.5 rounded-full ${idx <= currentStepIdx ? 'bg-teal-500' : 'bg-border-primary'}`} />}
            <div className={`flex items-center gap-1.5 text-xs font-medium ${
              idx < currentStepIdx ? 'text-emerald-600' : idx === currentStepIdx ? 'text-teal-700' : 'text-text-quaternary'
            }`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 ${
                idx < currentStepIdx
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : idx === currentStepIdx
                    ? 'border-teal-500 text-teal-700 shadow-sm'
                    : 'border-border-primary text-text-quaternary'
              }`}>
                {idx < currentStepIdx ? '\u2713' : idx + 1}
              </span>
              <span className="hidden sm:inline">{stepLabels[s]}</span>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-text-primary">
        {t('title', { animalName })}
      </h3>

      {/* Step 1: Questionnaire */}
      {step === 'questionnaire' && (
        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <fieldset key={section.titleKey} className="space-y-4">
              <legend className="text-sm font-semibold text-teal-700 uppercase tracking-wide border-b border-border-tertiary pb-2 w-full">
                {t(section.titleKey)}
              </legend>
              <div className="space-y-4">
                {section.fields.map((field) => (
                  <div key={field.key}>
                    <label htmlFor={`adoption-${field.key}`} className="block text-sm font-medium tracking-[-0.01em] text-text-secondary">
                      {t(`fields.${field.key}`)}
                      {field.required && <span className="text-red-400 ml-0.5">*</span>}
                    </label>

                    {field.type === 'select' && (
                      <select
                        id={`adoption-${field.key}`}
                        value={formData[field.key] as string}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        className={inputClasses}
                      >
                        <option value="">{t('selectPlaceholder')}</option>
                        {field.optionKeys?.map((optKey) => (
                          <option key={optKey} value={optKey}>
                            {getOptionLabel(field.key, optKey)}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === 'text' && (
                      <input
                        id={`adoption-${field.key}`}
                        type="text"
                        value={formData[field.key] as string}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        className={inputClasses}
                        placeholder={t(`placeholders.${field.key}`)}
                      />
                    )}

                    {field.type === 'textarea' && (
                      <textarea
                        id={`adoption-${field.key}`}
                        value={formData[field.key] as string}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        rows={3}
                        className={inputClasses}
                        placeholder={t(`placeholders.${field.key}`)}
                      />
                    )}

                    {field.type === 'checkbox' && (
                      <label htmlFor={`adoption-${field.key}`} className="mt-1 flex items-center gap-2.5 cursor-pointer">
                        <input
                          id={`adoption-${field.key}`}
                          type="checkbox"
                          checked={formData[field.key] as boolean}
                          onChange={(e) => updateField(field.key, e.target.checked)}
                          className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm text-text-secondary">{t(`checkboxLabels.${field.key}`)}</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      )}

      {/* Step 2: Review */}
      {step === 'review' && (
        <div className="space-y-4">
          <p className="text-sm text-text-tertiary">{t('reviewDescription')}</p>
          <div className="space-y-6">
            {SECTIONS.map((section) => (
              <div key={section.titleKey} className="rounded-2xl border border-border-primary bg-surface-secondary/50 p-5 space-y-3">
                <h4 className="text-xs font-semibold text-teal-600 uppercase tracking-wide">{t(section.titleKey)}</h4>
                {section.fields.map((field) => (
                  <div key={field.key}>
                    <dt className="text-xs font-medium text-text-quaternary">{t(`fields.${field.key}`)}</dt>
                    <dd className="text-sm text-text-primary mt-0.5">{getDisplayValue(field)}</dd>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Notes + Submit */}
      {step === 'submit' && (
        <div className="space-y-4">
          <p className="text-sm text-text-tertiary">{t('notesDescription')}</p>
          <textarea
            id="adoption-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={inputClasses}
            placeholder={t('notesPlaceholder')}
          />
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center gap-3">
        {step !== 'questionnaire' && (
          <button
            type="button"
            onClick={() => setStep(stepOrder[currentStepIdx - 1])}
            className="rounded-full border border-border-secondary px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-hover transition-colors"
          >
            {t('back')}
          </button>
        )}
        <button
          type="submit"
          disabled={
            (step === 'questionnaire' && !isQuestionnaireComplete) ||
            (step === 'submit' && submitting)
          }
          className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-sm hover:shadow-md text-white rounded-full py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {step === 'submit'
            ? submitting ? t('submitting') : t('submitButton')
            : t('continue')}
        </button>
      </div>
    </form>
  );
}
