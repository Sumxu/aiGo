import "./index.scss";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Size from "./Components/Size";
import SingleOrDouble from "./Components/SingleOrDouble";
import Cow from "./Components/Cow";
import walletWhilte from "@/assets/donate/walletWhitle.png";
import naoling from "@/assets/donate/naoling.png";
import lianjie from "@/assets/donate/lianjie.png";
import studio from "@/assets/donate/studio.png";
import ContractRequest from "@/Hooks/ContractRequest.ts";
import { formatAddress, fromWei, getDecimals } from "@/Hooks/Utils";
import { storage } from "@/Hooks/useLocalStorage";
import whiteDonate from '@/assets/tabbar/whiteDonate.png'
const PlaceBet: FC = () => {
  const navigate = useNavigate();
  const walletAddress = storage.get("address");
  const [algoBalance, setAlgoBalance] = useState<bigint>(0n);
  const [active, setActive] = useState(0);
  const tabs = ["单双", "尾数", "牛牛"];
  const initData = async (address) => {
    const result = await ContractRequest({
      tokenName: "AIgoToken",
      methodsName: "balanceOf",
      params: [address],
    });
    console.log("result--", result);
    if (result.value) {
      setAlgoBalance(result.value);
    }
  };
  useEffect(() => {
    initData(walletAddress);
  }, []);
  return (
    <div className="PlacePage">
      <div className="placePageContent">
        <div className="headerTopBox">
          <div className="leftOption">
            <div className="logoBox">
              <img src={whiteDonate} className="icon"></img>
            </div>
            <div className="hintTxt">
              <div className="txtTop">下注</div>
              <div className="txtEnd">Place Bet</div>
            </div>
          </div>
          <div className="rightOption">
            <div className="rightBox">
              <div className="block"></div>
              <div className="blockTxt">链上同步中</div>
            </div>
            <img src={naoling} className="icon"></img>
          </div>
        </div>
        <div className="walletBox">
          <div className="leftOption">
            <div className="walletTxt">钱包余额</div>
            <div className="blanceOfOption">
              <span className="spn">{fromWei(algoBalance, getDecimals())}</span>
              <span className="tokenName">AIGO</span>
            </div>
          </div>
          <div className="rightWalletAddress">
            <img className="icon" src={lianjie}></img>
            <div className="walletAddress">{formatAddress(walletAddress)}</div>
          </div>
        </div>
        <div className="tabs">
          {tabs.map((item, index) => (
            <div
              key={index}
              className={`tab ${active === index ? "active" : ""}`}
              onClick={() => setActive(index)}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
      <div className="placePageComponents">
        {active == 0 && <Size></Size>}
        {active == 1 && <SingleOrDouble></SingleOrDouble>}
        {active == 2 && <Cow></Cow>}
      </div>
    </div>
  );
};
export default PlaceBet;
