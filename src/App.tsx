import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/shared';
import { AppLayout } from './components/AppLayout';
import { StudioPage } from './pages/StudioPage';
import { GeneratorPage } from './pages/GeneratorPage';
import { ResultsPage } from './pages/ResultsPage';
import { EditorPage } from './pages/EditorPage';
import { HistoryPage } from './pages/HistoryPage';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/generator" replace />} />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/generator" element={<GeneratorPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/editor" element={<EditorPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
