import { TypographyControls } from './TypographyControls';
import { ColorControls } from './ColorControls';
import { ImageControls } from './ImageControls';
import { LayersPanel } from './LayersPanel';

export function ControlPanel() {
  return (
    <aside
      className="flex flex-col gap-6 overflow-y-auto p-4 bg-sidebar border-l border-border"
      style={{ width: 'var(--panel-right-width)' }}
    >
      <TypographyControls />

      <div className="h-px bg-border" />

      <ColorControls />

      <div className="h-px bg-border" />

      <ImageControls />

      <div className="h-px bg-border" />

      <LayersPanel />
    </aside>
  );
}
