"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export interface ProposedMove {
  gameId: string;
  gameName: string;
  fromLabel: string;
  toLabel: string;
}

export interface NewPlacement {
  gameId: string;
  gameName: string;
  toLabel: string;
}

interface ReorganizationProposalProps {
  open: boolean;
  onClose: () => void;
  onApply: () => void;
  applying: boolean;
  moves: ProposedMove[];
  added: NewPlacement[];
  unplaceable: { gameId: string; gameName: string; reason: string }[];
}

export function ReorganizationProposal({
  open,
  onClose,
  onApply,
  applying,
  moves,
  added,
  unplaceable,
}: ReorganizationProposalProps) {
  const hasChanges = moves.length > 0 || added.length > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Proposition de réorganisation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
          {!hasChanges && unplaceable.length === 0 && (
            <p className="text-gray-500 text-sm">Aucun changement nécessaire.</p>
          )}

          {added.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-green-800 mb-1">
                Nouveaux placements
              </h4>
              <ul className="space-y-1">
                {added.map((a) => (
                  <li
                    key={a.gameId}
                    className="text-sm bg-green-50 border border-green-200 rounded px-2 py-1"
                  >
                    <span className="font-medium">{a.gameName}</span> → {a.toLabel}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {moves.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-blue-800 mb-1">
                Déplacements nécessaires
              </h4>
              <ul className="space-y-1">
                {moves.map((m) => (
                  <li
                    key={m.gameId}
                    className="text-sm bg-blue-50 border border-blue-200 rounded px-2 py-1"
                  >
                    <span className="font-medium">{m.gameName}</span>{" "}
                    {m.fromLabel} → {m.toLabel}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {unplaceable.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-orange-800 mb-1">
                Impossible à placer
              </h4>
              <ul className="space-y-1">
                {unplaceable.map((u) => (
                  <li
                    key={u.gameId}
                    className="text-sm bg-orange-50 border border-orange-200 rounded px-2 py-1"
                  >
                    <span className="font-medium">{u.gameName}</span> — {u.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={applying}>
            Ignorer
          </Button>
          {hasChanges && (
            <Button
              onClick={onApply}
              disabled={applying}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {applying ? "Application…" : "Appliquer"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
