"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { Trash2, Plus, Calendar, User, ArrowRight, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../config';

const BRAND_GREEN = '#446F41';
const BG_CREAM = '#F3F6EB';

interface UserData {
  ID: number;
  fullName: string;
  phone: string;
}

interface ShiftData {
  ID: number;
  userId: number;
  day: string;
  startHour: string;
  endHour: string;
}

const AdminSchedulePage = () => {
  const router = useRouter();
  
  // Data States
  const [users, setUsers] = useState<UserData[]>([]);
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    userId: '',
    day: 'ראשון',
    startHour: '',
    endHour: ''
  });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ 
    type: '', // 'success', 'error', 'confirm'
    title: '', 
    message: '' 
  });
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const daysOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await fetch(`${API_BASE_URL}`);
        if (usersRes.ok) {
            const usersData = await usersRes.json();
            if (Array.isArray(usersData)) {
                setUsers(usersData);
            }
        }

        const shiftsRes = await fetch(`${API_BASE_URL}/admin/schedule`);
        if (shiftsRes.ok) {
            const shiftsData = await shiftsRes.json();
            if (Array.isArray(shiftsData)) {
                setShifts(shiftsData);
            }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper to open modal
  const openModal = (type: string, title: string, message: string) => {
      setModalContent({ type, title, message });
      setShowModal(true);
  };

  // Handle Adding a new Shift
  const handleAddShift = async () => {
    if (!formData.userId || !formData.startHour || !formData.endHour) {
      openModal('error', 'שגיאה', 'נא למלא את כל השדות');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(formData.userId), 
          day: formData.day,
          startHour: formData.startHour,
          endHour: formData.endHour
        })
      });

      if (res.ok) {
        // Refresh shift list
        const updatedShiftsRes = await fetch(`${API_BASE_URL}/admin/schedule`);
        const updatedShifts = await updatedShiftsRes.json();
        setShifts(updatedShifts);
        
        // Reset form
        setFormData({ ...formData, userId: '', startHour: '', endHour: '' });
        
        openModal('success', 'הצלחה', 'המשמרת שובצה בהצלחה');
      } else {
        openModal('error', 'שגיאה', 'אירעה שגיאה בעת הוספת המשמרת');
      }
    } catch (error) {
      console.error("Error adding shift:", error);
      openModal('error', 'תקלה', 'תקלה בתקשורת עם השרת');
    }
  };

  const handleDeleteRequest = (id: number) => {
    setPendingDeleteId(id);
    openModal('confirm', 'מחיקת משמרת', '?האם אתה בטוח שברצונך למחוק משמרת זו');
  };

  const executeDelete = async () => {
    if (!pendingDeleteId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/schedule${pendingDeleteId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setShifts(shifts.filter((shift) => shift.ID !== pendingDeleteId));
        setShowModal(false); // Close modal immediately on success
      } else {
        openModal('error', 'שגיאה', 'לא ניתן למחוק את המשמרת.');
      }
    } catch (error) {
      console.error("Error deleting shift:", error);
      openModal('error', 'תקלה', 'תקלה בתקשורת עם השרת.');
    } finally {
        setPendingDeleteId(null);
    }
  };

  return (
    <div style={{ backgroundColor: BG_CREAM }} className="min-h-screen p-6 relative" dir="rtl">
      
      {/* --- Custom Modal --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform scale-100 transition-all">
            
            {/* Modal Header Icon */}
            <div className={`p-6 flex justify-center ${
                modalContent.type === 'success' ? 'bg-green-50' : 
                modalContent.type === 'confirm' ? 'bg-orange-50' : 'bg-red-50'
            }`}>
                {modalContent.type === 'success' && (
                    <div className="bg-green-100 p-3 rounded-full">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                )}
                {modalContent.type === 'error' && (
                    <div className="bg-red-100 p-3 rounded-full">
                        <AlertCircle className="h-12 w-12 text-red-600" />
                    </div>
                )}
                {modalContent.type === 'confirm' && (
                    <div className="bg-orange-100 p-3 rounded-full">
                        <AlertTriangle className="h-12 w-12 text-orange-600" />
                    </div>
                )}
            </div>

            {/* Modal Content */}
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {modalContent.title}
              </h3>
              <p className="text-gray-600">
                {modalContent.message}
              </p>
            </div>

            {/* Modal Buttons */}
            <div className="p-4 bg-gray-50 flex justify-center gap-3">
              {modalContent.type === 'confirm' ? (
                  <>
                    <button 
                        onClick={() => setShowModal(false)}
                        className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition duration-200"
                    >
                        ביטול
                    </button>
                    <button 
                        onClick={executeDelete}
                        className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition duration-200"
                    >
                        כן, מחק
                    </button>
                  </>
              ) : (
                <button 
                    onClick={() => setShowModal(false)}
                    className={`w-full py-3 px-4 font-bold rounded-xl text-white transition duration-200 shadow-md hover:shadow-lg
                        ${modalContent.type === 'success' 
                            ? 'bg-[#446F41] hover:bg-[#365833]' 
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                >
                    סגור
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* --- End Modal --- */}

      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">ניהול סידור עבודה</h1>
          <button 
            onClick={() => router.push('/Manager')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#446F41] transition-colors font-medium"
          >
            <ArrowRight size={20} />
            חזרה
          </button>
        </div>

        {/* Add Shift Form */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8 border-t-4 border-[#446F41]">
          <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Plus size={20} /> הוספת משמרת חדשה
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            
            {/* User Select */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-600 mb-1">בחר עובד</label>
              <div className="relative">
                <select
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#446F41] outline-none appearance-none"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                >
                  <option value="" disabled>בחר עובד מהרשימה</option>
                  {users.length > 0 ? (
                      users.map((user) => (
                        <option key={user.ID} value={user.ID}>
                          {user.fullName} - {user.phone}
                        </option>
                      ))
                  ) : (
                      <option disabled>טוען עובדים...</option>
                  )}
                </select>
                <User size={18} className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Day Select */}
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">יום</label>
              <div className="relative">
                <select
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#446F41] outline-none appearance-none"
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                >
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <Calendar size={18} className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">התחלה</label>
              <input
                type="time"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#446F41] outline-none"
                value={formData.startHour}
                onChange={(e) => setFormData({ ...formData, startHour: e.target.value })}
              />
            </div>
            
            {/* End Time */}
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">סיום</label>
              <input
                type="time"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#446F41] outline-none"
                value={formData.endHour}
                onChange={(e) => setFormData({ ...formData, endHour: e.target.value })}
              />
            </div>

          </div>

          <button
            onClick={handleAddShift}
            className="mt-6 w-full md:w-auto px-8 py-3 rounded-xl text-white font-bold shadow-md hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: BRAND_GREEN }}
          >
            <Plus size={20} />
            שבץ משמרת
          </button>
        </div>

        {/* Existing Shifts List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-bold text-gray-700">משמרות קיימות במערכת</h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">טוען נתונים...</div>
          ) : shifts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
                אין משמרות משובצות כרגע.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600 text-sm">
                    <th className="p-4 font-bold">עובד</th>
                    <th className="p-4 font-bold">יום</th>
                    <th className="p-4 font-bold">שעות</th>
                    <th className="p-4 font-bold text-center">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((shift) => {
                    const worker = users.find(u => u.ID === shift.userId);
                    
                    return (
                      <tr key={shift.ID} className="border-b border-gray-100 hover:bg-[#F3F6EB] transition-colors">
                        <td className="p-4 font-medium text-gray-800">
                          {worker ? worker.fullName : `עובד לא נמצא (${shift.userId})`}
                        </td>
                        <td className="p-4">
                          <span className="bg-green-100 text-[#446F41] px-3 py-1 rounded-full text-sm font-bold">
                            {shift.day}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-gray-600">
                          {shift.startHour} - {shift.endHour}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDeleteRequest(shift.ID)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="מחק משמרת"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminSchedulePage;