import { useLanguage } from '../context/LanguageContext';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setLanguage('nb')}
        className={`px-2 py-1 text-sm rounded transition-colors ${
          language === 'nb' 
            ? 'bg-white text-[#1E2B3C] font-semibold' 
            : 'text-gray-300 hover:text-white'
        }`}
        title="Norsk"
      >
        NB
      </button>
      <span className="text-gray-500">|</span>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 text-sm rounded transition-colors ${
          language === 'en' 
            ? 'bg-white text-[#1E2B3C] font-semibold' 
            : 'text-gray-300 hover:text-white'
        }`}
        title="English"
      >
        EN
      </button>
    </div>
  );
}
