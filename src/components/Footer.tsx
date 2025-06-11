import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 px-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            SignBridge - Two-Way Sign Language Translator
          </p>
          
          <div className="flex items-center space-x-4">
            <a 
              href="#accessibility" 
              className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
            >
              Accessibility
            </a>
            <a 
              href="#about" 
              className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
            >
              About
            </a>
            <a 
              href="#help" 
              className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
            >
              Help
            </a>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-center text-gray-500 dark:text-gray-500">
          <p>
            Currently using placeholder data. Future versions will integrate with real ASL recognition models and text-to-sign animations.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;