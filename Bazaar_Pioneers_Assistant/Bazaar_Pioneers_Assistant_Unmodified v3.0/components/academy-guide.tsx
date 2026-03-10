"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, ChevronDown, ChevronUp, MapPin, Cpu, Users, Globe } from "lucide-react";

type Lesson = {
  id: string;
  icon: React.ReactNode;
  title: string;
  tag: string;
  content: string;
};

const lessons: Lesson[] = [
  {
    id: "mainnet",
    icon: <Cpu className="h-4 w-4 text-primary" />,
    title: "What is Bazaar Mainnet?",
    tag: "CORE",
    content:
      "Bazaar Mainnet is the live, decentralized trade layer built on Pi Network. It replaces the Testnet environment with real Pi transactions. The 10/10 Readiness Score means your community has fulfilled all ten criteria — from KYC to PQS audits — required to operate as a fully sovereign DAO node on the Pi Mainnet.",
  },
  {
    id: "jdrive",
    icon: <Globe className="h-4 w-4 text-primary" />,
    title: "The J: Drive Ledger",
    tag: "LEDGER",
    content:
      "The J: Drive is the community-maintained decentralized ledger for Project Bazaar. Every verified merchant transaction, Pioneer identity confirmation, and governance vote is recorded here. Unlike centralized cloud storage, the J: Drive is distributed across E-Network nodes, making it tamper-resistant and community-owned. Think of it as your DAO's hard-coded memory.",
  },
  {
    id: "bridge",
    icon: <MapPin className="h-4 w-4 text-primary" />,
    title: "The bulacan.pi Bridge",
    tag: "BRIDGE",
    content:
      "bulacan.pi is the geographic namespace for the Bulacan province on the Pi Network. The Bridge maps real-world physical merchants, utilities, and assets to their corresponding digital E-Network counterparts. When a merchant is listed on the bulacan.pi Bridge, they gain access to Pi-based payments, DAO governance rights, and PQS certification — bridging physical commerce with digital sovereignty.",
  },
  {
    id: "consensus",
    icon: <Users className="h-4 w-4 text-primary" />,
    title: "Community Consensus & DAO Roles",
    tag: "GOVERNANCE",
    content:
      "The Bazaar DAO operates through three roles: the Council of Elders (governance and PQS audits), Merchants (inventory and trade), and Regular Pioneers (consumer access and voting). Consensus is achieved when a majority of active Pioneers vote on a proposal. All decisions are recorded on the J: Drive Ledger. PinoyQ8, the Bazaar Founder, holds Founder Protocol — the highest trust level in the system.",
  },
];

export function AcademyGuide() {
  const [openId, setOpenId] = useState<string | null>("mainnet");

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Bazaar Academy</CardTitle>
            <CardDescription>ENLIGHTEN Protocol — Pioneer education modules</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {lessons.map((lesson) => {
          const isOpen = openId === lesson.id;
          return (
            <div
              key={lesson.id}
              className="overflow-hidden rounded-lg border border-border/50 bg-background/40"
            >
              <Button
                variant="ghost"
                className="flex h-auto w-full items-center justify-between rounded-none px-3 py-3 text-left hover:bg-primary/5"
                onClick={() => setOpenId(isOpen ? null : lesson.id)}
              >
                <div className="flex items-center gap-2.5">
                  <div className="rounded-md bg-primary/10 p-1">{lesson.icon}</div>
                  <span className="text-sm font-semibold">{lesson.title}</span>
                  <Badge variant="outline" className="hidden border-primary/30 font-mono text-[10px] sm:flex">
                    {lesson.tag}
                  </Badge>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </Button>
              {isOpen && (
                <div className="border-t border-border/40 px-3 pb-3 pt-2.5">
                  <p className="text-xs leading-relaxed text-foreground/80">{lesson.content}</p>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
