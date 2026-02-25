import { useNavigate } from 'react-router-dom';
import { Button } from '../components/shared';

const steps = [
  {
    number: '01',
    title: 'ADN de Marca',
    description:
      'Sube los assets de tu marca y la IA extraera tu paleta, tipografia y estilo visual.',
    iconPath:
      'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  },
  {
    number: '02',
    title: 'Componer',
    description:
      'Elige imagen hero, escribe tu copy e indica la intencion comunicativa.',
    iconPath:
      'M12 5v14M5 12h14',
  },
  {
    number: '03',
    title: 'Generar',
    description:
      'Selecciona los formatos — Instagram, Stories, TikTok, LinkedIn — y genera en un clic.',
    iconPath:
      'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    number: '04',
    title: 'Exportar',
    description:
      'Descarga pieza a pieza o todo junto en un ZIP organizado por plataforma.',
    iconPath:
      'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
  },
] as const;

export function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-background flex flex-col items-center justify-center overflow-hidden animate-in">
      <div className="flex flex-col items-center gap-10 max-w-5xl w-full px-6 md:px-12">
        {/* Hero */}
        <div className="flex flex-col items-center text-center">
          <h1 className="font-serif text-5xl italic leading-tight md:text-6xl text-foreground">
            FORGE
          </h1>
          <p className="mt-4 max-w-lg text-base font-light leading-relaxed text-muted-foreground md:text-lg">
            Genera piezas graficas para todas tus plataformas, alineadas con la
            identidad visual de tu marca, en segundos.
          </p>
        </div>

        {/* Steps */}
        <div className="w-full flex flex-col items-center">
          <p className="text-center text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground mb-6">
            Como funciona
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {steps.map((step) => (
              <div
                key={step.number}
                className="group flex flex-col items-center text-center bg-card p-5 shadow-subtle rounded-2xl transition-shadow duration-300 hover:shadow-elevated"
              >
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-secondary mb-3">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-foreground opacity-70"
                  >
                    <path d={step.iconPath} />
                  </svg>
                </div>

                <h3 className="text-sm font-medium text-foreground">
                  {step.title}
                </h3>
                <p className="mt-1 text-xs font-light leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center text-center">
          <p className="mb-4 text-sm font-light leading-relaxed text-muted-foreground max-w-md">
            Empieza configurando el ADN visual de tu marca.
          </p>

          <Button
            size="md"
            variant="primary"
            onClick={() => navigate('/studio')}
            icon={
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            }
          >
            Configurar tu marca
          </Button>
        </div>
      </div>
    </div>
  );
}
