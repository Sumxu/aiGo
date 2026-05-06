import { ethers } from "ethers";

const MULTICALL_ABI = [
  "function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)",
];

interface CallItem {
  address: string;
  abi: any[];
  method: string;
  params?: any[];
}

export async function multiCall(
  rpcUrl: string,
  multicallAddress: string,
  calls: CallItem[],
) {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const multicall = new ethers.Contract(multicallAddress, MULTICALL_ABI, provider);

    const callData = calls.map((call) => {
      const iface = new ethers.Interface(call.abi);
      return {
        target: call.address,
        callData: iface.encodeFunctionData(call.method, call.params || []),
      };
    });

    // ethers v6 调用 contract 函数返回的是对象，和 v5 类似
    const aggregateResult = await multicall.aggregate(callData);

    // 兼容 v1/v2 返回方式
    const returnData: string[] = aggregateResult.returnData ?? aggregateResult[1];
    if (!returnData || !Array.isArray(returnData)) {
      console.error("multicall returned invalid data:", aggregateResult);
      return [];
    }

    const result = returnData.map((data: string, index: number) => {
      const call = calls[index];
      const iface = new ethers.Interface(call.abi);
      try {
        return iface.decodeFunctionResult(call.method, data);
      } catch (err) {
        console.error(`Failed to decode call ${call.method} at index ${index}:`, err);
        return null;
      }
    });

    return result;
  } catch (err) {
    console.error("multicall error:", err);
    return [];
  }
}