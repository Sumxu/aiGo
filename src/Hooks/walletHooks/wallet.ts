import { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import type { Signer } from "ethers";
import { Totast } from "../Utils";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWallet = () => {
  const [account, setAccount] = useState<string>("");
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [chainId, setChainId] = useState<number>();

  /** 初始化 provider */
  const initProvider = () => {
    if (!window.ethereum) return null;
    return new BrowserProvider(window.ethereum);
  };

  /** 连接钱包 */
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("请安装 MetaMask");
      return;
    }

    const web3Provider = initProvider();
    if (!web3Provider) return;

    try {
      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const signer = await web3Provider.getSigner();
      const address = accounts[0];
      const network = await web3Provider.getNetwork();
      setProvider(web3Provider);
      setSigner(signer);
      setChainId(Number(network.chainId));
      localStorage.setItem("wallet_connected", "1");
      const signResult = await signLogin(address, signer);
      console.log("signResult==", signResult);
      if(signResult){
      return address;
      }else{
        Totast('用户取消了授权','info')
      }
    } catch (err) {
      console.error("连接钱包失败", err);
    }
  };

  /** 签名登录 */
  const signLogin = async (address: string, signer: Signer) => {
    try {
      const message = `Login\n\nWallet: ${address}\nTime: ${Date.now()}`;
      const signature = await signer.signMessage(message);
      return true;
    } catch (err) {
      // console.error("签名失败", err);
      return false;
    }
  };

  /** 断开连接（新增） */
  const disconnectWallet = async () => {
    try {
      setAccount("");
      setProvider(null);
      setSigner(null);
      setChainId(undefined);
      // 清除本地存储标记
      localStorage.removeItem("wallet_connected");
      if (window.ethereum) {
        try {
          await window.ethereum.request({
            method: "wallet_revokePermissions",
            params: [{ eth_accounts: {} }],
          });
        } catch (e) {
          console.log("Revoke permission not supported or failed");
        }
      }
      console.log("钱包已断开连接");
    } catch (err) {
      console.error("断开连接失败", err);
    }
  };

  /** 自动重连 */
  const autoConnect = async () => {
    if (!window.ethereum) return;
    if (!localStorage.getItem("wallet_connected")) return;

    const web3Provider = initProvider();
    if (!web3Provider) return;

    const accounts: string[] = await window.ethereum.request({
      method: "eth_accounts",
    });
    if (accounts.length === 0) return;

    const signer = await web3Provider.getSigner();
    const network = await web3Provider.getNetwork();

    setProvider(web3Provider);
    setSigner(signer);
    setAccount(accounts[0]);
    setChainId(Number(network.chainId));
  };

  /** 监听账户变化 */
  const listenAccountChange = () => {
    if (!window.ethereum) return;

    window.ethereum.on("accountsChanged", (accounts: string[]) => {
      if (accounts.length === 0) {
        // 用户在 MetaMask 中手动断开或切换到无账号
        setAccount("");
        setProvider(null);
        setSigner(null);
        localStorage.removeItem("wallet_connected");
      } else {
        setAccount(accounts[0]);
      }
    });
  };

  /** 监听链变化 */
  const listenChainChange = () => {
    if (!window.ethereum) return;

    window.ethereum.on("chainChanged", (chainIdHex: string) => {
      setChainId(parseInt(chainIdHex, 16));
      window.location.reload();
    });
  };

  useEffect(() => {
    autoConnect();
    listenAccountChange();
    listenChainChange();
    // 组件卸载时清理监听器（推荐做法）
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", listenAccountChange);
        window.ethereum.removeListener("chainChanged", listenChainChange);
      }
    };
  }, []);

  return {
    account,
    provider,
    signer,
    chainId,
    connectWallet,
    disconnectWallet,
  };
};
