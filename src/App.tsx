import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/shared';
import { AppLayout } from './components/AppLayout';
import { StudioPage } from './pages/StudioPage';
import { GeneratorPage } from './pages/GeneratorPage';
import { ResultsPage } from './pages/ResultsPage';
import { EditorPage } from './pages/EditorPage';
import { HistoryPage } from './pages/HistoryPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { useBrandDNAStore } from './store/brandDNA.store';

// ---------------------------------------------------------------------------
// Root redirect: show onboarding when no brands exist, generator otherwise
// ---------------------------------------------------------------------------

function RootRedirect() {
  const brands = useBrandDNAStore((s) => s.brands);
  if (brands.length === 0) {
    return <OnboardingPage />;
  }
  return <Navigate to="/generator" replace />;
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<RootRedirect />} />
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
