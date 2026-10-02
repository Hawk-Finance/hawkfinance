"use client";

import { useEffect, useRef, useState } from "react";
import { shortAddress } from "@/lib/protocol/format";
import { useWallet } from "@/lib/wallet";

export function WalletButton() {
  const wallet = useWallet();
  const [open, setOpen] = useState(false);
  const [previewPrompt, setPreviewPrompt] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) {
        setOpen(false);
        setPreviewPrompt(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setPreviewPrompt(false);
      }
    }
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const label =
    wallet.status === "connecting"
      ? "Connecting"
      : wallet.status === "wrong-network"
        ? "Switch to Robinhood Chain"
        : wallet.status === "connected" && wallet.address
          ? shortAddress(wallet.address)
          : "Connect Wallet";

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => {
          if (wallet.status === "connecting") return;
          if (wallet.status === "wrong-network") {
            void wallet.switchChain();
            return;
          }
          if (wallet.status === "connected") {
            setPreviewPrompt(false);
            setOpen((value) => !value);
            return;
          }
          void wallet.connect().then((result) => {
            if (result === "no-wallet") setPreviewPrompt(true);
          });
        }}
        className="inline-flex items-center gap-2 rounded-full border border-[rgba(241,240,234,0.12)] bg-[#10211c] px-3 py-1.5 text-[13px] text-ivory transition-colors duration-200 hover:border-[rgba(241,240,234,0.28)]"
      >
        {wallet.status === "connected" ? <span className="h-1.5 w-1.5 rounded-full bg-lime" /> : null}
        {label}
      </button>

      {previewPrompt ? (
        <div className="absolute right-0 z-50 mt-2 w-[280px] border border-line bg-canvas-2 p-4">
          <p className="text-[14px] text-ivory">No wallet detected.</p>
          <p className="mt-2 text-[13px] leading-relaxed text-secondary">
            Hawk reads Robinhood Chain through a browser wallet. You can explore the interface with a preview address.
          </p>
          <button
            type="button"
            onClick={() => {
              wallet.startPreview();
              setPreviewPrompt(false);
            }}
            className="mt-4 w-full bg-lime px-3 py-2.5 text-[13px] font-medium text-canvas"
          >
            Continue with preview
          </button>
        </div>
      ) : null}

      {open && wallet.address ? (
        <div className="absolute right-0 z-50 mt-2 w-[240px] border border-line bg-canvas-2 p-4">
          <p className="text-[11px] tracking-[0.16em] text-muted">
            {wallet.preview ? "PREVIEW" : wallet.hawk ? "HAWK WALLET" : "CONNECTED"}
          </p>
          <p className="mt-2 text-[13px] break-all text-ivory">{shortAddress(wallet.address)}</p>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(wallet.address ?? "");
            }}
            className="mt-4 block text-[13px] text-secondary transition-colors duration-200 hover:text-ivory"
          >
            Copy address
          </button>
          <button
            type="button"
            onClick={() => {
              wallet.disconnect();
              setOpen(false);
            }}
            className="mt-2 block text-[13px] text-secondary transition-colors duration-200 hover:text-ivory"
          >
            Disconnect
          </button>
        </div>
      ) : null}
    </div>
  );
}
