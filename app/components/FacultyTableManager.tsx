"use client";

import React, { useState } from "react";
import { handleUpdateFaculty, handleDeleteFaculty } from "../admin/employees/actions";

export function FacultyTableManager({ initialData }: { initialData: any[] }) {
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRowClick = (staff: any) => {
    setSelectedStaff({ ...staff });
    setErrorMessage("");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setIsSubmitting(true);
    setErrorMessage("");

    const res = await handleUpdateFaculty({
      id: selectedStaff.id,
      full_name: selectedStaff.full_name,
      email: selectedStaff.email,
      department: selectedStaff.department,
      role: selectedStaff.role,
      status: selectedStaff.status || "ACTIVE"
    });

    setIsSubmitting(false);
    if (!res.success) {
      setErrorMessage(res.error || "Failed to update profile.");
    } else {
      setSelectedStaff(null);
    }
  };

  const executeDeletion = async () => {
    if (!selectedStaff || !confirm(`Are you absolutely sure you want to delete ${selectedStaff.full_name}?`)) return;
    setIsSubmitting(true);

    const res = await handleDeleteFaculty(selectedStaff.id);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || "Failed to delete account parameters.");
    } else {
      setSelectedStaff(null);
    }
  };

  return (
    <div className="relative">
      {/* 1. MAIN DIRECTORY GRID TABLE AS SEEN IN IMAGE_9283AA.PNG */}
      <div className="bg-white border border-[#F5F1EA] rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F5F1EA] bg-[#FAF9F6] text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="p-4 sm:p-6">Employee ID</th>
                <th className="p-4 sm:p-6">Full Name</th>
                <th className="p-4 sm:p-6">Department</th>
                <th className="p-4 sm:p-6">Role</th>
                <th className="p-4 sm:p-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F1EA]">
              {initialData.map((staff) => (
                <tr 
                  key={staff.id} 
                  onClick={() => handleRowClick(staff)}
                  className="hover:bg-[#FAF9F6]/50 cursor-pointer transition-all group"
                >
                  <td className="p-4 sm:p-6 font-mono text-xs text-amber-800 font-bold group-hover:text-amber-900">
                    {staff.employee_id}
                  </td>
                  <td className="p-4 sm:p-6">
                    <div className="font-black text-sm text-[#2D2D2D]">{staff.full_name}</div>
                    <div className="text-[10px] text-gray-400 font-medium">{staff.email}</div>
                  </td>
                  <td className="p-4 sm:p-6 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    {staff.department || "—"}
                  </td>
                  <td className="p-4 sm:p-6">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-gray-100 text-gray-600">
                      {staff.role}
                    </span>
                  </td>
                  <td className="p-4 sm:p-6">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {staff.status || "ACTIVE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. SLIDE-OUT / POP-UP MANAGEMENT CONSOLE MODAL */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-[#F5F1EA] rounded-[1.5rem] sm:rounded-[2rem] w-full max-w-lg max-h-[92vh] shadow-xl overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-6 bg-[#FAF9F6] border-b border-[#F5F1EA] flex items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-base text-[#2D2D2D]">Modify Profile Parameters</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  ID Key: {selectedStaff.employee_id}
                </p>
              </div>
              <button 
                onClick={() => setSelectedStaff(null)}
                className="w-8 h-8 rounded-full bg-gray-200/60 hover:bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500 transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold">
                  Error: {errorMessage}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  value={selectedStaff.full_name}
                  onChange={(e) => setSelectedStaff({ ...selectedStaff, full_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold text-[#2D2D2D] bg-gray-50/50 focus:bg-white focus:outline-none focus:border-black transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Email Workspace</label>
                <input 
                  type="email" 
                  value={selectedStaff.email}
                  onChange={(e) => setSelectedStaff({ ...selectedStaff, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold text-[#2D2D2D] bg-gray-50/50 focus:bg-white focus:outline-none focus:border-black transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Department</label>
                  <input 
                    type="text" 
                    value={selectedStaff.department || ""}
                    onChange={(e) => setSelectedStaff({ ...selectedStaff, department: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold text-[#2D2D2D] bg-gray-50/50 focus:bg-white focus:outline-none focus:border-black transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">System Role</label>
                  <select 
                    value={selectedStaff.role}
                    onChange={(e: any) => setSelectedStaff({ ...selectedStaff, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-black uppercase text-[#2D2D2D] bg-white focus:outline-none focus:border-black transition-all"
                  >
                    <option value="teacher">Teacher</option>
                    <option value="HOD">HOD</option>
                    <option value="management">Management</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-[#F5F1EA] pt-6 mt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={executeDeletion}
                  disabled={isSubmitting}
                  className="w-full px-5 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all disabled:opacity-50 sm:w-auto"
                >
                  🛑 Delete Profile
                </button>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => setSelectedStaff(null)}
                    className="w-full px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-5 py-3 bg-[#2D2D2D] hover:bg-black text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shadow-md disabled:opacity-50 sm:w-auto"
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
