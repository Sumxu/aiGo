import { useState, useCallback } from "react";
import { ethers } from "ethers";

const MULTICALL_ABI = [
  "function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)"
];

interface CallItem {
  address: string;
  abi: any[];
  method: string;
  params?: any[];
}

export function useMultiCall(
  rpcUrl: string,
  multicallAddress: string
) {
  const [loading, setLoading] = useState(false);

  const multiCall = useCallback(async (calls: CallItem[]) => {
    try {
      setLoading(true);

      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

      const multicall = new ethers.Contract(
        multicallAddress,
        MULTICALL_ABI,
        provider
      );

      const callData = calls.map((call) => {
        const iface = new ethers.utils.Interface(call.abi);

        return {
          target: call.address,
          callData: iface.encodeFunctionData(
            call.method,
            call.params || []
          ),
        };
      });

      const [, returnData] = await multicall.aggregate(callData);

      const result = returnData.map((data, index) => {
        const call = calls[index];
        const iface = new ethers.utils.Interface(call.abi);

        const decoded = iface.decodeFunctionResult(
          call.method,
          data
        );

        return decoded;
      });

      return result;
    } catch (err) {
      console.error("multicall error", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [rpcUrl, multicallAddress]);

  return {
    multiCall,
    loading,
  };
}