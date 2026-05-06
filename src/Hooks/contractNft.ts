import { useState, useCallback } from "react";
import { ethers } from "ethers";
import ContractList from "@/Contract/Contract";

export const useNFTQuery = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner(); // 写交易必须使用 signer
  const contractInfo = ContractList["SpaceNFT"];
  const contract = new ethers.Contract(
    contractInfo.address,
    contractInfo.abi,
    signer
  );
  // 调用只读方法
  const callMethod = useCallback(
    async (methodName: string, params: any[] = []) => {
      try {
        const result = await contract[methodName](...params);
        return { success: true, data: result };
      } catch (err: any) {
        console.error(err);
        return { success: false, error: err.message || "Query failed" };
      }
    },
    [contract]
  );
  // 写交易方法
  const sendTransaction = useCallback(
    async (methodName: string, params: any[] = [], overrides: any = {}) => {
      try {
        if (!signer) throw new Error("Wallet not connected");
        const tx = await contract[methodName](...params, overrides);
        const receipt = await tx.wait(); // 等待交易上链
        return { success: true, data: receipt };
      } catch (err: any) {
        console.error(err);
        return { success: false, error: err.message || "Transaction failed" };
      }
    },
    [contract, signer]
  );

  return { callMethod, sendTransaction };
};
