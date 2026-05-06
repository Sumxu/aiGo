// 📁 src/types/user.ts

import { BigNumber } from "ethers"; // 如果你用 ethers.js
//用户信息接口
export interface UserInfo {
  activate: string | null;
  address: string | null;
  caBalance: number | null;
  caReward: number | null;
  communityPerf: number | null;
  createTime: string | null;
  directCount: number | null;
  directTotalCount: number | null;
  inviterAddress: string | null;
  layer: number | null;
  nodeLevel: number | 0;
  parentAddress: string | null;
  selfInvest: number | null;
  sort: number | null;
  teamCount: number | null;
  teamNodePerf: number | null;
  teamPerf: number | null;
  teamReward: number | null;
  usdtBalance: number | null;
  userLevel: number | null;
}

//用户信息abi
export interface UserInfoAbi {
  inviter: string;
  directCount: BigNumber;
  preIndex: BigNumber;
  gasAmount: BigNumber;
  profitQuota: BigNumber;
  ticketNumber: BigNumber;
}

//矿机收益
export interface MinerInfo {
  value: BigNumber; //释放金额
  powerValue: BigNumber; //算力
  time: BigNumber; //开始时间;
  per: BigNumber; //每次释放额度;
  releaseValueDebt: BigNumber; //本次动静
  releaseCaAmount: BigNumber; //本次领取CA
  totalMaxValue: BigNumber; //累计动静
  totalReleaseCaAmount: BigNumber; //累计领取CA
  flg: boolean; //true = release false = end
}
