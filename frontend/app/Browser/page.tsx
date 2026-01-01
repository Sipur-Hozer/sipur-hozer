import React from 'react';
import Link from 'next/link';
import { LogIn, LogOut, UserMinus } from 'lucide-react'; 

const IntermediatePage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald p-4 dark:bg-emerald">
      
      <div className="flex flex-col gap-8 sm:flex-row sm:flex-wrap sm:gap-12 justify-center">

        <Link href="/EnterPage"
            className="flex flex-col items-center justify-center 
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
        </Link>

        <Link href="/ExitPage"
            className="flex flex-col items-center justify-center 
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
        </Link>
        
        <Link href="/" 
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
        </Link>
      </div>
    </div>
  );
};

export default IntermediatePage;