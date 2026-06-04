import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 selection:bg-[#7A8F66]/10">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-[2.5rem] border border-[#F5F1EA] shadow-sm">
        {/* Decorative Brand Icon */}
        <div className="mx-auto w-14 h-14 bg-[#7A8F66] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md rotate-3">
          F
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-[#2D2D2D] tracking-tight">FACULTY PRO</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Enterprise Management Suite
          </p>
        </div>

        <p className="text-sm text-gray-500 font-medium leading-relaxed">
          Welcome to the unified campus operational hub. Please log in to securely access your workspace panel.
        </p>

        <div className="pt-2">
          <Link 
            href="/login" 
            className="block w-full py-4 bg-[#7A8F66] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#7A8F66]/20 hover:bg-[#6b7d5a] hover:scale-[1.01] active:scale-[0.99] transition-all duration-150"
          >
            Enter Portal Workspace
          </Link>
        </div>
      </div>

      <footer className="mt-8 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        Campus Network Sync Active • v4.2.1
      </footer>
    </div>
  );
}