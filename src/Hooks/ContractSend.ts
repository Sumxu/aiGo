import ContractList from "../Contract/Contract";
import { ethers } from "ethers";
import { message } from "antd";
import { t } from "i18next";

export interface ContractParams {
  tokenName: string;
  methodsName: string;
  params: any[];
  value?: bigint; // ✅ 改成 bigint
}

interface ContractObje {
  address: string;
  abi: Array<any>;
}

interface ContractResult {
  value: any;
}

async function useContractSend({
  tokenName,
  methodsName,
  params,
  value,
}: ContractParams): Promise<ContractResult> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);

    const signer = await provider.getSigner();

    const contractInfo: ContractObje = ContractList[tokenName];

    const contract = new ethers.Contract(
      contractInfo.address,
      contractInfo.abi,
      signer
    );

    const feeData = await provider.getFeeData();

    // ✅ estimateGas
    const estimatedGas: bigint = await contract[methodsName].estimateGas(
      ...params,
      { value }
    );

    // ✅ 放大 30%
    const gasLimit = (estimatedGas * 130n) / 100n;
    // const gasLimit = 150000n;

    const tx = await contract[methodsName](...params, {
      value,
      gasLimit,
      // EIP-1559
      maxFeePerGas: feeData.maxFeePerGas ?? undefined,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
    });

    const receipt = await tx.wait();

    return { value: receipt };
  } catch (err: any) {
    if (
      err.code === "ACTION_REJECTED" ||
      err.message?.includes("user rejected")
    ) {
      message.warning(t("取消交易签名"));
    } else {
      console.log("err===", err);

      let errorMsg = err?.message || String(err);
      if (errorMsg.length > 50) {
        errorMsg = errorMsg.slice(0, 50) + "...";
      }

      message.error(t("交易失败") + errorMsg);
    }

    return { value: false };
  }
}

export default useContractSend;