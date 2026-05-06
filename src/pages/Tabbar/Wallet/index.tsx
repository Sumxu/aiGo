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
import { Modal } from "antd";
import {
  formatAddress,
  concatSign,
  copyText,
  fromWei,
  getDecimals,
} from "@/Hooks/Utils";
import { UseSignMessage } from "@/Hooks/UseSignMessage.ts";
import { useNavigate } from "react-router-dom";
import naoling from "@/assets/donate/naoling.png";
import walletWhilte from "@/assets/donate/walletWhitle.png";
import whileCopy from "@/assets/donate/whileCopy.png";
import blackCopy from "@/assets/donate/blackCopy.png";
import refresh from "@/assets/donate/refresh.png";
import anquan from "@/assets/donate/anquan.png";
import home from "@/assets/donate/home.png";
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
    if (result.value) {
      setAlgoBalance(result.value);
      getUsdtAmount(result.value);
    }
  };
  const getUsdtAmount = async (aiGoAmount) => {
    console.log("aiGoAmount--", aiGoAmount);
    const result = await ContractRequest({
      tokenName: "SwapRouter",
      methodsName: "getAmountsOut",
      params: [
        aiGoAmount,
        [ContractList["AIgoToken"].address, ContractList["USDTToken"].address],
      ],
    });
    console.log("result---", result);
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
        navigate("/Wallet");
      },
      onCancel() {
        console.log("取消退出");
      },
    });
  };
  useEffect(() => {
    if (address) {
      setWalletAddress(address);
      initData(address);
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
          <img src={naoling} className="icon"></img>
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
            <div className="block"></div>
            {walletAddress ? (
              <div className="rightTxt" onClick={disconnectWallet}>
                退出
              </div>
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
          <div className="rightIocn" onClick={() => initData()}>
            <img src={refresh} className="icon"></img>
          </div>
        </div>
        <div className="hintTxt">
          ≈ {walletAddress ? fromWei(usdtBalance, getDecimals()) : "-"} USDT
        </div>
      </div>

      <div className="hintBox">
        <div className="headerTopOption">
          <img src={home} className="icon"></img>
          <div className="txt">庄家收款地址</div>
        </div>
        <div className="hintTxts">
          请将 ALGO 转账至以下地址完成下注。请仔细核对地址,转错将无法找回
        </div>
        <div className="copyOption">
          <div className="leftTxt">
            {formatAddress(ContractList["AigoPrediction"].address)}
          </div>
          <img
            src={blackCopy}
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
          <div className="status-dot">
            <span className="dot"></span>
          </div>
          <div className="txtBox">下注已开启</div>
        </div>
        <div className="rightOption">系统正常运行 · 当前轮次 #2847</div>
      </div>
      <div className="btnBox">
        <span className="spnTxt">开始下注</span>
        <div className="rightIcon"></div>
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
