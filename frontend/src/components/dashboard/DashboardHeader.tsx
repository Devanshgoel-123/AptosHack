import React, { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

interface DashboardHeaderProps {
  onAddWallet?: (account: any) => void;
}

export default function DashboardHeader({ onAddWallet }: DashboardHeaderProps) {
  const [account, setAccount] = useState<any | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Normalize result from aptos.connect()
  const normalize = (res: any) => {
    if (!res) return null;
    if (typeof res === "string") return { address: res };
    if (typeof res === "object" && res.address) return res;
    // fallback — try to extract a string
    return { address: String(res) };
  };

  const connectPetra = async () => {
    const aptos = (window as any).aptos;
    if (!aptos) {
      alert("Petra Wallet not found. Install the Petra Chrome extension.");
      return;
    }

    try {
      setConnecting(true);
      const res = await aptos.connect(); // opens Petra popup
      const acc = normalize(res);
      setAccount(acc);
      if (onAddWallet) onAddWallet(acc);
    } catch (err) {
      console.error("Petra connect error:", err);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectPetra = async () => {
    try {
      const aptos = (window as any).aptos;
      if (aptos?.disconnect) await aptos.disconnect();
    } catch (err) {
      console.error("Petra disconnect error:", err);
    } finally {
      setAccount(null);
      if (onAddWallet) onAddWallet(null);
    }
  };

  // Optional: try to listen for account changes (best-effort)
  useEffect(() => {
    const aptos = (window as any).aptos;
    if (!aptos) return;

    const onAccountChanged = (payload: any) => {
      // Petra implementations may provide address string or object
      const acc = normalize(payload);
      setAccount(acc);
      if (onAddWallet) onAddWallet(acc);
    };

    try {
      if (typeof aptos.on === "function") {
        aptos.on("accountChanged", onAccountChanged);
      } else if (typeof window.addEventListener === "function") {
        // some extensions might dispatch a custom event
        window.addEventListener("aptos#accountChanged", (e: any) => onAccountChanged(e?.detail));
      }
    } catch (e) {
      // ignore if not supported
    }

    return () => {
      try {
        if (typeof aptos?.off === "function") {
          aptos.off("accountChanged", onAccountChanged);
        } else {
          window.removeEventListener("aptos#accountChanged", (e: any) => onAccountChanged(e?.detail));
        }
      } catch (e) {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maskAddress = (addr?: string) => {
    if (!addr) return "";
    return addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
  };

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side (unchanged) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-2xl font-bold">
              <Trophy className="w-7 h-7" />
              <span className="text-foreground">Sentenex</span>
            </div>
          </div>

          {/* RIGHT SIDE: your button area — replaced with full wallet behavior */}
          <div className="flex items-center gap-3">
            {account ? (
              <>
                <div className="px-3 py-1.5 rounded-full bg-gray-100 border text-gray-700 text-sm font-medium">
                  {maskAddress(account.address)}
                </div>

                <button
                  onClick={disconnectPetra}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-medium transition-all duration-150 shadow-sm"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={connectPetra}
                className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                disabled={connecting}
              >
                {connecting ? "Connecting..." : "+ Add Wallet"}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
