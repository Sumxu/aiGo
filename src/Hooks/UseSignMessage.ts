import { useCallback } from "react";
import { ethers } from "ethers";
import { message as antdMessage } from "antd";

/**
 * Hook: 用于通过 MetaMask 签名消息并验证 (ethers v6)
 */
export const UseSignMessage = () => {
  const signMessage = useCallback(
    async (msg: string, address: string): Promise<string | null> => {
      if (!window.ethereum) {
        antdMessage.error("请先安装 MetaMask 钱包");
        return null;
      }

      try {
        // v6: 使用 BrowserProvider
        const provider = new ethers.BrowserProvider(window.ethereum);

        // 请求连接钱包
        await provider.send("eth_requestAccounts", []);

        // 获取 signer
        const signer = await provider.getSigner();
        // 获取地址
        const address = await signer.getAddress();
        // 签名
        const signature = await window.ethereum.request({
          method: "personal_sign",
          params: [msg, address], // 注意顺序：message 在前
        });
        // v6: verifyMessage 在顶层
        const recovered = ethers.verifyMessage(msg, signature);

        if (recovered.toLowerCase() !== address.toLowerCase()) {
          antdMessage.error("签名验证失败，请重试");
          return null;
        }

        return signature;
      } catch (error: any) {
        if (error.code === 4001) {
          antdMessage.warning("用户取消了签名请求");
        } else {
          console.error("签名错误:", error);
          antdMessage.error("签名失败，请检查钱包或网络");
        }
        return null;
      }
    },
    [],
  );

  return { signMessage };
};
