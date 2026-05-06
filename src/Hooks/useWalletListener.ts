import { useEffect, useRef } from "react";
import { ethers } from "ethers";

interface WalletListenerCallbacks {
  onAccountsChanged?: (accounts: string[]) => void;
  onDisconnected?: () => void;
  onChainChanged?: (chainId: string) => void;
}

const useWalletListener = ({
  onAccountsChanged,
  onDisconnected,
  onChainChanged,
}: WalletListenerCallbacks = {}) => {
  const providerRef = useRef<ethers.providers.Web3Provider | null>(null);

  useEffect(() => {
    if (!window.ethereum) return;

    if (!providerRef.current) {
      providerRef.current = new ethers.providers.Web3Provider(window.ethereum);
    }

    const provider = providerRef.current;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        console.log("⛔ 钱包断开");
        onDisconnected?.();
      } else {
        console.log("🔄 钱包切换", accounts);
        onAccountsChanged?.(accounts);
      }
    };

    const handleChainChanged = (chainId: string) => {
      console.log("🌐 链切换", chainId);
      onChainChanged?.(chainId);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    console.log("🔔 钱包监听已启动…");

    return () => {
      console.log("🛑 钱包监听已卸载");
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [onAccountsChanged, onDisconnected, onChainChanged]);
};

export default useWalletListener;
