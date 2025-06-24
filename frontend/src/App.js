import React from 'react';
import TranslationForm from './components/TranslationForm';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Language Translator</h1>
        <p>Powered by Microsoft Azure Translator</p>
      </header>
      <main>
        <TranslationForm />
      </main>
      <footer className="App-footer">
        <p>&copy; 2025 Language Translator. Built with React & Azure.</p>
      </footer>
    </div>
  );
}

export default App;