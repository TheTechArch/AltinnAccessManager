import { useLanguage } from '../context/LanguageContext';

// Norwegian flag SVG
const NorwegianFlag = () => (
  <svg viewBox="0 0 22 16" className="w-6 h-4">
    <rect width="22" height="16" fill="#BA0C2F" />
    <rect x="6" width="4" height="16" fill="#FFFFFF" />
    <rect y="6" width="22" height="4" fill="#FFFFFF" />
    <rect x="7" width="2" height="16" fill="#00205B" />
    <rect y="7" width="22" height="2" fill="#00205B" />
  </svg>
);

// British flag (Union Jack) SVG
const BritishFlag = () => (
  <svg viewBox="0 0 60 30" className="w-6 h-4">
    <clipPath id="s">
      <path d="M0,0 v30 h60 v-30 z"/>
    </clipPath>
    <clipPath id="t">
      <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
    </clipPath>
    <g clipPath="url(#s)">
      <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
    </g>
  </svg>
);

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage('nb')}
        className={`p-1 rounded transition-all ${
          language === 'nb' 
            ? 'ring-2 ring-white ring-offset-1 ring-offset-[#1E2B3C]' 
            : 'opacity-60 hover:opacity-100'
        }`}
        title="Norsk"
        aria-label="Bytt til norsk"
      >
        <NorwegianFlag />
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`p-1 rounded transition-all ${
          language === 'en' 
            ? 'ring-2 ring-white ring-offset-1 ring-offset-[#1E2B3C]' 
            : 'opacity-60 hover:opacity-100'
        }`}
        title="English"
        aria-label="Switch to English"
      >
        <BritishFlag />
      </button>
    </div>
  );
}
