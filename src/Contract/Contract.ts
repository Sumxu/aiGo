import Erc20 from "./ABI/Erc20.ts";
import EnvManager from "@/config/EnvManager.ts";
import Erc20ABI from "./ABI/Erc20.ts";
import MultiCallABI from "./ABI/MultiCallABI.ts";
import SwapRouterABI from "./ABI/SwapRouterABI.ts";
import AigoPRedictionABI from "./ABI/AigoPRedictionABI.ts";

interface ContractItem {
  address: string;
  abi: any[]; // 或具体ABI类型
}
interface ContractMap {
  [key: string]: ContractItem;
}

const Contract: ContractMap = {
  USDTToken: {
    address: EnvManager.contractUsdt,
    abi: Erc20,
  },
  AigoPrediction:{
      address: EnvManager.AigoPredictionContest,
    abi: AigoPRedictionABI,
  },
  AIgoToken: {
    address: EnvManager.AIgoToken,
    abi: Erc20,
  },
  SwapRouter: {
    address: EnvManager.SwapRouter,
    abi: SwapRouterABI,
  },
  MultiCall: {
    address: EnvManager.multiCallToken,
    abi: MultiCallABI,
  },
};
// 正式
export default Contract;
