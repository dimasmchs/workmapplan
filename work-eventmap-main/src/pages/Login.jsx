import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, MapPin, Radio, ArrowRight } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Post-login destination (?returnTo=). Same-origin paths only.
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.auth.loginViaEmailPassword(email, password);
      window.location.href = returnTo;
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    api.auth.loginWithProvider("google", returnTo);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background md:flex-row">
      {/* Visual panel */}
      <aside className="relative isolate hidden overflow-hidden bg-primary md:block md:w-1/2">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-24 h-80 w-80 rounded-full bg-accent/30 blur-3xl animate-mesh-1" />
          <div className="absolute -bottom-24 -right-16 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-mesh-2" />
          <div className="absolute left-1/3 top-1/2 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl animate-mesh-3" />
        </div>
        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-primary-foreground">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
              <MapPin size={20} />
            </span>
            <div className="leading-tight">
              <p className="tag-label text-white/70">PCU Dasmariñas</p>
              <p className="text-sm font-semibold">Campus Compass</p>
            </div>
          </div>

          <div>
            <h2 className="font-heading text-3xl font-semibold leading-tight tracking-tight">
              Welcome back to your campus directory.
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/80">
              Manage facilities, schedule activities, and keep the campus in sync — all in one place.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm">
              <Radio size={14} className="animate-pulse" /> Live activity tracking
            </div>
          </div>

          <p className="text-xs text-white/60">Philippine Christian University — Dasmariñas</p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 items-center justify-center px-5 py-12 md:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile brand header */}
          <div className="mb-6 flex items-center gap-2.5 md:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <MapPin size={20} />
            </span>
            <div className="leading-tight">
              <p className="tag-label">PCU Dasmariñas</p>
              <p className="text-sm font-semibold text-foreground">Campus Compass</p>
            </div>
          </div>

          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Log in to manage your campus directory.</p>

          <Button variant="outline" className="mt-6 h-12 w-full text-sm font-medium" onClick={handleGoogle}>
            <GoogleIcon className="mr-2 h-5 w-5" /> Continue with Google
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">or</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="h-12 w-full font-medium" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Log in <ArrowRight size={16} className="ml-1.5" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
              className="font-medium text-primary hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}