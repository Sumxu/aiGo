import chainListData from "@/config/chainListData";
import { multiCall } from "@/Utils/multiCallUtils";
import { findChainById, findListData } from "@/Utils/chainListDataUtils";
import { getAllWallet, addOrUpdateWallets } from "@/Idb/Servers/walletService";
import { fromWei, toWei } from "@/Hooks/Utils";
import { useChainStore } from "@/Store/chainStore";
import { useOriginTokenInfoStore } from "@/Store/originTokenInfoStore";
const burnAddress1 = "0x000000000000000000000000000000000000dEaD"; //销毁地址
const burnAddress2 = "0x0000000000000000000000000000000000000000"; //销毁地址
let pairAddress: string = "";
let searchAddress: string = "";
let originTokenName: string = "";
let chainId: number = 0;
let taxRate: number = 0;
export const walletAddressList = async () => {
  const walletsData = await getAllWallet();
  return walletsData;
};
/**
 * 统计钱包数据某个字段的数量总计
 * @param walletList
 * @param label
 */
export const totalWalletAmount = (walletList, label) => {
  if (!Array.isArray(walletList) || !label) return 0;
  return walletList.reduce((total, item) => {
    const value = Number(item?.[label]) || 0;
    return total + value;
  }, 0);
};

function calculateTaxRate(sellOutAmount, buyOutToken) {
  if (buyOutToken <= 0 || sellOutAmount <= 0) {
    throw new Error("数值必须大于 0");
  }
  const taxRate = ((sellOutAmount - buyOutToken) / sellOutAmount) * 100;
  return taxRate.toFixed(4);
}
/**
 *
 * @param originTokenValue 代币名称
 * @param isCount 是否统计代币信息
 * 通过代币去查询每个地址的余额然后汇总
 * 原生代币单独查询
 * esc20需要abi查询
 */
