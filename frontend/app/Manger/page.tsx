"use client";

import React from 'react';
import { UserPlus, CalendarDays, Calculator } from 'lucide-react';
import { useRouter } from 'next/navigation';


const BRAND_GREEN = '#446F41';
const BG_CREAM = '#F3F6EB';

 const handleChange = (router:any) => {
    router.push('/AddUserPage')
  };

const ManagerPage = () => {
  const router = useRouter();

  return (
    <div style={{ backgroundColor: BG_CREAM }} className="min-h-screen flex items-center justify-center p-4 relative" dir="rtl">
      
      <div className="absolute top-4 right-6 text-sm font-large text-gray-500">
        פנל ניהול
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">אופציות</h1>
        </div>

        <div className="space-y-4">
          
          <button 
            className="w-full h-20 flex items-center justify-between px-6 rounded-xl shadow-md transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg text-white"
            style={{ backgroundColor: BRAND_GREEN }}
            onClick={() => router.push('/AddUserPage')}
          >
            <span className="text-xl font-bold">יצירת משתמשים</span>
            <UserPlus size={28} className="opacity-80" />
          </button>

          <button 
            className="w-full h-20 flex items-center justify-between px-6 rounded-xl shadow-md transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg bg-white border-2 text-gray-700"
            style={{ borderColor: BRAND_GREEN }}
            onClick={() => router.push('/AddUserPage')}
          >
            <span className="text-xl font-bold" style={{ color: BRAND_GREEN }}>הצגת משמרות קיימות</span>
            <CalendarDays size={28} style={{ color: BRAND_GREEN }} />
          </button>

          <button 
            disabled
            className="w-full h-20 flex items-center justify-between px-6 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
          >
            <span className="text-xl font-bold">חישוב תגמולים</span>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">בקרוב</span>
              <Calculator size={28} />
            </div>
          </button>

        </div>

      </div>
    </div>
  );
};

export default ManagerPage;