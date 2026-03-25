'use client';

import { Link } from '@/i18n/navigation';
import { Heart, Shield, Users, Target, Code, Stethoscope, PawPrint, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-stone-200 bg-gradient-to-b from-stone-50 via-teal-50/20 to-stone-50">
        <div className="mx-auto max-w-[1400px] px-6 py-20 md:py-28 text-center">
          <p className="inline-flex items-center text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-3 py-1">
            Nosotros
          </p>
          <h1 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 leading-tight heading-decorated-center">
            Conectamos corazones <br />
            <span className="text-teal-600">con quienes más lo necesitan</span>
          </h1>
          <p className="mt-6 text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Tu Huella nació de la convicción de que la tecnología puede transformar
            la manera en que cuidamos a los animales. Somos el puente entre refugios
            y personas comprometidas con dar un hogar o apoyar a un animal.
          </p>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-stone-800 heading-decorated-center">Nuestra misión</h2>
            <p className="mt-3 text-stone-600 max-w-2xl mx-auto leading-relaxed">
              Crear un punto de encuentro confiable entre refugios y personas — adoptantes,
              padrinos y donantes — para que sea fácil encontrar, adoptar, apadrinar
              y apoyar a los animales que más lo necesitan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center mx-auto">
                <Heart className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="mt-4 font-semibold text-stone-800">Compasión</h3>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                Cada animal merece una oportunidad. Trabajamos para que ninguno quede sin atención.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center mx-auto">
                <Shield className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="mt-4 font-semibold text-stone-800">Confianza</h3>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                Refugios verificados, procesos transparentes y trazabilidad en cada donación.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="mt-4 font-semibold text-stone-800">Comunidad</h3>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                Una red de personas comprometidas con el bienestar animal que crece cada día.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center mx-auto">
                <Target className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="mt-4 font-semibold text-stone-800">Impacto</h3>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                Cada adopción, donación y apadrinamiento genera un cambio real y medible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What we solve */}
      <section className="py-16 bg-stone-100/50 border-y border-stone-200">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-stone-800 heading-decorated-center">El problema que resolvemos</h2>
            <p className="mt-3 text-stone-600 max-w-xl mx-auto">
              En Colombia y Latinoamérica, miles de animales esperan en refugios con recursos limitados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h3 className="font-semibold text-stone-800">Poca visibilidad</h3>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                Muchos refugios pequeños operan sin presencia digital, perdiendo oportunidades de adopción
                y donación. Les damos las herramientas para profesionalizar su alcance.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h3 className="font-semibold text-stone-800">Información dispersa</h3>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                No existía un lugar central con información confiable sobre animales en adopción.
                Tu Huella centraliza todo en una sola plataforma verificada.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h3 className="font-semibold text-stone-800">Donaciones informales</h3>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                La ayuda económica se perdía sin trazabilidad ni confianza. Con Tu Huella, cada
                donación tiene seguimiento y transparencia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-stone-800 heading-decorated-center">Quiénes hacemos Tu Huella</h2>
            <p className="mt-3 text-stone-600 max-w-xl mx-auto">
              Un equipo comprometido con la tecnología y el bienestar animal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* ProjectApp */}
            <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-2 bg-gradient-to-r from-teal-500 to-teal-600" />
              <div className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center">
                    <Code className="h-7 w-7 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-800">ProjectApp.co</h3>
                    <p className="text-sm text-stone-500">Diseño y desarrollo</p>
                  </div>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">
                  ProjectApp.co es el estudio de tecnología detrás de Tu Huella. Especializado
                  en diseñar y desarrollar plataformas digitales con propósito social, ProjectApp
                  aporta su experiencia en ingeniería de software, diseño de producto y estrategia
                  digital para crear soluciones que generen impacto real en las comunidades.
                </p>
                <p className="mt-3 text-sm text-stone-600 leading-relaxed">
                  Desde la arquitectura técnica hasta la experiencia de usuario, el equipo de
                  ProjectApp trabaja para que la plataforma sea intuitiva, confiable y escalable.
                </p>
                <a
                  href="https://projectapp.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm text-teal-600 font-medium hover:text-teal-700 transition-colors"
                >
                  Visitar ProjectApp.co
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Entre Especies */}
            <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-600" />
              <div className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                    <Stethoscope className="h-7 w-7 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-800">Entre Especies Veterinaria</h3>
                    <p className="text-sm text-stone-500">Aliado en bienestar animal</p>
                  </div>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Entre Especies Veterinaria es nuestro aliado fundamental en el cuidado y bienestar
                  de los animales. Con experiencia en atención veterinaria integral, Entre Especies
                  apoya a los refugios de la plataforma brindando asesoría, atención médica y
                  acompañamiento en el proceso de adopción.
                </p>
                <p className="mt-3 text-sm text-stone-600 leading-relaxed">
                  Su compromiso con la salud animal complementa nuestra misión tecnológica,
                  asegurando que cada animal en la plataforma reciba la atención que merece.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-b from-teal-50/40 to-stone-50 border-t border-stone-200">
        <div className="mx-auto max-w-[1400px] px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center mx-auto">
            <PawPrint className="h-7 w-7 text-teal-600" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-stone-800 heading-decorated-center">Sé parte del cambio</h2>
          <p className="mt-3 text-stone-600 max-w-lg mx-auto">
            Ya sea adoptando, apadrinando, donando o simplemente compartiendo,
            tu huella hace la diferencia.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={ROUTES.ANIMALS}
              className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-sm hover:shadow-md text-white rounded-full px-6 py-3 font-medium btn-base"
            >
              Ver Animales
            </Link>
            <Link
              href={ROUTES.CAMPAIGNS}
              className="border border-amber-300 text-amber-700 rounded-full px-6 py-3 font-medium hover:bg-amber-50 btn-base shadow-sm"
            >
              Ver Campañas
            </Link>
            <Link
              href={ROUTES.SHELTERS}
              className="border border-stone-300 text-stone-700 rounded-full px-6 py-3 font-medium hover:bg-white btn-base shadow-sm"
            >
              Explorar Refugios
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
