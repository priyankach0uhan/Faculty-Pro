"use client";

import { useState } from "react";
import { loginAction, handlePasswordResetAction } from "./action"; 

export function LoginForm() {
  // UI Tabs & Views State
  const [activeTab, setActiveTab] = useState<"admin" | "staff">("admin");
  const [view, setView] = useState<"login" | "forgot" | "reset">("login");
  
  // Form Inputs State
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (view === "login") {
      const result = await loginAction({ identifier, password, portalType: activeTab });
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } else if (view === "forgot") {
      // Direct pass to the reset view if user exists
      setView("reset");
      setLoading(false);
    } else if (view === "reset") {
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      const result = await handlePasswordResetAction(identifier, newPassword);
      if (result?.success) {
        setSuccess("Password updated successfully in database! Try logging in.");
        setView("login");
        setPassword("");
      } else {
        setError(result?.error || "Reset failed.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. ORIGINAL PORTAL TAB SWITCHER (Only visible during standard login view) */}
      {view === "login" && (
        <div className="flex bg-[#FAF9F6] p-1 rounded-2xl border border-[#F5F1EA]">
          <button
            type="button"
            onClick={() => { setActiveTab("admin"); setError(""); }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
              activeTab === "admin" ? "bg-white text-[#2D2D2D] shadow-sm" : "text-gray-400"
            }`}
          >
            Admin Portal
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("staff"); setError(""); }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
              activeTab === "staff" ? "bg-white text-[#2D2D2D] shadow-sm" : "text-gray-400"
            }`}
          >
            Staff Portal
          </button>
        </div>
      )}

      {/* STATUS ALERTS */}
      {error && <div className="p-4 text-xs bg-red-50 border border-red-100 text-red-600 rounded-xl font-bold">{error}</div>}
      {success && <div className="p-4 text-xs bg-green-50 border border-green-100 text-green-700 rounded-xl font-bold">{success}</div>}

      {/* CORE DYNAMIC FORM VIEW */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {view === "login" && (
          <>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Email Address or ID</label>
              <input
                type="text"
                placeholder={activeTab === "admin" ? "admin@institution.edu" : "e.g., FAC-703 or MGT-020"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full p-4 bg-[#FAF9F6] border border-[#F5F1EA] rounded-xl text-xs font-bold outline-none focus:border-[#7A8F66]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-[#FAF9F6] border border-[#F5F1EA] rounded-xl text-xs font-bold outline-none focus:border-[#7A8F66]"
                required
              />
            </div>
            <div className="text-right px-1">
              <button
                type="button"
                onClick={() => { setView("forgot"); setError(""); }}
                className="text-[10px] font-black text-gray-400 hover:text-[#7A8F66] uppercase tracking-widest transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#7A8F66] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#6b7d5a] transition-all disabled:opacity-50"
            >
              {loading ? "Verifying Access..." : `Sign In as ${activeTab}`}
            </button>
          </>
        )}

        {view === "forgot" && (
          <>
            <div>
              <h3 className="text-sm font-black text-[#2D2D2D] mb-1">Account Password Recovery</h3>
              <p className="text-[10px] text-gray-400 font-bold mb-4">Provide your profile Email or unique Employee ID to initialize reset.</p>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Verification Identifier</label>
              <input
                type="text"
                placeholder="Enter Email or Employee ID..."
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full p-4 bg-[#FAF9F6] border border-[#F5F1EA] rounded-xl text-xs font-bold outline-none"
                required
              />
            </div>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={() => setView("login")}
                className="flex-1 py-4 bg-gray-100 text-gray-500 text-xs font-black uppercase tracking-widest rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-4 bg-[#2D2D2D] text-white text-xs font-black uppercase tracking-widest rounded-xl"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {view === "reset" && (
          <>
            <div>
              <h3 className="text-sm font-black text-[#2D2D2D] mb-1">Setup New Password</h3>
              <p className="text-[10px] text-gray-400 font-bold mb-4">Modifying authentication access parameters for: <span className="font-mono text-[#9B7E5A]">{identifier}</span></p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-4 bg-[#FAF9F6] border border-[#F5F1EA] rounded-xl text-xs font-bold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-4 bg-[#FAF9F6] border border-[#F5F1EA] rounded-xl text-xs font-bold outline-none"
                    required
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-[#7A8F66] text-white text-xs font-black uppercase tracking-widest rounded-xl mt-2"
            >
              Update Password & Save
            </button>
          </>
        )}
      </form>
    </div>
  );
}
