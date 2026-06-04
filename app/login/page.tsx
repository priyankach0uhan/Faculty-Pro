import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] p-4">
      <div className="w-full max-w-md p-5 sm:p-8 bg-white rounded-xl shadow-lg border border-[#F5F1EA]">
        <h1 className="text-xl sm:text-2xl font-bold text-[#2D2D2D] mb-6 text-center">
          Faculty Management Portal
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
