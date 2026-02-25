import { EditorLayout } from '../components/Editor/EditorLayout';
import { useResultsStore } from '../store/results.store';

export function EditorPage() {
  const { pieces } = useResultsStore();

  if (pieces.length === 0) {
    return (
      <div className="flex items-center justify-center h-full px-6 py-20 md:px-12">
        <div className="bg-card p-8 shadow-subtle rounded-2xl max-w-md w-full flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary mb-6">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground"
            >
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
          <p className="font-serif text-2xl italic leading-tight text-foreground mb-3">No hay piezas para editar</p>
          <p className="text-sm font-light leading-relaxed text-muted-foreground">Genera assets primero desde el panel de creacion</p>
        </div>
      </div>
    );
  }

  return <EditorLayout />;
}
