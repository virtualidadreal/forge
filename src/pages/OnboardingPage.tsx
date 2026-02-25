import { useNavigate } from 'react-router-dom';
import { Button } from '../components/shared';

// ---------------------------------------------------------------------------
// Step data
// ---------------------------------------------------------------------------

const steps = [
  {
    number: '01',
    title: 'ADN de Marca',
    description:
      'Sube los assets de tu marca — logos, posts, packaging — y la IA extraera tu paleta de colores, tipografia y estilo visual.',
    iconPath:
      'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  },
  {
    number: '02',
    title: 'Componer',
    description:
      'Elige una imagen hero, escribe tu copy e indica la intencion comunicativa: convertir, notoriedad, editorial, campana...',
    iconPath:
      'M12 5v14M5 12h14',
  },
  {
    number: '03',
    title: 'Generar',
    description:
      'Selecciona los formatos de salida — Instagram, Stories, TikTok, LinkedIn — y genera todas las piezas en un clic.',
    iconPath:
      'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    number: '04',
    title: 'Exportar',
    description:
      'Descarga pieza a pieza o todo junto en un ZIP organizado por plataforma, listo para publicar.',
    iconPath:
      'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
  },
] as const;

// ---------------------------------------------------------------------------
// Component — Full-page standalone (no sidebar)
// ---------------------------------------------------------------------------

export function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center overflow-y-auto animate-in">
      {/* Hero section */}
      <section className="flex w-full max-w-4xl flex-col items-center px-10 lg:px-16 pt-24 pb-20 text-center">
        {/* Decorative line */}
        <div className="mb-10 h-px w-16 bg-border" />

        <h1 className="font-serif text-5xl italic leading-tight md:text-6xl lg:text-7xl text-foreground">
          FORGE
        </h1>

        <p className="mt-6 max-w-lg text-lg font-light leading-relaxed text-muted-foreground md:text-xl text-center">
          Genera piezas graficas para todas tus plataformas, alineadas con la
          identidad visual de tu marca, en segundos.
        </p>

        {/* Decorative line */}
        <div className="mt-10 h-px w-16 bg-border" />
      </section>

      {/* Steps section */}
      <section className="w-full max-w-5xl px-10 lg:px-16 pb-16">
        <p className="mb-10 text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Como funciona
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group flex flex-col bg-card rounded-3xl p-8 shadow-subtle hover:shadow-elevated transition-shadow duration-300"
            >
              {/* Step number */}
              <span className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {step.number}
              </span>

              {/* Icon */}
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-foreground opacity-70"
                >
                  <path d={step.iconPath} />
                </svg>
              </div>

              {/* Content */}
              <h3 className="mt-6 text-lg font-medium">
                {step.title}
              </h3>
              <p className="text-sm font-light leading-relaxed text-muted-foreground mt-3">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Connector line between steps and CTA */}
      <div className="my-6 h-12 w-px bg-border" />

      {/* CTA section */}
      <section className="flex w-full max-w-4xl flex-col items-center px-10 lg:px-16 pb-24">
        <p className="mb-8 text-center text-sm font-light leading-relaxed text-muted-foreground max-w-md">
          Empieza configurando el ADN visual de tu marca.
          <br />
          Solo necesitas subir algunos assets y FORGE hara el resto.
        </p>

        <Button
          size="lg"
          variant="primary"
          onClick={() => navigate('/studio')}
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          }
        >
          Configurar tu marca
        </Button>
      </section>
    </div>
  );
}
