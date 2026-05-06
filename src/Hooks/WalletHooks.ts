import { userAddress, userChainId } from "@/Store/Store";
import { message } from "antd";
import EnvManager from "@/config/EnvManager";
import { storage } from "@/Hooks/useLocalStorage";

declare global {
  interface Window {
    ethereum?: any;
  }
}
// ✅ 保证全局只注册一次监听
let isListenerAdded = false;
export function listenWalletEvents(navigate) {
  if (!window.ethereum || isListenerAdded) return;
  isListenerAdded = true;
  window.ethereum.on("accountsChanged", (accounts: string[]) => {
    clearStorageFn();
    //清空缓存
    if (accounts.length === 0) {
      navigate("/Wallet");
    } else {
      navigate("/Wallet");
    }
  });

  window.ethereum.on("chainChanged", () => {
    navigate("/Wallet");
  });
}
//清空所有的缓存只要切换了账号
const clearStorageFn = () => {
  storage.set("sign", null);
  storage.set("address", null);
};
// ✅ 连接钱包逻辑
export async function ensureWalletConnected(navigate): Promise<boolean> {
  const { setAddress } = userAddress.getState();
  const { setChain } = userChainId.getState();

  if (!window.ethereum) return false;

  const ethereum = window.ethereum;

  const currentChainId = await ethereum.request({ method: "eth_chainId" });
  setChain(currentChainId);
  const BNB_PARAMS = {
    chainId: EnvManager.chainId,
    chainName: EnvManager.chainName,
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: [EnvManager.rpcUrl],
    blockExplorerUrls: [EnvManager.blockExplorerUrls],
  };

  let accounts: string[] = [];

  try {
    accounts = await ethereum.request({ method: "eth_requestAccounts" });
  } catch {
    return false;
  }

  if (accounts.length > 0) {
    setAddress(accounts[0]);
    localStorage.setItem("address", accounts[0]);
  }

  if (currentChainId.toLowerCase() !== BNB_PARAMS.chainId) {
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BNB_PARAMS.chainId }],
      });
      clearStorageFn();
      navigate("/Wallet");
    } catch (err: any) {
      if (err.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [BNB_PARAMS],
          });
          clearStorageFn();
          navigate("/Wallet");
        } catch {}
      }
    }
  }

  return true;
}
