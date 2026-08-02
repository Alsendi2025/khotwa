import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LangProvider } from './lib/i18n';
import { AuthProvider } from './contexts/AuthContext';
import { handleGoogleRedirect } from './lib/googleAuth';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';

// Lazy-load heavy/rarely-used pages to minimize initial bundle for mobile
const Gpa = lazy(() => import('./pages/tools/Gpa'));
const MathSolver = lazy(() => import('./pages/tools/MathSolver'));
const Latex = lazy(() => import('./pages/tools/Latex'));
const Schedule = lazy(() => import('./pages/tools/Schedule'));
const Focus = lazy(() => import('./pages/tools/Focus'));
const Budget = lazy(() => import('./pages/tools/Budget'));

// PDF tools (usually heavy due to pdf libraries)
const MergeSplit = lazy(() => import('./pages/pdf/MergeSplit'));
const PageManager = lazy(() => import('./pages/pdf/PageManager'));
const Protect = lazy(() => import('./pages/pdf/Protect'));
const Ocr = lazy(() => import('./pages/pdf/Ocr'));
const Convert = lazy(() => import('./pages/pdf/Convert'));
const Watermark = lazy(() => import('./pages/pdf/Watermark'));
const ImageTools = lazy(() => import('./pages/pdf/ImageTools'));

// AI tools
const Tutor = lazy(() => import('./pages/ai/Tutor'));
const Summarizer = lazy(() => import('./pages/ai/Summarizer'));
const Quiz = lazy(() => import('./pages/ai/Quiz'));
const Writing = lazy(() => import('./pages/ai/Writing'));
const Citation = lazy(() => import('./pages/ai/Citation'));
const CvBuilder = lazy(() => import('./pages/ai/CvBuilder'));

// Community / static pages (lazy to reduce initial weight)
const Majors = lazy(() => import('./pages/community/Majors'));
const About = lazy(() => import('./pages/static/About'));
const Contact = lazy(() => import('./pages/static/Contact'));
const Privacy = lazy(() => import('./pages/static/Privacy'));
const Terms = lazy(() => import('./pages/static/Terms'));
const Scholarships = lazy(() => import('./pages/community/Scholarships'));
const Projects = lazy(() => import('./pages/community/Projects'));
const Notes = lazy(() => import('./pages/community/Notes'));
const Forums = lazy(() => import('./pages/community/Forums'));
const Market = lazy(() => import('./pages/community/Market'));
const Guide = lazy(() => import('./pages/community/Guide'));

handleGoogleRedirect();

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            {/* Suspense around routes so lazy pages load on demand. Fallback is minimal to avoid heavy UI. */}
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">جارٍ التحميل...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/gpa" element={<Gpa />} />
                <Route path="/math" element={<MathSolver />} />
                <Route path="/latex" element={<Latex />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/focus" element={<Focus />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/pdf-merge" element={<MergeSplit />} />
                <Route path="/pdf-pages" element={<PageManager />} />
                <Route path="/pdf-protect" element={<Protect />} />
                <Route path="/ocr" element={<Ocr />} />
                <Route path="/convert" element={<Convert />} />
                <Route path="/pdf-watermark" element={<Watermark />} />
                <Route path="/image-tools" element={<ImageTools />} />
                <Route path="/ai-tutor" element={<Tutor />} />
                <Route path="/summarizer" element={<Summarizer />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/writing" element={<Writing />} />
                <Route path="/citation" element={<Citation />} />
                <Route path="/cv" element={<CvBuilder />} />
                <Route path="/majors" element={<Majors />} />
                <Route path="/scholarships" element={<Scholarships />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/forums" element={<Forums />} />
                <Route path="/market" element={<Market />} />
                <Route path="/guide" element={<Guide />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </LangProvider>
  );
}
