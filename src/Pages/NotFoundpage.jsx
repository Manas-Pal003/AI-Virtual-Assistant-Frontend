

import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Home,
  Search,
} from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10 dark:bg-black">
      <div className="w-full max-w-[720px] text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-50 text-orange-600 dark:bg-amber-500/10 dark:text-amber-400">
          <AlertTriangle className="h-10 w-10" />
        </div>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
            404 Error
          </p>

          <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950 dark:text-white md:text-7xl">
            Page Not Found
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-500 dark:text-slate-400">
            The page you are looking for does not exist, may have been moved,
            or the URL is incorrect.
          </p>
        </div>

        <div className="mt-10 gap-4 sm:grid-cols-3 flex justify-center">
          <Link
            to="/login"
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-white/5 dark:bg-zinc-900/50"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-violet-500/10 dark:text-violet-400">
              <Home className="h-5 w-5" />
            </div>

            <h3 className="font-semibold text-slate-950 dark:text-white">
              Login
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Return to auth page
            </p>
          </Link>

          <Link
            to="/register"
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-white/5 dark:bg-zinc-900/50"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-amber-500/10 dark:text-amber-400">
              <Search className="h-5 w-5" />
            </div>

            <h3 className="font-semibold text-slate-950 dark:text-white">
              Register
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Create a new account
            </p>
          </Link>
        </div>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            className="h-11 px-4 py-2 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 hover:bg-slate-100 transition-colors"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </button>

          <button
            className="h-11 px-4 py-2 inline-flex items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            onClick={() => navigate("/login")}
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Login
          </button>
        </div>
      </div>
    </main>
  );
}