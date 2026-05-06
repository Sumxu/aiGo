import type { BigNumber } from "ethers";
export interface PendingInfo {
  rewardValue: BigNumber;
  releaseValue: BigNumber;
  totalRewardValue: BigNumber;
  totalReleaseValue: BigNumber;
}
