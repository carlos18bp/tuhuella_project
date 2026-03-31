'use client';

import { Link } from '@/i18n/navigation';
import { Heart, Shield, Users, Target, Code, Stethoscope, PawPrint, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui';
import { ROUTES } from '@/lib/constants';
import {
  ctaAmberOutlineClass,
  heroTealPillClass,
  pastelIconCircle12Class,
  pastelIconTile14Class,
} from '@/lib/ui/pastelAccent';

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border-primary bg-gradient-to-b from-surface-secondary via-teal-50/20 to-surface-secondary dark:via-teal-950/25">
        <Container className="py-12 md:py-20 lg:py-28 text-center">
          <p className={heroTealPillClass}>
            Nosotros
          </p>
          <h1 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight text-text-primary leading-tight heading-decorated-center">
            Conectamos corazones <br />
            <span className="text-teal-600 dark:text-teal-400">con quienes más lo necesitan</span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Tu Huella nació de la convicción de que la tecnología puede transformar
            la manera en que cuidamos a los animales. Somos el puente entre refugios
            y personas comprometidas con dar un hogar o apoyar a un animal.
          </p>
        </Container>
      </section>

      {/* Mission & Values */}
      <section className="py-10 md:py-16">
        <Container>
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl font-bold text-text-primary heading-decorated-center">Nuestra misión</h2>
            <p className="mt-3 text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Crear un punto de encuentro confiable entre refugios y personas — adoptantes,
              padrinos y donantes — para que sea fácil encontrar, adoptar, apadrinar
              y apoyar a los animales que más lo necesitan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface-primary rounded-2xl border border-border-primary p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className={pastelIconCircle12Class('teal')}>
                <Heart className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="mt-4 font-semibold text-text-primary">Compasión</h3>
              <p className="mt-2 text-sm text-text-tertiary leading-relaxed">
                Cada animal merece una oportunidad. Trabajamos para que ninguno quede sin atención.
              </p>
            </div>
            <div className="bg-surface-primary rounded-2xl border border-border-primary p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className={pastelIconCircle12Class('amber')}>
                <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="mt-4 font-semibold text-text-primary">Confianza</h3>
              <p className="mt-2 text-sm text-text-tertiary leading-relaxed">
                Refugios verificados, procesos transparentes y trazabilidad en cada donación.
              </p>
            </div>
            <div className="bg-surface-primary rounded-2xl border border-border-primary p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className={pastelIconCircle12Class('emerald')}>
                <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="mt-4 font-semibold text-text-primary">Comunidad</h3>
              <p className="mt-2 text-sm text-text-tertiary leading-relaxed">
                Una red de personas comprometidas con el bienestar animal que crece cada día.
              </p>
            </div>
            <div className="bg-surface-primary rounded-2xl border border-border-primary p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className={pastelIconCircle12Class('rose')}>
                <Target className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="mt-4 font-semibold text-text-primary">Impacto</h3>
              <p className="mt-2 text-sm text-text-tertiary leading-relaxed">
                Cada adopción, donación y apadrinamiento genera un cambio real y medible.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* What we solve */}
      <section className="py-10 md:py-16 bg-gradient-to-b from-surface-secondary via-surface-tertiary/40 to-surface-secondary border-y border-border-primary">
        <Container>
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl font-bold text-text-primary heading-decorated-center">El problema que resolvemos</h2>
            <p className="mt-3 text-text-secondary max-w-xl mx-auto">
              En Colombia y Latinoamérica, miles de animales esperan en refugios con recursos limitados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="bg-surface-primary rounded-2xl border border-border-primary p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h3 className="font-semibold text-text-primary">Poca visibilidad</h3>
              <p className="mt-2 text-sm text-text-tertiary leading-relaxed">
                Muchos refugios pequeños operan sin presencia digital, perdiendo oportunidades de adopción
                y donación. Les damos las herramientas para profesionalizar su alcance.
              </p>
            </div>
            <div className="bg-surface-primary rounded-2xl border border-border-primary p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h3 className="font-semibold text-text-primary">Información dispersa</h3>
              <p className="mt-2 text-sm text-text-tertiary leading-relaxed">
                No existía un lugar central con información confiable sobre animales en adopción.
                Tu Huella centraliza todo en una sola plataforma verificada.
              </p>
            </div>
            <div className="bg-surface-primary rounded-2xl border border-border-primary p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h3 className="font-semibold text-text-primary">Donaciones informales</h3>
              <p className="mt-2 text-sm text-text-tertiary leading-relaxed">
                La ayuda económica se perdía sin trazabilidad ni confianza. Con Tu Huella, cada
                donación tiene seguimiento y transparencia.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Partners */}
      <section className="py-10 md:py-16">
        <Container>
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl font-bold text-text-primary heading-decorated-center">Quiénes hacemos Tu Huella</h2>
            <p className="mt-3 text-text-secondary max-w-xl mx-auto">
              Un equipo comprometido con la tecnología y el bienestar animal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            {/* ProjectApp */}
            <div className="rounded-2xl border border-border-primary bg-surface-primary overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-2 bg-gradient-to-r from-teal-500 to-teal-600" />
              <div className="p-5 md:p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className={pastelIconTile14Class('teal')}>
                    <Code className="h-7 w-7 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-text-primary">ProjectApp.co</h3>
                    <p className="text-sm text-text-tertiary">Diseño y desarrollo</p>
                  </div>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  ProjectApp.co es el estudio de tecnología detrás de Tu Huella. Especializado
                  en diseñar y desarrollar plataformas digitales con propósito social, ProjectApp
                  aporta su experiencia en ingeniería de software, diseño de producto y estrategia
                  digital para crear soluciones que generen impacto real en las comunidades.
                </p>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                  Desde la arquitectura técnica hasta la experiencia de usuario, el equipo de
                  ProjectApp trabaja para que la plataforma sea intuitiva, confiable y escalable.
                </p>
                <a
                  href="https://projectapp.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 min-h-11 text-sm text-teal-600 font-medium hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
                >
                  Visitar ProjectApp.co
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Entre Especies */}
            <div className="rounded-2xl border border-border-primary bg-surface-primary overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-600" />
              <div className="p-5 md:p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className={pastelIconTile14Class('emerald')}>
                    <Stethoscope className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-text-primary">Entre Especies Veterinaria</h3>
                    <p className="text-sm text-text-tertiary">Aliado en bienestar animal</p>
                  </div>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Entre Especies Veterinaria es nuestro aliado fundamental en el cuidado y bienestar
                  de los animales. Con experiencia en atención veterinaria integral, Entre Especies
                  apoya a los refugios de la plataforma brindando asesoría, atención médica y
                  acompañamiento en el proceso de adopción.
                </p>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                  Su compromiso con la salud animal complementa nuestra misión tecnológica,
                  asegurando que cada animal en la plataforma reciba la atención que merece.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-10 md:py-16 bg-gradient-to-b from-surface-secondary via-teal-50/35 to-background dark:via-teal-950/20 border-t border-border-primary">
        <Container className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-950/50 dark:ring-1 dark:ring-teal-500/20 flex items-center justify-center mx-auto">
            <PawPrint className="h-7 w-7 text-teal-600 dark:text-teal-400" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-text-primary heading-decorated-center">Sé parte del cambio</h2>
          <p className="mt-3 text-text-secondary max-w-lg mx-auto">
            Ya sea adoptando, apadrinando, donando o simplemente compartiendo,
            tu huella hace la diferencia.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap justify-center items-stretch sm:items-center gap-3">
            <Link
              href={ROUTES.ANIMALS}
              className="inline-flex justify-center items-center min-h-11 w-full sm:w-auto bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-sm hover:shadow-md text-white rounded-full px-6 py-3 font-medium btn-base"
            >
              Ver Animales
            </Link>
            <Link
              href={ROUTES.CAMPAIGNS}
              className={ctaAmberOutlineClass}
            >
              Ver Campañas
            </Link>
            <Link
              href={ROUTES.SHELTERS}
              className="inline-flex justify-center items-center min-h-11 w-full sm:w-auto border border-border-secondary text-text-secondary rounded-full px-6 py-3 font-medium hover:bg-surface-primary dark:hover:bg-surface-hover btn-base shadow-sm"
            >
              Explorar Refugios
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
