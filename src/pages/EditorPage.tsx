import { EditorLayout } from '../components/Editor/EditorLayout';
import { useResultsStore } from '../store/results.store';

export function EditorPage() {
  const { pieces } = useResultsStore();

  if (pieces.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="font-serif text-2xl text-muted-foreground mb-4">No hay piezas para editar</p>
          <p className="text-muted-foreground text-sm">Genera assets primero</p>
        </div>
      </div>
    );
  }

  return <EditorLayout />;
}
