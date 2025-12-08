"use client";
  
import React from 'react';
import { useRouter } from 'next/navigation';
import { Store, Tent } from 'lucide-react';

const BRAND_GREEN = '#446F41';
const BG_CREAM = '#F3F6EB';

const LocationSelectPage = () => {
  const router = useRouter();

  return (
    <div style={{ backgroundColor: BG_CREAM }} className="flex min-h-screen items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        
        <h1 className="text-2xl font-bold text-gray-800 mb-8">איפה אתה עובד היום?</h1>

        <div className="space-y-4">
          
          <button
            onClick={() => router.push('/InStoreDuty')} 
            className="w-full flex items-center justify-between p-6 rounded-lg border-2 border-transparent bg-gray-50 hover:bg-green-50 hover:border-[#446F41] transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full bg-gray-200 text-gray-600 group-hover:bg-[#446F41] group-hover:text-white transition-colors`}>
                <Store size={24} />
              </div>
              <span className="text-xl font-semibold text-gray-700">בתוך החנות</span>
            </div>
            <span className="text-2xl text-gray-400 group-hover:text-[#446F41]">←</span>
          </button>

         
          <button
            onClick={() => router.push('/OutStoreDuty')} 
            className="w-full flex items-center justify-between p-6 rounded-lg border-2 border-transparent bg-gray-50 hover:bg-green-50 hover:border-[#446F41] transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full bg-gray-200 text-gray-600 group-hover:bg-[#446F41] group-hover:text-white transition-colors`}>
                <Tent size={24} />
              </div>
              <span className="text-xl font-semibold text-gray-700">מחוץ לחנות</span>
            </div>
            <span className="text-2xl text-gray-400 group-hover:text-[#446F41]">←</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default LocationSelectPage;