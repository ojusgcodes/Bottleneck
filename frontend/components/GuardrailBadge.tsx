"use client";

import { ExplainResult } from "@/lib/types";

interface Props {
  result: ExplainResult | null;
  loading: boolean;
}

export default function GuardrailBadge({ result, loading }: Props) {
  return (
    <div className="bg-bdark text-white rounded-lg p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-mono font-bold tracking-widest text-bcoral uppercase">
          Anti-fabrication guardrail
        </div>
        {result && (
          <div
            className={`text-xs font-mono px-2 py-1 rounded ${
              result.numbers_verified ? "bg-bsuccess" : "bg-bamber"
            }`}
          >
            {result.numbers_verified
              ? "0 fabricated"
              : `${result.numbers_removed.length} removed`}
          </div>
        )}
      </div>

      {loading && <div className="text-sm text-gray-300">Generating explanation…</div>}

      {result && !loading && (
        <>
          <p className="text-sm italic text-gray-100">"{result.explanation}"</p>
          {result.numbers_removed.length > 0 && (
            <p className="text-xs text-bamber mt-2">
              Stripped before display: {result.numbers_removed.join(", ")}
            </p>
          )}
          <p className="text-[10px] text-gray-400 mt-2">
            source: {result.source === "llm" ? "AI (guardrail-checked)" : "offline template (no LLM configured)"}
          </p>
        </>
      )}
    </div>
  );
}
