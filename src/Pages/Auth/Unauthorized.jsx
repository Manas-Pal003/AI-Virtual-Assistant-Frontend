// src/Pages/Unauthorized.tsx

import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  LockKeyhole,
  ShieldAlert,
  ShieldX,
} from "lucide-react";

const Unauthorized = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-white">
      {/* Background Effects */}
      <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-blue-500/30 blur-3xl" />
      <div className="absolute bottom-[-140px] right-[-140px] h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/10 blur-3xl" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:42px_42px]" />

      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.05] text-white shadow-2xl backdrop-blur-xl">
        <div className="absolute right-[-80px] top-[-80px] h-56 w-56 rounded-full bg-red-500/20 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[-80px] h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center px-6 pt-10 text-center md:px-12">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[30px] border border-red-400/20 bg-red-500/10 shadow-xl shadow-red-500/10">
            <ShieldX className="h-12 w-12 text-red-300" />
          </div>

          <div className="mb-4 inline-flex items-center rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10">
            <ShieldAlert className="mr-2 h-4 w-4" />
            Access Denied
          </div>

          <h1 className="max-w-2xl text-4xl font-black tracking-tight md:text-6xl">
            Unauthorized Access
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            You do not have permission to view this page. This area may be
            restricted to admin users or users with a higher access level.
          </p>
        </div>

        <div className="relative z-10 px-6 pb-10 pt-6 md:px-12 md:pt-8">
          <div className="mx-auto mt-4 grid max-w-2xl gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-center">
              <LockKeyhole className="mx-auto mb-3 h-6 w-6 text-red-300" />
              <h3 className="text-sm font-bold">Restricted Route</h3>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                This page is protected by role-based access.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-center">
              <ShieldAlert className="mx-auto mb-3 h-6 w-6 text-yellow-300" />
              <h3 className="text-sm font-bold">Permission Required</h3>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Admin or authorized access is required.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-center">
              <Home className="mx-auto mb-3 h-6 w-6 text-cyan-300" />
              <h3 className="text-sm font-bold">Return Safely</h3>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Go back to your dashboard or login again.
              </p>
            </div>
          </div>

          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-7 py-4 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-cyan-600"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-7 py-4 font-bold text-white transition-all hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </div>

          <p className="mx-auto mt-7 max-w-xl text-center text-sm leading-6 text-slate-500">
            If you believe this is a mistake, contact the system administrator
            or check your account role and permissions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;