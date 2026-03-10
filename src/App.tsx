import { useState } from 'react';
import { SettingsProvider } from './contexts/SettingsContext';
import Header from './sections/Header';
import Hero from './sections/Hero';
import Announcements from './sections/Announcements';
import Programs from './sections/Programs';
import Projects from './sections/Projects';
import Activities from './sections/Activities';
import Staff from './sections/Staff';
import Others from './sections/Others';
import Footer from './sections/Footer';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F9F6] to-white islamic-pattern">
      <Header onLogin={setIsLoggedIn} isLoggedIn={isLoggedIn} />
      <main>
        <Hero />
        <Announcements isLoggedIn={isLoggedIn} />
        <Programs isLoggedIn={isLoggedIn} />
        <Projects isLoggedIn={isLoggedIn} />
        <Activities isLoggedIn={isLoggedIn} />
        <Staff isLoggedIn={isLoggedIn} />
        <Others isLoggedIn={isLoggedIn} />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

export default App;
