"use client";

import React, { useState } from "react";
import { createFaculty } from "./actions";

export default function AddFacultyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registeredId, setRegisteredId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await createFaculty(new FormData(e.currentTarget));
    setLoading(false);
    
    if (result?.success) setRegisteredId(result.generatedId);
    else alert(result?.error);
  }

  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)} className="w-full bg-[#7A8F66] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-[#7A8F66]/20 hover:bg-[#6b7d5a] transition sm:w-auto">
      + Add New Faculty
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-md max-h-[92vh] overflow-y-auto rounded-[1.5rem] sm:rounded-[2.5rem] border border-[#F5F1EA] shadow-2xl p-5 sm:p-8">
        {registeredId ? (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl font-black">✓</div>
            <h3 className="font-black text-[#2D2D2D] text-lg">Registration Successful</h3>
            <div className="bg-[#FAF9F6] border border-[#F5F1EA] rounded-2xl p-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Assigned ID & Password</p>
              <p className="text-2xl font-mono font-black text-[#7A8F66] tracking-tighter">{registeredId}</p>
            </div>
            <button onClick={() => {setIsOpen(false); setRegisteredId(null);}} className="w-full py-4 bg-[#2D2D2D] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all">Done & Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-black text-[#2D2D2D] text-lg">New Faculty Entry</h3>
              <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400">✕</button>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase px-1">Full Name</label>
              <input name="fullName" required className="w-full p-3.5 bg-[#FAF9F6] border border-[#F5F1EA] rounded-xl text-xs font-bold focus:outline-none" placeholder="Priyanka Chouhan" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase px-1">Role</label>
              <select name="role" className="w-full p-3.5 bg-[#FAF9F6] border border-[#F5F1EA] rounded-xl text-xs font-bold focus:outline-none">
                <option value="staff">STAFF</option>
                <option value="teacher">TEACHER</option>
                <option value="hod">HOD</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase px-1">Email Address</label>
              <input name="email" type="email" required className="w-full p-3.5 bg-[#FAF9F6] border border-[#F5F1EA] rounded-xl text-xs font-bold focus:outline-none" placeholder="faculty@college.edu" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase px-1">Department</label>
              <input name="department" required className="w-full p-3.5 bg-[#FAF9F6] border border-[#F5F1EA] rounded-xl text-xs font-bold focus:outline-none" placeholder="Library" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 bg-[#2D2D2D] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50">
              {loading ? "Registering..." : "Finalize Registration"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
