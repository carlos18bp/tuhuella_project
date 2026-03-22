const faqs = [
  {
    question: '¿Cómo funciona el proceso de adopción?',
    answer: 'Explora los animales disponibles, selecciona uno, y envía tu solicitud. El refugio revisará tu perfil y te contactará para una entrevista.',
  },
  {
    question: '¿Qué es apadrinar un animal?',
    answer: 'Apadrinar significa apoyar económicamente a un animal de forma mensual o única. Tu aporte ayuda a cubrir alimentación, atención veterinaria y cuidados del refugio.',
  },
  {
    question: '¿Cómo sé si un refugio es confiable?',
    answer: 'Todos los refugios en Mi Huella pasan por un proceso de verificación. Solo los refugios verificados pueden publicar animales en la plataforma.',
  },
  {
    question: '¿Puedo donar sin adoptar?',
    answer: 'Sí. Puedes donar a campañas específicas o directamente a un refugio sin necesidad de adoptar.',
  },
  {
    question: '¿Cómo registro mi refugio?',
    answer: 'Crea una cuenta, selecciona el rol de administrador de refugio, y completa el formulario de registro. Nuestro equipo verificará la información.',
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Actualmente estamos integrando pagos a través de Wompi. Pronto podrás pagar con tarjeta de crédito, débito y otros medios.',
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-3xl font-bold text-stone-800">Preguntas Frecuentes</h1>
      <p className="mt-2 text-stone-500">Resolvemos tus dudas sobre Mi Huella</p>

      <div className="mt-10 max-w-3xl space-y-6">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-xl border border-stone-200 bg-white p-6">
            <h3 className="font-semibold text-stone-800">{faq.question}</h3>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
