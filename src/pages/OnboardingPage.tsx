import { useNavigate } from 'react-router-dom';
import { Button } from '../components/shared';

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

export function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center overflow-y-auto animate-in">
      {/* Hero section */}
      <section className="flex w-full max-w-4xl flex-col items-center px-8 pt-20 pb-16 text-center">
        <div className="mb-8 h-px w-16 bg-border" />

        <h1 className="font-serif text-5xl font-semibold tracking-tight md:text-6xl lg:text-7xl text-foreground">
          FORGE
        </h1>

        <p className="mt-5 max-w-lg font-sans text-lg leading-relaxed text-muted-foreground md:text-xl text-center">
          Genera piezas graficas para todas tus plataformas, alineadas con la
          identidad visual de tu marca, en segundos.
        </p>

        <div className="mt-8 h-px w-16 bg-border" />
      </section>

      {/* Steps section */}
      <section className="w-full max-w-5xl px-8 pb-12">
        <p className="mb-8 text-center font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Como funciona
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group flex flex-col rounded-xl bg-card border border-border p-6 shadow-subtle transition-all duration-[150ms] hover:shadow-elevated hover:border-muted-foreground/30"
            >
              <span className="mb-4 font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {step.number}
              </span>

              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <svg
                  width="20"
                  height="20"
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

              <h3 className="font-sans text-lg font-medium text-foreground">
                {step.title}
              </h3>
              <p className="font-sans text-sm leading-relaxed text-muted-foreground mt-2">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Connector */}
      <div className="my-4 h-10 w-px bg-border" />

      {/* CTA section */}
      <section className="flex w-full max-w-4xl flex-col items-center px-8 pb-20">
        <p className="mb-6 text-center font-sans text-sm leading-relaxed text-muted-foreground max-w-md">
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