export const totalWalletBalance = async () => {
  chainId = useChainStore.getState().chainId; //链id
  pairAddress = useChainStore.getState().pairAddress;
  searchAddress = useChainStore.getState().searchAddress;
  originTokenName = useChainStore.getState().originTokenName;
  const originTokenInfo = useOriginTokenInfoStore.getState().tokenInfo; //lp地址
  console.log(
    "originTokenInfo-totalWalletBalance--",
    originTokenInfo.contractDecimals,
  );
  //数据库查询所有的钱包地址
  const walletList = await walletAddressList();
  const chainData = findChainById(chainId);
  const baseTokenBalanceList = await baseTokenBalanceOf(chainData, walletList);
  let tokenBalanceList = [];
  let contractBalanceList = [];
  let findTokenData = {};
  if (originTokenName) {
    findTokenData = findListData(
      chainData?.baseToken,
      "label",
      originTokenName,
    );
    tokenBalanceList = await tokenBalanceOf(
      chainData,
      walletList,
      findTokenData.address,
    );
    if (searchAddress !== "") {
      contractBalanceList = await contractBalaceOf(
        chainData,
        walletList,
        searchAddress,
        findTokenData.address,
      );
    }
  }
  walletList.map((walletItem, index) => {
    if (originTokenName !== "") {
      walletItem.contractBalance = fromWei(
        contractBalanceList[index],
        originTokenInfo.contractDecimals,
        true,
        8,
      );
      //如果存在代币价格则进行计算
      const oneCtractGetToken =
        contractBalanceList[contractBalanceList.length - 2];
      const tokenPriceFormOne =
        contractBalanceList[contractBalanceList.length - 1];
      console.log("tokenPriceFormOne==", tokenPriceFormOne[0][1]);

      const tokenPriceFormOneAmount = fromWei(
        tokenPriceFormOne[0][1],
        originTokenInfo.contractDecimals,
        true,
        8,
      );
      const oneCtractGetTokenAmount = fromWei(
        oneCtractGetToken[0][1],
        originTokenInfo.contractDecimals,
      );
      walletItem.saleOriginalTokenBalance = (
        Number(oneCtractGetTokenAmount) *
        Number(
          fromWei(contractBalanceList[index], originTokenInfo.contractDecimals),
        )
      ).toFixed(4);
    }
    walletItem.baseTokenBalance = fromWei(
      baseTokenBalanceList[index],
      originTokenInfo.contractDecimals,
      true,
      8,
    );
    walletItem.tokenBalance = fromWei(
      tokenBalanceList[index],
      originTokenInfo.contractDecimals,
      true,
      8,
    );
  });
console.log('walletList==',walletList)
  await addOrUpdateWallets(walletList);
  if (originTokenName) {
    contractInfo(chainData, walletList, findTokenData.address);
  }
};
//查询原生代币
export const baseTokenBalanceOf = async (chainData, walletList) => {
  const originTokenCalls = walletList.map((walletItem) => ({
    address: chainData.multiCallAddress,
    abi: chainData.multiCallAbi,
    method: "getEthBalance",
    params: [walletItem.address], // balanceOf 的参数就是钱包地址
  }));
  return await multiCall(
    chainData?.rpcUrl,
    chainData.multiCallAddress,
    originTokenCalls,
  );
};
//查询基础代币
export const tokenBalanceOf = async (chainData, walletList, tokenAddress) => {
  const originTokenCalls = walletList.map((walletItem) => ({
    address: tokenAddress,
    abi: chainData.erc20,
    method: "balanceOf",
    params: [walletItem.address], // balanceOf 的参数就是钱包地址
  }));
  return await multiCall(
    chainData?.rpcUrl,
    chainData.multiCallAddress,
    originTokenCalls,
  );
};
//查询代币余额
const contractBalaceOf = async (
  chainData,
  walletList,
  contractAddress,
  tokenAddress,
) => {
  const originTokenInfo = useOriginTokenInfoStore.getState().tokenInfo; //lp地址
  console.log(" originTokenInfo.tokenPrice--", originTokenInfo.tokenPrice);
  const originTokenCalls = walletList.map((walletItem) => ({
    address: contractAddress,
    abi: chainData.erc20,
    method: "balanceOf",
    params: [walletItem.address], // balanceOf 的参数就是钱包地址
  }));
  originTokenCalls.push({
    address: chainData.swapRouterAddress,
    abi: chainData.swapRouterAbi,
    method: "getAmountsOut",
    params: [
      toWei("1", originTokenInfo.contractDecimals),
      [contractAddress, tokenAddress],
    ],
  });
  originTokenCalls.push({
    address: chainData.swapRouterAddress,
    abi: chainData.swapRouterAbi,
    method: "getAmountsOut",
    params: [originTokenInfo.tokenPrice, [tokenAddress, contractAddress]],
  });
  return await multiCall(
    chainData?.rpcUrl,
    chainData.multiCallAddress,
    originTokenCalls,
  );
};
/**
 * 代币信息查询
 * @param chainData
 * @param walletList
 * @param tokenAddress
 */
