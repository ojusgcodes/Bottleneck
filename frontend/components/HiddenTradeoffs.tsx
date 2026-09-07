"use client";

import { TradeoffFinding } from "@/lib/types";

interface Props {
  findings: TradeoffFinding[];
  loading: boolean;
}

export default function HiddenTradeoffs({ findings, loading }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="text-xs font-mono font-bold tracking-widest text-bsuccess uppercase mb-1">
        4 · Hidden Trade-offs
      </div>
      <h2 className="text-xl font-bold text-bprimary mb-1">What You Didn't Ask About</h2>
      <p className="text-sm text-gray-500 mb-4">
        The engine compares every stage automatically and flags what stands out.
      </p>

      {loading && <div className="text-sm text-gray-400">Scanning for trade-offs…</div>}

      {!loading && findings.length === 0 && (
        <div className="text-sm text-gray-400">No hidden trade-offs found in this configuration.</div>
      )}

      <div className="space-y-2">
        {findings.map((f, i) => (
          <div key={i} className="flex gap-3 bg-green-50 border border-bsuccess/30 rounded px-4 py-3">
            <span className="text-bsuccess font-bold">⚠</span>
            <p className="text-sm text-gray-700">{f.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
