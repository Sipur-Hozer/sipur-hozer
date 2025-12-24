"use client";

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const BRAND_GREEN = '#446F41';
const BG_CREAM = '#F3F6EB';

const CreateUserPage = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    role: 'employee'
  });

  const [status, setStatus] = useState({ loading: false, message: '', error: false });

  const handleChange = (e:any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setStatus({ loading: true, message: '', error: false });

    try {
      const res = await fetch('http://localhost:8080/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ loading: false, message: 'המשתמש נוצר בהצלחה!', error: false });
        setFormData({ fullName: '', phone: '', password: '', role: 'employee' }); 
      } else {
        setStatus({ loading: false, message: data.error || res.statusText, error: true });
      }
    } catch (err) {
      setStatus({ loading: false, message: 'תקלה בתקשורת עם השרת', error: true });
    }
  };

  const inputClass = "w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#446F41] bg-white text-gray-800 text-right";
  const labelClass = "block text-sm font-bold text-gray-700 mb-2 text-right";

  return (
    <div style={{ backgroundColor: BG_CREAM }} className="min-h-screen flex items-center justify-center p-4 relative" dir="rtl">
      
      <button 
        onClick={() => router.back()} 
        className="absolute top-6 right-6 text-gray-600 hover:text-[#446F41] transition-colors"
      >
        <ArrowRight size={28} />
      </button>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">יצירת משתמש חדש</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className={labelClass}>שם מלא</label>
            <input
              type="text"
              name="fullName"
              placeholder="שם מלא"
              value={formData.fullName}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>מספר טלפון (שם משתמש)</label>
            <input
              type="tel"
              name="phone"
              placeholder="מספר טלפון"
              value={formData.phone}
              onChange={handleChange}
              required
              dir="ltr"
              style={{ textAlign: 'right' }}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>סיסמה</label>
            <input
              type="password"
              name="password"
              placeholder="******"
              value={formData.password}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>תפקיד במערכת</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="employee">עובד רגיל</option>
              <option value="admin">מנהל</option>
            </select>
          </div>

          {status.message && (
            <div className={`text-center p-3 rounded-lg text-sm font-bold ${status.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {status.message}
            </div>
          )}

          <button
            type="submit"
            disabled={status.loading}
            className="w-full h-12 rounded-xl text-white font-bold shadow-md hover:opacity-90 transition-all disabled:opacity-50 mt-4"
            style={{ backgroundColor: BRAND_GREEN }}
          >
            {status.loading ? 'שומר...' : 'צור משתמש'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateUserPage;