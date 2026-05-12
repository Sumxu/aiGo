import "./index.scss";
import { useEffect, useState, type FC } from "react";
import { userAddress } from "@/Store/Store.ts";
import { ethers } from "ethers";
import ContractRequest from "@/Hooks/ContractRequest.ts";
import ContractList from "@/Contract/Contract";
import NetworkRequest from "@/Hooks/NetworkRequest.ts";
import { storage } from "@/Hooks/useLocalStorage";
import { useLocation } from "react-router-dom";
import { useRef } from "react";
import alarm from "@/assets/basic/alarm.png";
import dot from "@/assets/basic/dot.png";
import { Modal } from "antd";
import {
  formatAddress,
  concatSign,
  copyText,
  fromWei,
  getDecimals,
  Totast,
} from "@/Hooks/Utils";
import { UseSignMessage } from "@/Hooks/UseSignMessage.ts";
import { useNavigate } from "react-router-dom";
import naoling from "@/assets/donate/naoling.png";
import whileCopy from "@/assets/basic/copyIcon.png";
import walletWhilte from "@/assets/tabbar/walletCheck.png";
import refresh from "@/assets/donate/refresh.png";
import anquan from "@/assets/donate/anquan.png";
import home from "@/assets/donate/home.png";
import logoOut from "@/assets/basic/logoOut.png";
import errorIcon from "@/assets/donate/errorIcon.png";
import closeIcon from "@/assets/basic/close.png";
import { ensureWalletConnected } from "@/Hooks/WalletHooks";
const Home: FC = () => {
  const [algoBalance, setAlgoBalance] = useState<bigint>(0n);
  const [usdtBalance, setUsdtBalance] = useState<bigint>(0n);
  const [sign, setSign] = useState<any>(null);
  const { signMessage } = UseSignMessage();
  const navigate = useNavigate();
  const address = storage.get("address");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isShowHint, setIsShowHint] = useState<boolean>(true);
  // 授权登录
  const connectWallet = async () => {
    const result = await ensureWalletConnected(navigate);
    if (result) {
      const address = userAddress.getState().address;
      try {
        const sigResult = await signMessage("login", address);
        if (sigResult) {
          //接口登录
          await NetworkRequest({
            Url: "auth/login",
            Method: "post",
            Data: { address: address, signature: sigResult, msg: "login" },
          }).then((res) => {
            if (res.success) {
              storage.set("sign", res.data.data);
              setSign(sigResult);
              setWalletAddress(address);
              initData(address);
            } else {
              // setIsNotConnect(true);
            }
          });
        }
      } catch (error) {}
    }
  };
  /**
   * 查询aigo余额和可以兑换多少usdt
   */
  const initData = async (address) => {
    const result = await ContractRequest({
      tokenName: "AIgoToken",
      methodsName: "balanceOf",
      params: [address],
    });
    console.log("result--", result);
    setAlgoBalance(result.value);
    getUsdtAmount(result.value);
  };
  const getUsdtAmount = async (aiGoAmount) => {
    console.log("aiGoAmount--", aiGoAmount);
    const result = await ContractRequest({
      tokenName: "SwapRouter",
      methodsName: "getAmountsOut",
      params: [
        aiGoAmount,
        [
          ContractList["AIgoToken"].address,
          "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        ],
      ],
    });
    setUsdtBalance(result.value[1] || 0n);
  };
  const copyClick = (val) => {
    copyText(val);
  };
  const disconnectWallet = () => {
    Modal.confirm({
      title: "确认退出",
      content: "确定要退出当前钱包吗？",
      okText: "确认退出",
      cancelText: "取消",
      onOk() {
        setWalletAddress("");
        storage.set("sign", null);
        storage.set("address", null);
        navigate("/Wallet");
      },
      onCancel() {
        console.log("取消退出");
      },
    });
  };
  const btnClick = () => {
    if (address) {
      navigate("/PlaceBet");
    } else {
      Totast("请先链接钱包", "info");
    }
  };
  useEffect(() => {
    const walletAddress = storage.get("address");
    if (walletAddress) {
      setWalletAddress(address);
      initData(address);
    } else {
      setWalletAddress("");
      storage.set("sign", null);
      storage.set("address", null);
    }
  }, []);
  return (
    <div className="homePageBox">
      <div className="headerTopBox">
        <div className="headerTopLeftOption">
          <div className="walletTxt">钱包</div>
          <div className="walletEn">Wallet & Connection</div>
        </div>
        <div className="headerTopRightOption">
          <img src={alarm} className="icon"></img>
          <div className="redBlock"></div>
        </div>
      </div>

      <div className="loginWalletBox">
        <div className="loginHeaderTopBox">
          <div className="leftOption">
            <div className="walletBox">
              <img src={walletWhilte} className="walletIcon"></img>
            </div>
            <div className="spnTxt">
              {walletAddress ? "已链接" : "未链接钱包"}
            </div>
          </div>
          <div className="rightOption">
            {walletAddress ? (
              <>
                <img src={logoOut} className="logoOutIcon"></img>
                <div className="rightTxt" onClick={disconnectWallet}>
                  退出
                </div>
              </>
            ) : (
              <div className="rightTxt" onClick={connectWallet}>
                连接钱包
              </div>
            )}
          </div>
        </div>
        <div className="optionBox optionBoxBg">
          <div className="left">{formatAddress(walletAddress)}</div>
          <div className="rightIocn" onClick={() => copyClick(walletAddress)}>
            <img src={whileCopy} className="icon"></img>
          </div>
        </div>
        <div className="title">AIGO余额</div>
        <div className="optionBox">
          <div className="left">
            <span className="num">
              {walletAddress ? fromWei(algoBalance, getDecimals()) : "-"}
            </span>
            <span className="tokenName">AIGO</span>
          </div>
          <div className="rightIocn" onClick={() => initData(address)}>
            <img src={refresh} className="icon"></img>
          </div>
        </div>
        <div className="hintTxt">
          ≈ {walletAddress ? fromWei(usdtBalance, getDecimals()) : "-"} BNB
        </div>
      </div>

      <div className="hintBox">
        <div className="headerTopOption">
          <div className="txt">庄家收款地址</div>
        </div>
        <div className="copyOption">
          <div className="leftTxt">
            {formatAddress(ContractList["AigoPrediction"].address)}
          </div>
          <img
            src={whileCopy}
            onClick={() => copyClick(ContractList["AigoPrediction"].address)}
            className="copyIcon"
          ></img>
        </div>
        <div className="safeOption">
          <img src={anquan} className="safeIcon"></img>
          <span className="spnTxt">已通过官方验证</span>
        </div>
      </div>
      <div className="openBox">
        <div className="leftOption">
          <img className="status-dot" src={dot}></img>
          <div className="txtBox">下注已开启</div>
        </div>
        <div className="rightOption">系统正常运行</div>
      </div>
      <div className="btnBox" onClick={() => btnClick()}>
        <span className="spnTxt">开始下注</span>
      </div>
      {isShowHint && (
        <div className="hintEndBox">
          <div className="headerTopOption">
            <div className="leftOption">
              <img src={errorIcon} className="icon"></img>
              <div className="hintTxt">网络费用提醒</div>
            </div>
            <img
              src={closeIcon}
              className="closeIcon"
              onClick={() => setIsShowHint(false)}
            ></img>
          </div>
          <div className="endTxt">每次下注需要少量BNB作为Gas费用</div>
        </div>
      )}
    </div>
  );
};
export default Home;
