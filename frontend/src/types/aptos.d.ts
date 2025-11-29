declare global {
  interface AptosAccount {
    address: string;
    publicKey?: string;
    // add other fields if needed
  }

  interface AptosProvider {
    isPetra?: boolean;
    connect?: () => Promise<any> | any;
    disconnect?: () => Promise<void> | void;
    account?: () => Promise<AptosAccount> | AptosAccount;
    // Some providers expose signMessage / signTransaction, etc.
    signMessage?: (message: string | Uint8Array) => Promise<any>;
    signTransaction?: (tx: any) => Promise<any>;
  }

  interface Window {
    aptos?: AptosProvider;
  }
}

export {};
