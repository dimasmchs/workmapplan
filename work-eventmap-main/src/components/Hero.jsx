import { Link } from "react-router-dom";
import { MapPin, Radio, ArrowRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-5 py-16">
      {/* Animated gradient mesh */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="mesh-blob animate-mesh-1" style={{ width: "34rem", height: "34rem", top: "-10%", left: "-8%", background: "hsl(198 89% 28%)" }} />
        <div className="mesh-blob animate-mesh-2" style={{ width: "30rem", height: "30rem", bottom: "-12%", right: "-10%", background: "hsl(196 100% 44%)" }} />
        <div className="mesh-blob animate-mesh-3" style={{ width: "24rem", height: "24rem", top: "28%", right: "18%", background: "hsl(198 70% 55%)" }} />
        <div className="mesh-blob animate-mesh-1" style={{ width: "20rem", height: "20rem", bottom: "8%", left: "12%", background: "hsl(190 85% 60%)" }} />
      </div>
      {/* Faint grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(198 89% 18%) 1px, transparent 1px), linear-gradient(90deg, hsl(198 89% 18%) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/70 px-3.5 py-1.5 backdrop-blur">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
            <MapPin size={13} />
          </span>
          <span className="tag-label">PCU Dasmariñas</span>
        </div>

        <h1 className="font-heading text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Your campus, <span className="text-accent">clearly mapped.</span>
        </h1>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Browse facilities, see what's happening live, and never miss an event at Philippine Christian University — Dasmariñas.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Link to="/directory">
            <Button className="h-12 px-7 text-sm font-semibold">
              Browse Directory <ArrowRight size={16} className="ml-1.5" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" className="h-12 px-7 text-sm font-semibold">
              <LogIn size={16} className="mr-1.5" /> Admin Sign In
            </Button>
          </Link>
        </div>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3.5 py-1.5 text-sm">
          <Radio size={14} className="animate-pulse text-accent" />
          <span className="font-semibold text-accent">Live</span>
          <span className="text-muted-foreground">campus activity tracking</span>
        </div>
      </div>
    </section>
  );
}