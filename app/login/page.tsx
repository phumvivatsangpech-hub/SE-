"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border bg-background p-8 shadow-2xl">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl"></div>
        
        <div className="relative flex flex-col items-center space-y-6 text-center z-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
            <span className="text-3xl">🎵</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">เข้าสู่ระบบ</h1>
            <p className="text-sm text-muted-foreground">
              ระบบจองห้องซ้อมดนตรี มหาวิทยาลัยบูรพา วิทยาเขตจันทบุรี
            </p>
          </div>
          
          <div className="w-full rounded-md bg-yellow-500/10 p-3 text-xs text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
            จำกัดเฉพาะอีเมล <strong>@go.buu.ac.th</strong> เท่านั้น
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            disabled={status === "loading"}
            className="group flex w-full items-center justify-center gap-3 rounded-xl border bg-background px-4 py-3 text-sm font-medium shadow-sm transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 transition-transform group-hover:scale-110" aria-hidden="true">
              <path
                d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                fill="#EA4335"
              />
              <path
                d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                fill="#4285F4"
              />
              <path
                d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                fill="#FBBC05"
              />
              <path
                d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                fill="#34A853"
              />
            </svg>
            <span className="font-semibold">เข้าสู่ระบบด้วย Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}