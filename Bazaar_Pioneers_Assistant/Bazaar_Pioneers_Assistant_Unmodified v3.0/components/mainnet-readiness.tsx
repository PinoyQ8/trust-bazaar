"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, HardDrive, Layers } from "lucide-react";

type ReadinessItem = {
  id: number;
  label: string;
  description: string;
  complete: boolean;
};

const readinessChecklist: ReadinessItem[] = [
  { id: 1, label: "KYC Compliance", description: "Pioneer identity verified on Pi Network", complete: true },
  { id: 2, label: "Wallet Activation", description: "Mainnet wallet linked and funded", complete: true },
  { id: 3, label: "Merchant Registry", description: "At least one PQS-compliant merchant listed", complete: true },
  { id: 4, label: "bulacan.pi Mapping", description: "Physical asset bridged to E-Network", complete: true },
  { id: 5, label: "DAO Participation", description: "Voted on at least one governance proposal", complete: true },
  { id: 6, label: "J: Drive Ledger", description: "Community ledger entry confirmed", complete: true },
  { id: 7, label: "Consensus Node", description: "Node contributing to network consensus", complete: false },
  { id: 8, label: "PQS Audit Pass", description: "Zero-Harm audit cleared by Council of Elders", complete: false },
  { id: 9, label: "E-Network Sync", description: "100% synchronization with live nodes", complete: true },
  { id: 10, label: "Mainnet Migration", description: "Assets migrated from Testnet to Mainnet", complete: false },
];

export function MainnetReadiness() {
  const completed = readinessChecklist.filter((i) => i.complete).length;
  const total = readinessChecklist.length;
  const percent = Math.round((completed / total) * 100);

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Mainnet 10/10 Readiness</CardTitle>
            <CardDescription>Bazaar DAO community consensus tracker</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Readiness Score</span>
            <Badge variant="outline" className="border-primary/40 font-mono text-primary">
              {completed}/{total}
            </Badge>
          </div>
          <Progress value={percent} className="h-2.5" />
          <p className="mt-2 text-xs text-muted-foreground">
            {percent}% complete — {total - completed} criteria remaining for full Mainnet readiness
          </p>
        </div>

        {/* J: Drive Ledger Note */}
        <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/5 p-2.5">
          <HardDrive className="h-4 w-4 shrink-0 text-accent" />
          <p className="text-xs text-foreground/90">
            <span className="font-semibold">J: Drive Ledger:</span> Community consensus records stored
            on the decentralized J: Drive node. All merchant entries are immutable once confirmed.
          </p>
        </div>

        {/* Checklist */}
        <div className="space-y-1.5">
          {readinessChecklist.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg border border-border/40 bg-background/40 p-2.5"
            >
              {item.complete ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
              )}
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium leading-none">{item.label}</p>
                  <span className="font-mono text-[10px] text-muted-foreground">#{item.id}</span>
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
