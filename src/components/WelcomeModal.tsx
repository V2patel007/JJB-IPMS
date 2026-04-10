import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem('hasSeenWelcomeModal');
    if (!hasSeenModal) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenWelcomeModal', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white max-w-xl w-full rounded-[2rem] overflow-hidden shadow-2xl relative"
          >
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="p-10 flex flex-col items-center text-center">
              <div className="flex items-center justify-center gap-4 mb-10">
                <img 
                  src="https://jjbricks.com/dashdesk/files/configuration//logo_file/5c2a7cd1-e61c-4110-835d-0d8cbf642048/logo-main%20-%20Copy.png" 
                  alt="Jay Jalaram Brick Works" 
                  className="h-12 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="h-8 w-px bg-gray-200" />
                <img 
                  src="https://jjbricks.com/dashdesk/files/configuration//footer_file/5c2a7cd1-e61c-4110-835d-0d8cbf642048/bric_logo.png" 
                  alt="Brick Logo" 
                  className="h-12 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <h2 className="text-3xl font-black text-gray-900 mb-6 tracking-tighter uppercase italic">
                Design Reference
              </h2>

              <div className="space-y-6 text-gray-600 font-medium leading-relaxed max-w-md">
                <p>
                  This webpage has been designed as per your requirements and reference to <span className="text-primary font-bold">Petersen Tegl</span> using content from your website current <span className="text-primary font-bold">JJ Bricks</span>.
                </p>
                <p>
                  To Get Web Development Quotation you can Click the button on right bottom of the page.
                </p>
              </div>

              <Button 
                onClick={handleClose}
                className="mt-10 w-full h-14 bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest rounded-none transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Continue to Website
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
