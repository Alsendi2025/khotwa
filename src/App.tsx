import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LangProvider } from './lib/i18n';
import { AuthProvider } from './contexts/AuthContext';
import { handleGoogleRedirect } from './lib/googleAuth';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Gpa from './pages/tools/Gpa';
import MathSolver from './pages/tools/MathSolver';
import Latex from './pages/tools/Latex';
import Schedule from './pages/tools/Schedule';
import Focus from './pages/tools/Focus';
import Budget from './pages/tools/Budget';
import MergeSplit from './pages/pdf/MergeSplit';
import PageManager from './pages/pdf/PageManager';
import Protect from './pages/pdf/Protect';
import Ocr from './pages/pdf/Ocr';
import Convert from './pages/pdf/Convert';
import Watermark from './pages/pdf/Watermark';
import ImageTools from './pages/pdf/ImageTools';
import Tutor from './pages/ai/Tutor';
import Summarizer from './pages/ai/Summarizer';
import Quiz from './pages/ai/Quiz';
import Writing from './pages/ai/Writing';
import Citation from './pages/ai/Citation';
import CvBuilder from './pages/ai/CvBuilder';
import Majors from './pages/community/Majors';
import Scholarships from './pages/community/Scholarships';
import Projects from './pages/community/Projects';
import Notes from './pages/community/Notes';
import Forums from './pages/community/Forums';
import Market from './pages/community/Market';
import Guide from './pages/community/Guide';

handleGoogleRedirect();

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <BrowserRouter>
          <Layout>
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
              <Route path="*" element={<Home />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </LangProvider>
  );
}
