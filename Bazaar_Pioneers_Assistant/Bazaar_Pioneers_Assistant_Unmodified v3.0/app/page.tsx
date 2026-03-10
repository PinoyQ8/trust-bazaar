"use client";

import { usePiAuth } from "@/contexts/pi-auth-context";
import { GovernancePanel } from "@/components/governance-panel";
import { NetworkStatus } from "@/components/network-status";
import { MainnetReadiness } from "@/components/mainnet-readiness";
import { AcademyGuide } from "@/components/academy-guide";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink, MapPin, User } from "lucide-react";

export default function HomePage() {
  const { userData } = usePiAuth();

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-md space-y-4 p-4 pb-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-none text-balance">
                  Bazaar Pioneers
                </h1>
                <p className="text-sm text-muted-foreground">Academy & DAO Gateway</p>
              </div>
            </div>
            <Badge variant="outline" className="border-primary/30 bg-primary/5 font-mono">
              ENLIGHTEN v1.0
            </Badge>
          </div>

          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <p className="text-xs leading-relaxed text-foreground/90 text-balance">
              Chief Archivist & Academy Guide — ENLIGHTEN Protocol active. Educating Pioneers on
              Bazaar Mainnet readiness, community consensus, and bulacan.pi sovereignty.
            </p>
          </div>
        </div>

        {/* User Card */}
        {userData && (
          <Card className="border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Pioneer Status</CardTitle>
                  <CardDescription className="text-xs">@{userData.username}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-3">
                <span className="text-sm text-muted-foreground">Credits Balance</span>
                <span className="font-mono text-lg font-bold text-primary">
                  {userData.credits_balance} π
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-3">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="default" className="bg-accent text-accent-foreground">
                  VERIFIED
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Network Status */}
        <NetworkStatus />

        {/* Mainnet 10/10 Readiness */}
        <MainnetReadiness />

        {/* Academy Guide */}
        <AcademyGuide />

        {/* Governance Panel */}
        <GovernancePanel />

        {/* Official Resources */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Official Resources</CardTitle>
            <CardDescription>Verified Bazaar DAO links — Architect: PinoyQ8</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="https://github.com/PinoyQ8/pinoyq8.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-3 rounded-lg border border-border/50 bg-background/50 p-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="rounded-md bg-primary/10 p-1.5">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-semibold">GitHub Repo & README</span>
                <span className="text-xs text-muted-foreground">Source code & documentation</span>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
            <a
              href="https://bazaarmainnet-dao.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-3 rounded-lg border border-border/50 bg-background/50 p-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="rounded-md bg-accent/10 p-1.5">
                <MapPin className="h-4 w-4 text-accent" />
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-semibold">Mainnet Vault UI</span>
                <span className="text-xs text-muted-foreground">bazaarmainnet-dao.vercel.app</span>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="rounded-lg border border-border/50 bg-muted/50 p-3 text-center">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">X570-Taichi Master Node</span>
            {" — "}
            Architect: PinoyQ8
            <br />
            bulacan.pi sovereignty secured. ENLIGHTEN Protocol active.
          </p>
        </div>
      </main>
    </div>
  );
}
