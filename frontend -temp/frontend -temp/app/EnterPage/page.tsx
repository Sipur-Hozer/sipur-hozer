'use client'; // חובה ב-Next.js App Router לשימוש ב-useRouter

import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

const EnterPage = () => {
  const router = useRouter(); 

  const handleConfirm = () => {
    router.back();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald p-4 dark:bg-emerald">
      <div className="w-full max-w-md rounded-xl bg-emerald p-8 text-center shadow-2xl dark:bg-gray-800 sm:p-10">
        
        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          הפעולה בוצעה בהצלחה
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          לחץ על "אישור" כדי לחזור לדף הקודם.
        </p>

        <button
          type="button"
          onClick={handleConfirm}
          className="flex w-full justify-center rounded-lg border border-transparent 
                     bg-indigo-600 p-3 text-base font-semibold text-white shadow-md 
                     transition duration-150 ease-in-out hover:bg-indigo-700"
        >
          אישור
        </button>
      </div>
    </div>
  );
};

export default EnterPage;