const contractInfo = async (chainData, walletList, tokenAddress) => {
  const originTokenInfo = useOriginTokenInfoStore.getState().tokenInfo; //lp地址
  const burnCalls = [
    {
      address: pairAddress,
      abi: chainData.erc20,
      method: "balanceOf",
      params: [burnAddress1], // balanceOf 的参数就是钱包地址
    },
    {
      address: pairAddress,
      abi: chainData.erc20,
      method: "balanceOf",
      params: [burnAddress2], // balanceOf 的参数就是钱包地址
    },
  ];
  const burnsResult = await multiCall(
    chainData?.rpcUrl,
    chainData.multiCallAddress,
    burnCalls,
  );
  //地址持有基础代币数量
  const walletOriginTokenTotalAmount = walletList.reduce(
    (total, wallet) => Number(total) + Number(wallet.tokenBalance),
    0,
  );
  //地址持有代币数量
  const walletTokenTotalAmount = walletList.reduce(
    (total, wallet) => Number(total) + Number(wallet.contractBalance),
    0,
  );

  //地址可掏池子基础代币数量
  const putableTokenAmount =
    Number(walletTokenTotalAmount) *
    Number(
      fromWei(originTokenInfo.tokenPrice, originTokenInfo.contractDecimals),
    );
  const tokenAmountNumber = fromWei(
    originTokenInfo.tokenAmount,
    originTokenInfo.contractDecimals,
  );
  const putableTokenAmountBigInt = toWei(
    putableTokenAmount.toFixed(6),
    originTokenInfo.contractDecimals,
  );
  // const ratioBig =
  //   (putableTokenAmountBigInt * 1000000n) / originTokenInfo.tokenAmount; // 保留4位小数
  // console.log("ratioBig--", ratioBig);
  // console.log(walletTokenRatio.toFixed(4) + "%");
  let burnsNums = burnsResult[0][0] + burnsResult[1][0];
  const walletTokenRato=0
  const putableInWei = toWei(
    putableTokenAmount.toString(),
    originTokenInfo.contractDecimals,
  );
  console.log("销毁----", burnsNums);
  const externalTokenAmount =
    originTokenInfo.totalSupplyAmount -
    -putableInWei -
    originTokenInfo.tokenAmount -
    burnsNums;
  console.log("externalTokenAmount==", externalTokenAmount);
  const swapRouterCall = [
    {
      address: chainData.swapRouterAddress,
      abi: chainData.swapRouterAbi,
      method: "getAmountsOut",
      params: [
        toWei(externalTokenAmount.toString(), originTokenInfo.contractDecimals),
        [searchAddress, tokenAddress],
      ],
    },
  ];
  const externalOriginAmountResult = await multiCall(
    chainData?.rpcUrl,
    chainData.multiCallAddress,
    swapRouterCall,
  );
  console.log("externalOriginAmountResult==", externalOriginAmountResult);
  const amountsOut = externalOriginAmountResult[0][0][1];
  console.log(
    "外部可掏池子===",
    fromWei(amountsOut, originTokenInfo.contractDecimals),
  );
  console.log("可掏池子基础代币数量==", putableTokenAmount);
  console.log("持有代币数量==", walletTokenTotalAmount);
  console.log("统计持有基础代币数量==", walletOriginTokenTotalAmount);
  console.log("统计持有代币比例==", walletTokenRato);
  console.log("统计持有代币比例=tokenAmount=", originTokenInfo.tokenAmount);
  useOriginTokenInfoStore.getState().setTokenInfo({
    putableTokenAmount: toWei(
      putableTokenAmount.toFixed(8),
      originTokenInfo.contractDecimals,
    ),
    walletTokenTotalAmount: toWei(
      walletTokenTotalAmount.toFixed(8),
      originTokenInfo.contractDecimals,
    ),
    walletOriginTokenTotalAmount: toWei(
      walletOriginTokenTotalAmount.toFixed(6),
      originTokenInfo.contractDecimals,
    ),
    walletTokenRato,
    externalOriginAmount: amountsOut,
    taxRate: taxRate,
  });
};
/**
 *
 * @param walletsList 查询的钱包数组
 * @param chainData //bsc链路对应的参数
 * @param tokenAddress //查询某个合约的额度
 */
export const ercAllowance = async (walletsList, chainData, tokenAddress) => {
  const tokenAllowanceCalls = walletsList.map((walletItem) => ({
    address: tokenAddress,
    abi: chainData.erc20,
    method: "allowance",
    params: [walletItem.address, chainData.swapRouterAddress],
  }));
  const tokenAllowanceResult = await multiCall(
    chainData.rpcUrl,
    chainData.multiCallAddress,
    tokenAllowanceCalls,
  );
  return tokenAllowanceResult;
};

/**
 *
 * @param walletsList 查询的钱包数组
 * @param chainData //bsc链路对应的参数
 * @param tokenAddress //查询某个合约的额度
 */
export const ercAllowanceForItemIsBuy = async (
  walletsList,
  chainData,
  tokenAddress,
  searchAddress,
) => {
  const tokenAllowanceCalls = walletsList.map((walletItem) => ({
    address: tokenAddress,
    abi: chainData.erc20,
    method: "allowance",
    params: [
      walletItem.isBuy ? walletItem.address : searchAddress,
      chainData.swapRouterAddress,
    ],
  }));
  const tokenAllowanceResult = await multiCall(
    chainData.rpcUrl,
    chainData.multiCallAddress,
    tokenAllowanceCalls,
  );
  return tokenAllowanceResult;
};
