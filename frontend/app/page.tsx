"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const LOGO_SRC = '/images/sipurHozerlogo.png';
const BRAND_GREEN = '#446F41';
const BG_CREAM = '#F3F6EB';
const INPUT_BG_COLOR = '#B2C6AE';

const LoginPage = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();

    const handleLogin = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8080/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password }),
            });

            const data = await response.json();

            if (response.ok && data.role == "employee") {
                router.push('/Browser');
            } else if(response.ok && data.role == "manager") {
                router.push('/Manger');
            }  else {
                setError(data.message || 'שם משתמש/סיסמא שגויים - נסה שוב');
            } 
        } catch (err) {
            setError('אין תקשורת עם השרת');
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "h-16 w-full text-center text-lg font-semibold placeholder-current bg-opacity-70 rounded-lg outline-none focus:ring-2 focus:ring-[#446F41]";

    return (
        <div style={{ backgroundColor: BG_CREAM }} className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-sm flex flex-col items-center">

                <div className="mb-10 flex flex-col items-center">
                    <Image
                        src={LOGO_SRC}
                        alt="לוגו סיפור חוזר"
                        width={250}
                        height={250}
                        className="mb-3"
                        priority
                    />
                </div>

                <div className="space-y-6 w-full">

                    <input
                        type="tel"
                        placeholder="מספר טלפון"
                        className={inputClasses}
                        style={{ backgroundColor: INPUT_BG_COLOR, color: BRAND_GREEN }}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        dir="rtl"
                    />

                    <input
                        type="password"
                        placeholder="סיסמה"
                        className={inputClasses}
                        style={{ backgroundColor: INPUT_BG_COLOR, color: BRAND_GREEN }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        dir="rtl"
                    />

                    {error && <p className="text-red-600 text-center font-bold">{error}</p>}

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full h-16 flex items-center justify-center text-lg font-bold text-white shadow-md rounded-lg transition duration-150 ease-in-out hover:bg-opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: BRAND_GREEN }}
                    >
                        {loading ? 'מתחבר...' : 'כניסה'}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default LoginPage;