import type { BigNumber } from "ethers";

export interface DepositItem {
  address: string;
  amount: BigNumber;
  gasValues: BigNumber;
  blockTime: string;
  status: number;
}