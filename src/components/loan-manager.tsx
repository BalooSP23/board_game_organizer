"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Loan {
  id: string;
  borrowerName: string;
  loanDate: string;
  returnDate: string | null;
  notes: string | null;
}

interface LoanManagerProps {
  gameId: string;
  initialLoans: Loan[];
}

export function LoanManager({ gameId, initialLoans }: LoanManagerProps) {
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [borrower, setBorrower] = useState("");
  const [saving, setSaving] = useState(false);

  const activeLoans = loans.filter((l) => !l.returnDate);
  const pastLoans = loans.filter((l) => l.returnDate);

  async function addLoan(e: React.FormEvent) {
    e.preventDefault();
    if (!borrower.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/games/${gameId}/loans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ borrowerName: borrower.trim() }),
      });
      if (res.ok) {
        const loan = await res.json();
        setLoans([loan, ...loans]);
        setBorrower("");
      }
    } finally {
      setSaving(false);
    }
  }

  async function returnLoan(loanId: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/games/${gameId}/loans`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loanId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setLoans(loans.map((l) => (l.id === loanId ? updated : l)));
      }
    } finally {
      setSaving(false);
    }
  }

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Prêts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active loans */}
        {activeLoans.length > 0 && (
          <ul className="space-y-2">
            {activeLoans.map((loan) => (
              <li
                key={loan.id}
                className="flex items-center justify-between rounded-md border p-2 text-sm"
              >
                <div>
                  <span className="font-medium">
                    Emprunté par {loan.borrowerName}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    Depuis le {fmtDate(loan.loanDate)}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => returnLoan(loan.id)}
                  disabled={saving}
                >
                  Marquer comme rendu
                </Button>
              </li>
            ))}
          </ul>
        )}

        {/* Add loan form */}
        <form onSubmit={addLoan} className="flex gap-2">
          <Input
            placeholder="Nouveau prêt — nom de l'emprunteur"
            value={borrower}
            onChange={(e) => setBorrower(e.target.value)}
            className="h-8 text-sm"
          />
          <Button type="submit" size="sm" disabled={saving || !borrower.trim()}>
            Prêter
          </Button>
        </form>

        {/* Past loans */}
        {pastLoans.length > 0 && (
          <div className="space-y-1 pt-2 border-t">
            <p className="text-xs text-muted-foreground font-medium">
              Historique
            </p>
            {pastLoans.map((loan) => (
              <div
                key={loan.id}
                className="text-xs text-muted-foreground flex gap-2"
              >
                <span>{loan.borrowerName}</span>
                <span>— Depuis le {fmtDate(loan.loanDate)}</span>
                <span>— Rendu le {fmtDate(loan.returnDate!)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
