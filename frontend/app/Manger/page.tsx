"use client";

import React, { useState } from 'react';

const BG_CREAM = '#F3F6EB';
const BRAND_GREEN = '#446F41';

const AdminPage = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch('http://localhost:8080/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          phone,
          password,
          role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('המשתמש נוצר בהצלחה!');
        setFullName('');
        setPhone('');
        setPassword('');
        setRole('employee');
      } else {
        setIsError(true);
        setMessage(data.error || 'שגיאה ביצירת המשתמש');
      }
    } catch (error) {
      setIsError(true);
      setMessage('שגיאת תקשורת עם השרת');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#446F41] mb-4 text-right";

  return (
    <div style={{ backgroundColor: BG_CREAM }} className="min-h-screen flex flex-col items-center p-4" dir="rtl">
      
      <header className="w-full max-w-4xl flex justify-between items-center mb-10 mt-4">
        <h1 className="text-2xl font-bold text-gray-800">פאנל ניהול</h1>
        <div className="px-4 py-1 rounded-full text-white text-sm" style={{ backgroundColor: BRAND_GREEN }}>
            מחובר: מנהל מערכת
        </div>
      </header>

      <main className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">יצירת עובד חדש</h2>

        <form onSubmit={handleCreateUser}>
          
          <label className="block text-gray-700 text-sm font-bold mb-2">שם מלא:</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClasses}
            placeholder="ישראל ישראלי"
            required
          />

          <label className="block text-gray-700 text-sm font-bold mb-2">מספר טלפון (שם משתמש):</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClasses}
            placeholder="050..."
            required
            dir="ltr"
            style={{ textAlign: 'right' }}
          />

          <label className="block text-gray-700 text-sm font-bold mb-2">סיסמה:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses}
            placeholder="******"
            required
          />

          <label className="block text-gray-700 text-sm font-bold mb-2">תפקיד:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={inputClasses}
          >
            <option value="employee">עובד רגיל</option>
            <option value="admin">מנהל</option>
          </select>

          {message && (
            <div className={`text-center mb-4 font-bold ${isError ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-white font-bold shadow-md hover:opacity-90 transition duration-150 disabled:opacity-50"
            style={{ backgroundColor: BRAND_GREEN }}
          >
            {loading ? 'יוצר...' : 'צור משתמש'}
          </button>

        </form>
      </main>

    </div>
  );
};

export default AdminPage;