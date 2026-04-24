import { useEffect, useRef, useState } from 'react';

import { useLocation } from 'react-router-dom';

const LANGUAGES = [
  { label: 'Select language', value: '' },
  { label: 'Afrikaans', value: 'af' },
  { label: 'Arabic', value: 'ar' },
  { label: 'Bengali', value: 'bn' },
  { label: 'Bulgarian', value: 'bg' },
  { label: 'Chinese (Simplified)', value: 'zh-CN' },
  { label: 'Chinese (Traditional)', value: 'zh-TW' },
  { label: 'Croatian', value: 'hr' },
  { label: 'Czech', value: 'cs' },
  { label: 'Danish', value: 'da' },
  { label: 'Dutch', value: 'nl' },
  { label: 'English', value: 'en' },
  { label: 'Estonian', value: 'et' },
  { label: 'Filipino', value: 'tl' },
  { label: 'Finnish', value: 'fi' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Greek', value: 'el' },
  { label: 'Gujarati', value: 'gu' },
  { label: 'Hebrew', value: 'iw' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Hungarian', value: 'hu' },
  { label: 'Indonesian', value: 'id' },
  { label: 'Italian', value: 'it' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Kannada', value: 'kn' },
  { label: 'Korean', value: 'ko' },
  { label: 'Latvian', value: 'lv' },
  { label: 'Lithuanian', value: 'lt' },
  { label: 'Malay', value: 'ms' },
  { label: 'Malayalam', value: 'ml' },
  { label: 'Marathi', value: 'mr' },
  { label: 'Norwegian', value: 'no' },
  { label: 'Persian', value: 'fa' },
  { label: 'Polish', value: 'pl' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Punjabi', value: 'pa' },
  { label: 'Romanian', value: 'ro' },
  { label: 'Russian', value: 'ru' },
  { label: 'Serbian', value: 'sr' },
  { label: 'Slovak', value: 'sk' },
  { label: 'Slovenian', value: 'sl' },
  { label: 'Spanish', value: 'es' },
  { label: 'Swahili', value: 'sw' },
  { label: 'Swedish', value: 'sv' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Telugu', value: 'te' },
  { label: 'Thai', value: 'th' },
  { label: 'Turkish', value: 'tr' },
  { label: 'Ukrainian', value: 'uk' },
  { label: 'Urdu', value: 'ur' },
  { label: 'Vietnamese', value: 'vi' }
];



export default function Translator() {
  const [open, setOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const translatorRef = useRef(null);
  const location = useLocation();
  if (location.pathname.startsWith('/menu-board')) {
    return null;
  }

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      const container = document.getElementById('google_translate_element');
      if (container) {
        container.innerHTML = '';
      }

      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src =
        'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google && window.google.translate) {
      window.googleTranslateElementInit();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (translatorRef.current && !translatorRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);

    const combo = document.querySelector('.goog-te-combo');
    if (!combo || !language) return;

    combo.value = language;
    combo.dispatchEvent(new Event('change'));
  };

  const resetToEnglish = () => {
    setSelectedLanguage('');

    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie =
      'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' +
      window.location.hostname +
      ';';

    window.location.reload();
  };

  return (
    <div className="translator" ref={translatorRef}>
      <div id="google_translate_element" className="hidden-google-translate"></div>

      {selectedLanguage && (
        <button
          className="translate-reset"
          onClick={resetToEnglish}
          type="button"
          aria-label="Reset to English"
          title="Reset to English"
        >
          ↺
        </button>
      )}

      <div className="language-card">
        <button
          className="language-card-header"
          onClick={() => setOpen((prev) => !prev)}
          type="button"
          title="Translate page"
          aria-label="Translate page" 
        >
          Translate
        </button>

        {open && (
          <div className="language-card-body">
            <select
              className="translate-select"
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
