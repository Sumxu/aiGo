import { ethers } from "ethers";
export async function isWalletConnected() {
  if (!window.ethereum) return false;
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const accounts = await provider.listAccounts();
  return accounts.length > 0 ? accounts[0] : false;
}