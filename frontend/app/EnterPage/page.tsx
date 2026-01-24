'use client';

import { API_BASE_URL } from '../config';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

const EnterPage = () => {
  const router = useRouter(); 

  const [isLoading, setIsLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ type: '', title: '', message: '' });

  const handleConfirm = async () => {
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/start-shift`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setModalContent({
            type: 'success',
            title: 'משמרת החלה',
            message: `משמרת החלה בהצלחה בשעה: ${data.time}`
        });
        setShowModal(true);
      } else {
        const errorMsg = data.error || "לא ניתן להתחיל משמרת";
        setModalContent({
            type: 'error',
            title: 'שגיאה',
            message: errorMsg
        });
        setShowModal(true);
      }
    } catch (err) {
      console.error("Connection error:", err);
      setModalContent({
          type: 'error',
          title: 'תקלה בתקשורת',
          message: 'לא ניתן להתחבר לשרת, אנא בדוק את החיבור שלך'
      });
      setShowModal(true);
    } finally {
        setIsLoading(false);
    }
  };

  const handleModalClose = () => {
      setShowModal(false);
      if (modalContent.type === 'success') {
          router.push('/Browser');
      }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald p-4 dark:bg-emerald relative">
      
      <button
        onClick={() => router.push('/Browser')}
        className="absolute top-6 right-6 flex items-center gap-2 text-[#446F41] font-bold hover:text-green-800 transition-colors z-10"
      >
        <ArrowRight size={24} />
        <span>חזרה</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform scale-100 transition-all">
            
            <div className={`p-6 flex justify-center ${modalContent.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
                {modalContent.type === 'success' ? (
                    <div className="bg-green-100 p-3 rounded-full">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                ) : (
                    <div className="bg-red-100 p-3 rounded-full">
                        <AlertCircle className="h-12 w-12 text-red-600" />
                    </div>
                )}
            </div>

            <div className="p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {modalContent.title}
              </h3>
              <p className="text-gray-600">
                {modalContent.message}
              </p>
            </div>

            <div className="p-4 bg-gray-50 flex justify-center">
              <button 
                onClick={handleModalClose}
                className={`w-full py-3 px-4 font-bold rounded-xl text-white transition duration-200 shadow-md hover:shadow-lg
                    ${modalContent.type === 'success' 
                        ? 'bg-indigo-600 hover:bg-indigo-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
              >
                {modalContent.type === 'success' ? 'מעולה, תודה!' : 'הבנתי, סגור'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md rounded-xl bg-emerald p-8 text-center shadow-2xl dark:bg-gray-800 sm:p-10">
        
        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          אישור כניסה
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          אם ברצונך להתחיל משמרת לחץ על אישור
        </p>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isLoading}
          className="flex w-full justify-center items-center gap-2 rounded-lg border border-transparent 
                     bg-indigo-600 p-3 text-base font-semibold text-white shadow-md 
                     transition duration-150 ease-in-out hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
               <Loader2 className="animate-spin h-5 w-5" />
               מתחבר...
            </>
          ) : (
            "אישור"
          )}
        </button>
      </div>
    </div>
  );
};

export default EnterPage;