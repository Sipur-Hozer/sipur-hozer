"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Camera } from 'lucide-react';

const BRAND_GREEN = '#446F41';
const BG_CREAM = '#F3F6EB';

const ROLES = [
  "סוכן עמדה",
  "סוכן רכבת",
  "יריד"
];

const OutsideRolesPage = () => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('');
  const [customRole, setCustomRole] = useState('');

  const [status, setStatus] = useState({ loading: false, message: '', error: false });

  const handleConfirm = async () => {
    setStatus({ loading: true, message: 'מעדכן סיום משמרת שטח...', error: false });

    const finalRole = selectedRole === 'other' ? customRole : selectedRole;
    
    const dataToSend = {
        role: finalRole,
        extra: "דיווח מהשטח"
    };

    console.log("Sending Outside Shift Data:", dataToSend);

    try {
      const res = await fetch('http://localhost:8080/end-shift-outside', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ loading: false, message: 'הדיווח התקבל בהצלחה!', error: false });
        alert("סיום משמרת שטח דווח בהצלחה!");
        
        router.push('/Browser');
      } else {
        const errorMsg = data.error || "שגיאה בסיום משמרת שטח";
        setStatus({ loading: false, message: errorMsg, error: true });
        alert("שגיאה: " + errorMsg);
      }
    } catch (err) {
      console.error("Connection error:", err);
      setStatus({ loading: false, message: 'תקלה בתקשורת עם השרת', error: true });
      alert("תקלה בתקשורת עם השרת");
    }
  };

  return (
    <div style={{ backgroundColor: BG_CREAM }} className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 flex flex-col gap-6">
        
        <h1 className="text-2xl font-bold text-center text-gray-800">בחר תפקיד (שטח)</h1>
        
        <div className="space-y-4">
          <label className="text-sm font-semibold text-gray-600 mr-1">אנא בחר תפקיד מהרשימה:</label>

          {/* Dropdown */}
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full h-14 px-4 pl-10 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-[#446F41] focus:border-[#446F41] block text-lg appearance-none cursor-pointer"
            >
              <option value="" disabled>לחץ לבחירה...</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
              <option value="other">אחר (פרט)</option>
            </select>
            
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <ChevronDown size={20} />
            </div>
          </div>

          {/* שדה כתיבה דינמי */}
          {selectedRole === 'other' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-sm font-semibold text-gray-600 mr-1 mb-1 block">הזן תפקיד:</label>
              <input
                type="text"
                placeholder="כתוב כאן..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="w-full h-14 px-4 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#446F41] outline-none"
                autoFocus
              />
            </div>
          )}

          {/* כפתור תמונה (לא פעיל) */}
          <div className="pt-4 border-t border-gray-100">
            <button
              disabled
              className="w-full py-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 flex items-center justify-center gap-2 cursor-not-allowed opacity-70 hover:bg-gray-100 transition-colors"
            >
              <Camera size={20} />
              <span className="font-medium">הוסף תמונה (לא זמין)</span>
            </button>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selectedRole || (selectedRole === 'other' && !customRole)}
          className="w-full py-4 rounded-xl text-lg font-bold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: BRAND_GREEN }}
        >
          אישור והמשך
        </button>

      </div>
    </div>
  );
};

export default OutsideRolesPage;