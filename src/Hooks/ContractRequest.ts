import ContractList from "../Contract/Contract";
import { ethers } from "ethers";

interface ContractParams {
  tokenName: string;
  methodsName: string;
  params: any[];
}

interface ContractObje {
  address: string;
  abi: Array<any>;
}

interface ContractResult {
  value: any;
}

async function useContractRequest({
  tokenName,
  methodsName,
  params,
}: ContractParams): Promise<ContractResult> {
  try {
    // v6 写法
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contractInfo: ContractObje = ContractList[tokenName];
    console.log("tokenName=-=-", tokenName);
    console.log("contractInfo=-=-", contractInfo);
    console.log("methodsName=-=-", methodsName);
    console.log("params=-=-", params);
    // 这里只读调用，用 provider 就够
    const contract = new ethers.Contract(
      contractInfo.address,
      contractInfo.abi,
      provider,
    );
    const result = await contract[methodsName](...params);
    return { value: result };
  } catch (error) {
    console.log("err-", error);
    return { value: false };
  }
}

export default useContractRequest;
