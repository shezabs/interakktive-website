'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Users } from 'lucide-react';

// Official WhatsApp glyph
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

const WA_NUMBER = '447576068038';
const WA_PREFILL = encodeURIComponent('Hi Interakktive, I have a question about...');
const WA_CHAT_URL = `https://wa.me/${WA_NUMBER}?text=${WA_PREFILL}`;
const WA_HUB_URL = 'https://chat.whatsapp.com/LY0GqSynVZPDIE7Zz9JNPw?mode=gi_t';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 left-8 p-4 bg-[#25D366] rounded-full shadow-lg shadow-[#25D366]/30 z-50 hover:shadow-[#25D366]/50 transition-shadow"
            aria-label="Contact us on WhatsApp"
          >
            <WhatsAppIcon className="w-6 h-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Menu card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 left-8 w-[320px] bg-gray-900 rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-[#25D366] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <WhatsAppIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Chat on WhatsApp</h3>
                  <p className="text-xs text-white/90">We typically reply quickly</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Options */}
            <div className="p-4 space-y-3">
              <a
                href={WA_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-[#25D366]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Chat with us</p>
                  <p className="text-xs text-gray-400 mt-0.5">Message us directly — we&apos;ll reply on WhatsApp.</p>
                </div>
              </a>

              <a
                href={WA_HUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-[#25D366]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Join the Interakktive Hub</p>
                  <p className="text-xs text-gray-400 mt-0.5">Our public WhatsApp community.</p>
                </div>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
