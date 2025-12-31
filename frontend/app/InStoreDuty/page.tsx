"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react'; 

const BRAND_GREEN = '#446F41';
const BG_CREAM = '#F3F6EB';
const INPUT_BG_COLOR = '#B2C6AE';

const ROLES = [
  "טיפול בהזמנות אינטרנט",
  "קופה",
  "שירות לקוחות",
  "העתקת תקצירים",
  "אישור תקצירים",
  "נאמנות מלאי",
  "ספירת מלאי",
  "מיון",
];

const InsideRolesPage = () => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  

  const [booksQuantity, setBooksQuantity] = useState('');
  const [CashDesk, setCashDesk] = useState('');

  const handleRoleChange = (e : React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);

  
    if (newRole !== 'other') setCustomRole('');
    if (newRole !== 'טיפול בהזמנות אינטרנט') setBooksQuantity('');
    if (newRole !== 'קופה') setCashDesk('');
  };

  // const handleConfirm = () => {
  //   const dataToSend = {
  //       role: selectedRole === 'other' ? customRole : selectedRole,
  //       booksQuantity: selectedRole === 'טיפול בהזמנות אינטרנט' ? booksQuantity : null,
  //       cashDesk: selectedRole === 'קופה' ? CashDesk : null
  //   };
    
  //   console.log("Sending Data:", dataToSend);
  //   router.push('/Browser');
  // };

  const [status, setStatus] = useState({ loading: false, message: '', error: false });

  const handleConfirm = async () => {
    setStatus({ loading: true, message: 'מעדכן סיום משמרת...', error: false });

    const dataToSend = {
        role: selectedRole === 'other' ? customRole : selectedRole,
        booksQuantity: (selectedRole === 'טיפול בהזמנות אינטרנט' || selectedRole === 'קופה') ? booksQuantity : null,
        cashDesk: selectedRole === 'קופה' ? CashDesk : null
    };

    console.log("Sending Data:", dataToSend);

    try {
      const res = await fetch('http://localhost:8080/end-shift-inside', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ loading: false, message: 'המשמרת הסתיימה בהצלחה!', error: false });
        alert("המשמרת הסתיימה בהצלחה!");
        
        router.push('/Browser');
      } else {
        const errorMsg = data.error || "לא ניתן לסיים משמרת";
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
        
        <h1 className="text-2xl font-bold text-center text-gray-800">בחר תפקיד </h1>
        
        <div className="space-y-4">
          
          <label className="text-sm font-semibold text-gray-600 mr-1">אנא בחר תפקיד מהרשימה:</label>
          
          {/* קומפוננטת ה-Dropdown */}
          <div className="relative">
            <select
              value={selectedRole}
              onChange={handleRoleChange} // <--- שינוי 4: שימוש בפונקציה החדשה במקום ישירות ב-setSelectedRole
              className="w-full h-14 px-4 pl-10 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-[#446F41] focus:border-[#446F41] block text-lg appearance-none cursor-pointer"
            >
              <option value="" disabled>לחץ לבחירה...</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
              <option value="other">אחר</option>
            </select>
            
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <ChevronDown size={20} />
            </div>
          </div>

          {/* <--- שינוי 5: בלוק חדש שמופיע רק בבחירת "טיפול בהזמנות אינטרנט" */}
          {selectedRole === 'טיפול בהזמנות אינטרנט' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-sm font-semibold text-gray-600 mr-1 mb-1 block">כמות ספרים שנמכרו:</label>
              <input
                type="number" // <--- סוג מספר בלבד
                min="0"
                placeholder="הקלד כמות..."
                value={booksQuantity}
                onChange={(e) => setBooksQuantity(e.target.value)}
                className="w-full h-14 px-4 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#446F41] outline-none transition-all"
                autoFocus
              />
            </div>
          )}
          {selectedRole === 'קופה' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-sm font-semibold text-gray-600 mr-1 mb-1 block">כמות ספרים שנמכרו:</label>
              <input
                type="number" 
                min="0"
                placeholder="הקלד כמות ..."
                value={booksQuantity}
                onChange={(e) => setBooksQuantity(e.target.value)}
                className="w-full h-14 px-4 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#446F41] outline-none transition-all"
                autoFocus
              />
              <label className="text-sm font-semibold text-gray-600 mr-1 mb-1 block">האם הייתה עמלת יעד</label>
              <input
                placeholder="הקלד כמות ..."
                value={CashDesk}
                onChange={(e) => setCashDesk(e.target.value)}
                className="w-full h-14 px-4 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#446F41] outline-none transition-all"
                autoFocus
              />
            </div>
            
          )}

          {/* שדה כתיבה שנפתח רק אם בחרו 'אחר' */}
          {selectedRole === 'other' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-sm font-semibold text-gray-600 mr-1 mb-1 block">הזן את שם התפקיד:</label>
              <input
                type="text"
                placeholder="כתוב כאן..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="w-full h-14 px-4 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#446F41] outline-none transition-all"
                autoFocus
              />
            </div>
          )}

        </div>

        <button
          onClick={handleConfirm}
          // <--- שינוי 6: הוספת תנאי לנעילת הכפתור (אם זה הזמנות ואין כמות - נשאר נעול)
          disabled={
            !selectedRole || 
            (selectedRole === 'other' && !customRole) 
          }
          className="w-full py-4 rounded-xl text-lg font-bold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          style={{ backgroundColor: BRAND_GREEN }}
        >
          אישור והמשך
        </button>

      </div>
    </div>
  );
};

export default InsideRolesPage;