import { useState, useCallback } from "react";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const eth = typeof window !== "undefined" ? (window as any).ethereum : null;
      if (eth) {
        const accounts = await eth.request({ method: "eth_requestAccounts" });
        setAddress(accounts[0]);
      }
    } catch (err: any) {
      if (
        err?.code === 4001 ||
        err?.code === "ACTION_REJECTED" ||
        err?.info?.error?.code === 4001 ||
        (err?.message || "").toLowerCase().includes("user rejected") ||
        (err?.message || "").toLowerCase().includes("user denied")
      ) {
        return;
      }
      console.error("Failed to connect wallet", err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  return { address, isConnecting, connect };
}
