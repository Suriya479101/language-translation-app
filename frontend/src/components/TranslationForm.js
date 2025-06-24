import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeftRight, Copy, Volume2, RotateCcw } from 'lucide-react';

const TranslationForm = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [fromLanguage, setFromLanguage] = useState('auto');
  const [toLanguage, setToLanguage] = useState('es');
  const [languages, setLanguages] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');

  const commonLanguages = React.useMemo(() => ({
    'auto': 'Auto-detect',
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese (Simplified)',
    'ar': 'Arabic',
    'hi': 'Hindi'
  }), []);

  const fetchSupportedLanguages = React.useCallback(async () => {
    try {
      const response = await axios.get('/api/languages');
      setLanguages(response.data.translation || {});
    } catch (error) {
      console.error('Error fetching languages:', error);
      setLanguages(commonLanguages);
    }
  }, [commonLanguages]);

  useEffect(() => {
    fetchSupportedLanguages();
  }, [fetchSupportedLanguages]);

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to translate');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/translate', {
        text: inputText,
        from: fromLanguage === 'auto' ? undefined : fromLanguage,
        to: toLanguage
      });

      setTranslatedText(response.data.translatedText);
      if (response.data.detectedLanguage) {
        setDetectedLanguage(response.data.detectedLanguage.language);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Translation failed');
      console.error('Translation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    if (fromLanguage !== 'auto') {
      setFromLanguage(toLanguage);
      setToLanguage(fromLanguage);
      setInputText(translatedText);
      setTranslatedText(inputText);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleSpeak = (text, lang) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      speechSynthesis.speak(utterance);
    }
  };

  const handleClear = () => {
    setInputText('');
    setTranslatedText('');
    setError('');
    setDetectedLanguage('');
  };

  const getLanguageName = (code) => {
    if (code === 'auto') return 'Auto-detect';
    return languages[code]?.name || commonLanguages[code] || code;
  };

  return (
    <div className="translation-container">
      <div className="language-selector">
        <div className="language-dropdown">
          <select 
            value={fromLanguage} 
            onChange={(e) => setFromLanguage(e.target.value)}
            className="language-select"
          >
            <option value="auto">Auto-detect</option>
            {Object.entries(commonLanguages).slice(1).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleSwapLanguages}
          className="swap-button"
          disabled={fromLanguage === 'auto'}
          title="Swap languages"
        >
          <ArrowLeftRight size={20} />
        </button>

        <div className="language-dropdown">
          <select 
            value={toLanguage} 
            onChange={(e) => setToLanguage(e.target.value)}
            className="language-select"
          >
            {Object.entries(commonLanguages).slice(1).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="translation-boxes">
        <div className="input-section">
          <div className="text-area-header">
            <span>
              {getLanguageName(fromLanguage)}
              {detectedLanguage && fromLanguage === 'auto' && (
                <span className="detected-lang"> (Detected: {getLanguageName(detectedLanguage)})</span>
              )}
            </span>
            <div className="text-controls">
              <button 
                onClick={handleClear}
                className="control-btn"
                title="Clear text"
              >
                <RotateCcw size={16} />
              </button>
              <button 
                onClick={() => handleSpeak(inputText, fromLanguage === 'auto' ? detectedLanguage : fromLanguage)}
                className="control-btn"
                disabled={!inputText}
                title="Speak text"
              >
                <Volume2 size={16} />
              </button>
            </div>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to translate..."
            className="text-area input-area"
            rows="6"
          />
        </div>

        <div className="output-section">
          <div className="text-area-header">
            <span>{getLanguageName(toLanguage)}</span>
            <div className="text-controls">
              <button 
                onClick={() => handleCopy(translatedText)}
                className="control-btn"
                disabled={!translatedText}
                title="Copy translation"
              >
                <Copy size={16} />
              </button>
              <button 
                onClick={() => handleSpeak(translatedText, toLanguage)}
                className="control-btn"
                disabled={!translatedText}
                title="Speak translation"
              >
                <Volume2 size={16} />
              </button>
            </div>
          </div>
          <textarea
            value={translatedText}
            readOnly
            placeholder="Translation will appear here..."
            className="text-area output-area"
            rows="6"
          />
        </div>
      </div>

      <div className="translation-actions">
        <button 
          onClick={handleTranslate}
          disabled={isLoading || !inputText.trim()}
          className="translate-button"
        >
          {isLoading ? 'Translating...' : 'Translate'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default TranslationForm;