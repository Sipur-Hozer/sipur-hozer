"use client";

import { API_BASE_URL } from '../config';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Camera, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

const BRAND_GREEN = '#446F41';
const BG_CREAM = '#F3F6EB';

const ROLES = [
  "סוכן עמדה",
  "סוכן רכבת",
  "יריד"
];

const OutsideRolesPage = () => {
  const router = useRouter();
  
  // State for form fields
  const [selectedRole, setSelectedRole] = useState('');
  const [customRole, setCustomRole] = useState('');

  // State for loading status
  const [isLoading, setIsLoading] = useState(false);

  // State for Custom Modal visibility and content
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ type: '', title: '', message: '' });

  // Handle dropdown selection changes
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
  };

  // Submit data to the backend
  const handleConfirm = async () => {
    setIsLoading(true);

    const finalRole = selectedRole === 'other' ? customRole : selectedRole;
    
    const dataToSend = {
        role: finalRole,
        extra: "דיווח מהשטח"
    };

    console.log("Sending Outside Shift Data:", dataToSend);

    try {
      const res = await fetch(`${API_BASE_URL}/end-shift-outside`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (res.ok) {
        // Configure modal for success state
        setModalContent({
            type: 'success',
            title: 'הדיווח התקבל',
            message: 'סיום משמרת שטח דווח בהצלחה במערכת'
        });
        setShowModal(true);
      } else {
        // Configure modal with server error message
        const errorMsg = data.error || "שגיאה בסיום משמרת שטח";
        setModalContent({
            type: 'error',
            title: 'שגיאה',
            message: errorMsg
        });
        setShowModal(true);
      }
    } catch (err) {
      console.error("Connection error:", err);
      // Configure modal for connection failure
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

  // Handle modal close action
  const handleModalClose = () => {
      setShowModal(false);
      // Redirect to Browser page only if the operation was successful
      if (modalContent.type === 'success') {
          router.push('/Browser');
      }
  };

  return (
    <div style={{ backgroundColor: BG_CREAM }} className="min-h-screen flex items-center justify-center p-4 relative" dir="rtl">
      
      <button
        onClick={() => router.push('/Browser')}
        className="absolute top-6 right-6 flex items-center gap-2 text-[#446F41] font-bold hover:text-green-800 transition-colors z-10"
      >
        <ArrowRight size={24} />
        <span>חזרה</span>
      </button>
      
      {/* --- Custom Modal Implementation --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform scale-100 transition-all">
            
            {/* Modal Header Icon */}
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

            {/* Modal Content Text */}
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {modalContent.title}
              </h3>
              <p className="text-gray-600">
                {modalContent.message}
              </p>
            </div>

            {/* Modal Action Button */}
            <div className="p-4 bg-gray-50 flex justify-center">
              <button 
                onClick={handleModalClose}
                className={`w-full py-3 px-4 font-bold rounded-xl text-white transition duration-200 shadow-md hover:shadow-lg
                    ${modalContent.type === 'success' 
                        ? 'bg-[#446F41] hover:bg-[#365833]' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
              >
                {modalContent.type === 'success' ? 'מעולה, תודה!' : 'הבנתי, סגור'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- End of Custom Modal --- */}


      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 flex flex-col gap-6">
        
        <h1 className="text-2xl font-bold text-center text-gray-800">בחר תפקיד (שטח)</h1>
        
        <div className="space-y-4">
          <label className="text-sm font-semibold text-gray-600 mr-1">אנא בחר תפקיד מהרשימה:</label>

          {/* Dropdown Component */}
          <div className="relative">
            <select
              value={selectedRole}
              onChange={handleRoleChange}
              className="w-full h-14 px-4 pl-10 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-[#446F41] focus:border-[#446F41] block text-lg appearance-none cursor-pointer"
            >
              <option value="" disabled>לחץ לבחירה</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
              <option value="other">אחר</option>
            </select>
            
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <ChevronDown size={20} />
            </div>
          </div>

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

          {/* Camera Button (Disabled placeholder) */}
          <div className="pt-4 border-t border-gray-100">
            <button
              disabled
              className="w-full py-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 flex items-center justify-center gap-2 cursor-not-allowed opacity-70 hover:bg-gray-100 transition-colors"
            >
              <Camera size={20} />
              <span className="font-medium">הוסף תמונה</span>
            </button>
          </div>
        </div>

        {/* Submit Button with Spinner */}
        <button
          onClick={handleConfirm}
          disabled={
            isLoading ||
            !selectedRole || 
            (selectedRole === 'other' && !customRole)
          }
          className="w-full py-4 rounded-xl text-lg font-bold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ backgroundColor: BRAND_GREEN }}
        >
           {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                מעבד נתונים
              </>
          ) : (
              "אישור והמשך"
          )}
        </button>

      </div>
    </div>
  );
};

export default OutsideRolesPage;