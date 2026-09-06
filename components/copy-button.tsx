"use client";
import { Check, Copy } from "lucide-react";
import { copyText } from "@/lib/copy-text";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyButton({ text, label = "Copy prompt" }: { text: string; label?: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function copy() {
    try {
      await copyText(text);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");

    }
  }

  const copied = status === "copied";
  return (
    <Button onClick={copy} className={copied ? "copy-button copied" : "copy-button"} aria-live="polite">
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {copied ? "Copied" : status === "error" ? "Copy failed — select it manually" : label}
    </Button>
  );
}
