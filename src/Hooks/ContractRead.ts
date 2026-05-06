import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

interface UseContractOptions {
  rpcUrl: string;
  contractAddress: string;
  abi: any;
  chainId?: number;
  // 查询方法
  method?: string;
  // 动态参数
  args?: any[];

  // 是否自动查询 
  auto?: boolean;
}

export function useContract({
  rpcUrl,
  contractAddress,
  abi,
  chainId,
  method,
  args = [],
  auto = false,
}: UseContractOptions) {
  const [provider, setProvider] =
    useState<ethers.providers.JsonRpcProvider | null>(null);

  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const [data, setData] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<any>(null);

  /**
   * 初始化 provider + contract
   */
  useEffect(() => {
    if (!rpcUrl || !contractAddress || !abi) return;

    try {
      const _provider = new ethers.providers.JsonRpcProvider(rpcUrl);

      const _contract = new ethers.Contract(contractAddress, abi, _provider);

      setProvider(_provider);
      setContract(_contract);

      if (chainId) {
        _provider.getNetwork().then((network) => {
          if (network.chainId !== chainId) {
            console.warn("ChainId 不匹配");
          }
        });
      }
    } catch (err) {
      setError(err);
    }
  }, [rpcUrl, contractAddress, abi, chainId]);

  /**
   * 手动调用方法
   */
  const call = useCallback(
    async (methodName: string, params: any[] = []) => {
      if (!contract) return;

      setLoading(true);
      setError(null);

      try {
        const result = await contract[methodName](...params);
        setData(result);
        return result;
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [contract],
  );

  /**
   * 自动查询
   */
  useEffect(() => {
    if (!auto) return;
    if (!method) return;
    if (!contract) return;

    call(method, args);
  }, [auto, method, JSON.stringify(args), contract]);

  return {
    provider,
    contract,
    data,
    loading,
    error,
    call,
  };
}
