'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, LogIn, LogOut, UserMinus, AlertCircle } from 'lucide-react'; 
import { API_BASE_URL } from '../config';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"; 

const IntermediatePage = () => {
  const router = useRouter();
  
  // State for managing the Modal visibility and content
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // Helper function to check shift status to avoid code duplication
  const checkShiftStatus = async () => {
    const response = await fetch(`${API_URL}/check-active-shift`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', 
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  };

  // Handler for Enter Shift
  const handleEnterClick = async () => {
    try {
      const data = await checkShiftStatus();

      // If a shift is ALREADY open, prevent starting a new one
      if (data.hasOpenShift) {
        setModalMessage("קיימת משמרת פתוחה במערכת. יש לבצע יציאה לפני פתיחת משמרת חדשה");
        setIsError(true);
        setShowModal(true);
      } else {
        // If no shift is open, proceed to EnterPage
        router.push('/EnterPage');
      }

    } catch (error) {
      console.error("Error checking shift status:", error);
      setModalMessage("אירעה שגיאה בבדיקת נתוני המשמרת. אנא נסה שנית");
      setIsError(true);
      setShowModal(true);
    }
  };

  // Handler for Exit Shift
  const handleExitClick = async () => {
    try {
      const data = await checkShiftStatus();

      // If a shift is OPEN, allow exit. If NOT, prevent access.
      if (data.hasOpenShift) {
        router.push('/ExitPage');
      } else {
        setModalMessage("לא נמצאה משמרת פעילה. לא ניתן לבצע יציאה");
        setIsError(true);
        setShowModal(true);
      }

    } catch (error) {
      console.error("Error checking shift status:", error);
      setModalMessage("אירעה שגיאה בבדיקת נתוני המשמרת. אנא נסה שנית");
      setIsError(true);
      setShowModal(true);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include', 
      });
      
      router.push('/'); 
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald p-4 dark:bg-emerald relative">
      
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
            
            <div className={`p-4 flex items-center justify-center ${isError ? 'bg-red-100 dark:bg-red-900/30' : 'bg-indigo-100'}`}>
              <AlertCircle className={`h-12 w-12 ${isError ? 'text-red-600 dark:text-red-400' : 'text-indigo-600'}`} />
            </div>

            <div className="p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {isError ? 'שימו לב' : 'הודעה'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {modalMessage}
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex justify-center">
              <button 
                onClick={() => setShowModal(false)}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                אישור
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8 sm:flex-row sm:flex-wrap sm:gap-12 justify-center">

        {/* Enter Shift Button */}
        <div onClick={handleEnterClick}
            className="flex flex-col items-center justify-center cursor-pointer
                       w-64 h-64 p-8 
                       rounded-2xl shadow-xl transition duration-300 ease-in-out 
                       bg-emerald hover:bg-indigo-50 dark:bg-gray-800 dark:hover:bg-gray-700
                       border-4 border-indigo-600 dark:border-indigo-400
                       text-indigo-600 dark:text-indigo-400"
          >
            <LogIn className="h-16 w-16 mb-4" />
            <h1 className="text-4xl font-extrabold tracking-tight">
              כניסה
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              כניסה למשמרת
            </p>
        </div>

        {/* Exit Shift Button*/}
        <div onClick={handleExitClick}
            className="flex flex-col items-center justify-center cursor-pointer
                       w-64 h-64 p-8 
                       rounded-2xl shadow-xl transition duration-300 ease-in-out 
                       bg-emerald hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-gray-700
                       border-4 border-red-600 dark:border-red-400
                       text-red-600 dark:text-red-400"
          >
            <LogOut className="h-16 w-16 mb-4" />
            <h1 className="text-4xl font-extrabold tracking-tight">
              יציאה
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              יציאה ממשמרת
            </p>
        </div>
        
        {/* Logout Button */}
       <button 
            onClick={handleLogout} 
            type="button"
            className="flex flex-col items-center justify-center 
                       w-64 h-64 p-8 
                       rounded-2xl shadow-xl transition duration-300 ease-in-out 
                       bg-emerald hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
                       border-4 border-gray-500 dark:border-gray-500
                       text-gray-700 dark:text-gray-300"
          >
            <UserMinus className="h-16 w-16 mb-4" />
            <h1 className="text-4xl font-extrabold tracking-tight">
              התנתקות
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              חזרה למסך הכניסה
            </p>
        </button>

         {/* My Shifts Button */}
         <Link href="/ExistingShiftsPage" 
            className="flex flex-col items-center justify-center 
               w-64 h-64 p-8 
               rounded-2xl shadow-xl transition duration-300 ease-in-out 
               bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700
               border-4 border-gray-600 dark:border-gray-400
               text-gray-700 dark:text-gray-300"
>
           <Calendar className="h-16 w-16 mb-4" />
          <h1 className="text-4xl font-extrabold tracking-tight text-center">
                      המשמרות שלי
          </h1>
        </Link>
      </div>
    </div>
  );
};

export default IntermediatePage;