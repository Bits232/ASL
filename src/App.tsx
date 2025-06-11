import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/Tabs';
import { Keyboard, Hand } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import SignToText from './components/SignToText';
import TextToSign from './components/TextToSign';

function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex-1 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        
        <main className="py-6 px-4 max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Two-Way Sign Language Translator
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Break communication barriers with real-time translation between American Sign Language and text.
            </p>
          </div>
          
          <Tabs defaultValue="sign-to-text" className="w-full max-w-4xl mx-auto mb-8">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8">
              <TabsTrigger value="sign-to-text" className="flex items-center justify-center gap-2 py-3">
                <Hand size={18} />
                <span>Sign to Text</span>
              </TabsTrigger>
              <TabsTrigger value="text-to-sign" className="flex items-center justify-center gap-2 py-3">
                <Keyboard size={18} />
                <span>Text to Sign</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="sign-to-text" className="py-4">
              <SignToText />
            </TabsContent>
            
            <TabsContent value="text-to-sign" className="py-4">
              <TextToSign />
            </TabsContent>
          </Tabs>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}

export default App;