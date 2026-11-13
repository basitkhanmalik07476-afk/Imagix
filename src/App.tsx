import { useEffect, useRef } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { Footer } from '@/src/components/layout/Footer';
import { Header } from '@/src/components/layout/Header';
import { SeoHead } from '@/src/components/seo/SeoHead';
import { WorkspaceProvider } from '@/src/context/WorkspaceContext';
import { AllToolsPage } from '@/src/pages/AllToolsPage';
import { HomePage } from '@/src/pages/HomePage';
import { HowToUsePage } from '@/src/pages/HowToUsePage';
import { ToolPage } from '@/src/pages/ToolPage';

function ScrollToTop() {
  const { pathname, key } = useLocation();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname, key]);

  return null;
}

function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <>
      <SeoHead
        title="Page Not Found | Imagix"
        description="The Imagix page you requested could not be found."
        path={pathname}
        robots="noindex, follow"
      />
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-[#181a18]">Page not found</h1>
        <p className="mt-3 text-sm text-[#555955]">
          This page may have moved or the address may be incorrect.
        </p>
        <Link
          to="/tools"
          className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#0e7c5b] px-5 text-sm font-semibold text-white hover:bg-[#095e44]"
        >
          Browse all tools
        </Link>
      </div>
    </>
  );
}

export default function App() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <WorkspaceProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col bg-[#fbf9f5] text-[#181a18]">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/tools" element={<AllToolsPage />} />
              <Route path="/how-to-use" element={<HowToUsePage />} />
              <Route path="/tools/:slug" element={<ToolPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </WorkspaceProvider>
  );
}
