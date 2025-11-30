import React, { useEffect, useState } from "react";
import type { WalletAccount } from "../wallet/aptosWallet";
import { connectPetra, disconnectPetra, formatAddr } from "../wallet/aptosWallet";

export const Header: React.FC = () => {
  const [account, setAccount] = useState<WalletAccount | null>(null);

  useEffect(() => {
    // If the provider exposes a current account, set it on mount
    const aptos = (window as any).aptos;
    if (!aptos) return;

    const tryLoad = async () => {
      try {
        const acc = typeof aptos.account === "function" ? await aptos.account() : aptos.account;
        if (acc && acc.address) setAccount(acc);
      } catch (err) {
        // ignore
      }
    };

    tryLoad();
  }, []);

  const handleConnect = async () => {
    try {
      const acc = await connectPetra();
      if (acc && acc.address) setAccount(acc);
    } catch (err: any) {
      // Provide a minimal user-facing error
      alert(err?.message ?? String(err));
    }
  };

  const handleDisconnect = async () => {
    await disconnectPetra();
    setAccount(null);
  };

  return (
    <header className="st-header st-header-top">
      <div className="st-header-title">
        <div className="st-badge">🏆</div>
        <div>
          <h1>AptosHack Sentiment Trader</h1>
          <p className="muted">Auto-trade via X402 protocol</p>
        </div>
      </div>

      <div className="st-header-actions">
        {account ? (
          <div className="account-row">
            <button className="st-secondary-btn small" onClick={handleDisconnect} title="Disconnect wallet">
              Disconnect
            </button>
            <span className="muted tiny" style={{ marginLeft: 10 }} title={account.address}>
              {formatAddr(account.address)}
            </span>
          </div>
        ) : (
          <button className="st-secondary-btn small" onClick={handleConnect}>
            + Add Wallet
          </button>
        )}
      </div>
    </header>
  );
};
