"use client";

import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";

interface RequestChangeModalProps {
  employeeId: string;
  facultyName: string;
}

export default function RequestChangeModal({ employeeId, facultyName }: RequestChangeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false); // New state to manage success UI view context

  // Form State parameters
  const [targetDate, setTargetDate] = useState("");
  const [desiredStatus, setDesiredStatus] = useState("Present");
  const [reason, setReason] = useState("");

  const handleOpenModal = () => {
    setIsSent(false); // Reset view context on clear trigger toggle click
    setTargetDate("");
    setReason("");
    setIsOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Replace this mock timeout with your actual Supabase / Server Action call:
      // await submitCorrectionRequest({ employeeId, facultyName, targetDate, desiredStatus, reason });
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // ❌ REMOVED: alert("Request submitted successfully to Administration!");
      setIsSent(true); // ✅ ADDED: Instantly toggles the inline "Sent UI" layout step context
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger Open Element */}
      <button
        onClick={handleOpenModal}
        className="px-5 py-3 bg-[#2D2D2D] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-[0.98]"
      >
        Request Calendar Correction
      </button>

      {/* Modal View overlay wrapper background frame */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] border border-[#F5F1EA] shadow-2xl overflow-hidden relative p-8 transition-all">
            
            {/* Direct Close Icon Anchor */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-6 top-6 p-1 text-gray-400 hover:text-[#2D2D2D] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* CONDITIONAL RENDERING CONTEXT ENGINE STEP */}
            {!isSent ? (
              /* --- STATE A: THE FORM LAYOUT PANEL STEP --- */
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div>
                  <h3 className="font-black text-[#2D2D2D] text-lg uppercase tracking-tight">Correction Request</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Submit adjustment parameter files to admin</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Target Date</label>
                    <input
                      type="date"
                      required
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full p-4 bg-[#FAF9F6] border border-[#F5F1EA] rounded-2xl text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Desired Status</label>
                    <select
                      value={desiredStatus}
                      onChange={(e) => setDesiredStatus(e.target.value)}
                      className="w-full p-4 bg-[#FAF9F6] border border-[#F5F1EA] rounded-2xl text-xs font-bold focus:outline-none"
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Half Day">Half Day</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Reason / Explanation</label>
                    <textarea
                      required
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="State explicit diagnostic logic for metric override context..."
                      className="w-full p-4 bg-[#FAF9F6] border border-[#F5F1EA] rounded-2xl text-xs font-medium focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all ${
                    isSubmitting 
                      ? "bg-gray-300 cursor-not-allowed text-gray-500" 
                      : "bg-[#7A8F66] shadow-xl shadow-[#7A8F66]/20 hover:scale-[1.01]"
                  }`}
                >
                  {isSubmitting ? "Submitting Request..." : "Submit Amendment Request"}
                </button>
              </form>
            ) : (
              /* --- STATE B: THE LIVE INLINE SENT UI SUCCESS CONTEXT STEP --- */
              <div className="text-center py-6 space-y-6 flex flex-col items-center justify-center animate-scale-in">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center border border-green-100 text-[#7A8F66]">
                  <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-black text-[#2D2D2D] text-lg tracking-tight uppercase">Filing Transmitted</h4>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed font-medium">
                    Your correction context log has been queued to the executive roster dashboard. Changes display immediately upon administrative override execution.
                  </p>
                </div>

                <div className="pt-2 w-full">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full py-3.5 bg-[#2D2D2D] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                  >
                    Dismiss Console
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}