import { useState } from "react";
import { ethers } from "ethers";

export interface WalletInfo {
  address: string;
  privateKey: string;
  tokenBalance?: number;
  baseTokenBalance?: number;
}

export const useGenerateWallets = () => {
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [generateLoading, setGenerateLoading] = useState(false);

  /**
   * 生成钱包
   * @param count 生成数量
   */
  const generateWallets = async (
    count: number,
    rpcUrl: string,
  ): Promise<WalletInfo[]> => {
    setGenerateLoading(true);
    try {
      const list: WalletInfo[] = [];
      // ethers v6 创建 provider
      const provider = new ethers.JsonRpcProvider(rpcUrl);

      for (let i = 0; i < count; i++) {
        // 随机生成钱包
        const wallet = ethers.Wallet.createRandom();

        // 可选：连接 provider，后续可直接查余额
        const connectedWallet = wallet.connect(provider);

        list.push({
          address: wallet.address,
          privateKey: wallet.privateKey,
          tokenBalance: 0,
          baseTokenBalance: 0,
        });
      }

      setWallets(list);
      return list;
    } catch (error) {
      console.error("生成钱包失败:", error);
      return [];
    } finally {
      setGenerateLoading(false);
    }
  };

  return {
    wallets,
    generateLoading,
    generateWallets,
  };
};