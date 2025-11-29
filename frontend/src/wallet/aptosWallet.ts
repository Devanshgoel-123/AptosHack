export type WalletAccount = {
  address: string;
  publicKey?: string;
};

export async function connectPetra(): Promise<WalletAccount | null> {
  const aptos = (window as any).aptos;
  if (!aptos) {
    throw new Error("No Aptos wallet found. Please install Petra wallet.");
  }

  try {
    // Some wallets return the account data on connect, others only enable the connection
    const res = await (aptos.connect?.() ?? Promise.resolve(null));

    // If connect returns an account object
    if (res && typeof res === "object" && res.address) {
      return { address: res.address, publicKey: res.publicKey };
    }

    // Else call account() if available
    const account = typeof aptos.account === "function" ? await aptos.account() : null;
    if (account && account.address) {
      return { address: account.address, publicKey: account.publicKey };
    }

    // Some wallets expose a synchronous property
    if (aptos.account && typeof aptos.account === "object" && aptos.account.address) {
      return { address: aptos.account.address, publicKey: (aptos.account as any).publicKey };
    }

    // If nothing returns, we consider it connected but don't have address information
    return null;
  } catch (err) {
    throw err;
  }
}

export async function disconnectPetra(): Promise<void> {
  const aptos = (window as any).aptos;
  if (!aptos || !aptos.disconnect) return;
  try {
    await aptos.disconnect();
  } catch (err) {
    console.warn("Unable to disconnect petra wallet", err);
  }
}

export function formatAddr(address: string | undefined): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
