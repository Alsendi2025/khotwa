import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootEl = document.getElementById('root')!;
const loaderEl = document.getElementById('khotwa-loader-ui');

// Helper to show loader fallback UI (used by global error handlers)
function showLoaderError(message: string) {
  try {
    const msg = document.getElementById('khotwa-loader-msg');
    const btn = document.getElementById('khotwa-reload-btn');
    if (msg) msg.textContent = message;
    if (btn) btn.style.display = 'inline-block';
    if (loaderEl) loaderEl.style.backgroundColor = '#fff7f7';
  } catch (err) {
    console.error('Failed showing loader error UI', err);
  }
}

// Global error handlers: surface problems to the loader UI instead of leaving spinner forever
window.addEventListener('error', (e) => {
  console.error('Window error:', e.error || e.message || e);
  showLoaderError('حدث خطأ أثناء تحميل التطبيق — الرجاء إعادة التحميل');
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled rejection:', e.reason || e);
  showLoaderError('فشل تحميل بعض الموارد — الرجاء إعادة التحميل');
});

// Fallback timeout: if app didn't mount within 15s, show reload button
setTimeout(() => {
  if (loaderEl && loaderEl.style.display !== 'none') {
    showLoaderError('يبدو أن التطبيق يستغرق وقتًا طويلاً للتحميل. يمكنك إعادة المحاولة.');
  }
}, 15000);

try {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  // Signal that the app has started mounting and hide the static loader
  if (loaderEl) {
    loaderEl.style.display = 'none';
  }
  window.dispatchEvent(new Event('khotwa:app-mounted'));
} catch (err) {
  console.error('App failed to mount:', err);
  showLoaderError('حدث خطأ أثناء تهيئة التطبيق — الرجاء إعادة التحميل');
}
