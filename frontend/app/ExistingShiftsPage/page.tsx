"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Calendar, Clock, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface Shift {
  ID: number;
  userId: number;    
  day: string;      
  startHour: string; 
  endHour: string;   
}

const BRAND_GREEN = '#446F41';
const BG_CREAM = '#F3F6EB';

const ExistingShiftsPage = () => {
  const router = useRouter();
  const [shifts, setShifts] = useState<Shift[]>([]);;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShifts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/user/weekly-schedule`, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                credentials: 'include', 
            });

            if (res.status === 401) {
                console.error("User not authorized");
                router.push('/');
                return;
            }

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();

            if (Array.isArray(data)) {
                setShifts(data);
            }
        } catch (err) {
            console.error("Error fetching shifts:", err);
        } finally {
            setLoading(false);
        }
    };

    fetchShifts();
  }, []);

  return (
    <div style={{ backgroundColor: BG_CREAM }} className="min-h-screen p-6 flex flex-col items-center" dir="rtl">
      
      <div className="w-full max-w-md flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">המשמרות שלי</h1>
        
        <button 
          onClick={() => router.push('/Browser')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#446F41] transition-colors font-medium"
        >
          <ArrowRight size={20} />
          חזרה לתפריט
        </button>
      </div>

      <div className="w-full max-w-md space-y-4">
        
        {loading ? (
          <p className="text-center text-gray-500">טוען משמרות...</p>
        ) : shifts.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-gray-100">
            <AlertCircle className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-gray-500">אין משמרות משובצות.</p>
          </div>
        ) : (
          shifts.map((shift) => (
            <div key={shift.ID} className="bg-white p-5 rounded-xl shadow-md border-r-4 border-[#446F41] flex justify-between items-center transition-transform hover:scale-[1.01]">
              <div className="flex items-center gap-3">
                <div className="bg-green-50 p-3 rounded-full text-[#446F41]">
                    <Calendar size={20} />
                </div>
                <div>
                    <p className="font-bold text-lg text-gray-800">יום {shift.day}</p>
                    <p className="text-xs text-gray-400">משמרת שבועית</p>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={16} />
                    <span className="font-mono font-bold text-lg">
                        {shift.startHour} - {shift.endHour}
                    </span>
                </div>
              </div>

            </div>
          ))
        )}

      </div>
    </div>
  );
};

export default ExistingShiftsPage;