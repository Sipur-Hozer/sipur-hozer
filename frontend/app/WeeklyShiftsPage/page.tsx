"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { Trash2, Plus, Calendar, User, ArrowRight } from 'lucide-react';

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
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    userId: '',
    day: 'ראשון',
    startHour: '',
    endHour: ''
  });

  const daysOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await fetch('http://localhost:8080/users');
        if (usersRes.ok) {
            const usersData = await usersRes.json();
            if (Array.isArray(usersData)) {
                setUsers(usersData);
            }
        }

        const shiftsRes = await fetch('http://localhost:8080/admin/schedule');
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

  const handleAddShift = async () => {
    if (!formData.userId || !formData.startHour || !formData.endHour) {
      alert("נא למלא את כל השדות");
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/admin/schedule', {
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
        const updatedShiftsRes = await fetch('http://localhost:8080/admin/schedule');
        const updatedShifts = await updatedShiftsRes.json();
        setShifts(updatedShifts);
        
        setFormData({ ...formData, userId: '', startHour: '', endHour: '' });
      } else {
        alert("שגיאה בהוספת המשמרת");
      }
    } catch (error) {
      console.error("Error adding shift:", error);
      alert("תקלה בתקשורת עם השרת");
    }
  };

  const handleDeleteShift = async (id: number) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק משמרת זו?")) return;

    try {
      const res = await fetch(`http://localhost:8080/admin/schedule/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setShifts(shifts.filter((shift) => shift.ID !== id));
      } else {
        alert("שגיאה במחיקת המשמרת");
      }
    } catch (error) {
      console.error("Error deleting shift:", error);
    }
  };

  return (
    <div style={{ backgroundColor: BG_CREAM }} className="min-h-screen p-6" dir="rtl">
      
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">ניהול סידור עבודה</h1>
          <button 
            onClick={() => router.push('/admin')} 
            className="flex items-center gap-2 text-gray-600 hover:text-[#446F41] transition-colors font-medium"
          >
            <ArrowRight size={20} />
            חזרה
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md mb-8 border-t-4 border-[#446F41]">
          <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Plus size={20} /> הוספת משמרת חדשה
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-600 mb-1">בחר עובד</label>
              <div className="relative">
                <select
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#446F41] outline-none appearance-none"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                >
                  <option value="" disabled>בחר עובד מהרשימה...</option>
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

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">התחלה</label>
              <input
                type="time"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#446F41] outline-none"
                value={formData.startHour}
                onChange={(e) => setFormData({ ...formData, startHour: e.target.value })}
              />
            </div>
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
                            onClick={() => handleDeleteShift(shift.ID)}
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