"use client";

import React from 'react';

const BG_CREAM = '#F3F6EB';
const BRAND_GREEN = '#446F41';

const AdminPage = () => {
  return (
    <div style={{ backgroundColor: BG_CREAM }} className="min-h-screen flex flex-col items-center p-4" dir="rtl">
      
      
      <header className="w-full max-w-4xl flex justify-between items-center mb-10 mt-4">
        <div className="px-4 py-1 rounded-full text-white text-sm" style={{ backgroundColor: BRAND_GREEN }}>
            משתמש מנהל
        </div>
      </header>
    </div>
  );
};

export default AdminPage;