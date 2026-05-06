import type { BigNumber } from "ethers";
export interface UserInfo {
  usdtValue: BigNumber;
  gasValues: BigNumber;
  rewardTotalValue: BigNumber;
  claimTeamTotalValue:BigNumber;
  claimTeamTotalUsdtValue:BigNumber;
}
