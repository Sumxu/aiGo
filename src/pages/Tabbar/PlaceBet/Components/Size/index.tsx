import "./index.scss";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import studio from "@/assets/donate/studio.png";
import blackRight from "@/assets/donate/blackRight.png";
import shangzhang from "@/assets/donate/shangzhang.png";
import checkIcon from "@/assets/donate/checkIcon.png";
import noCheck from "@/assets/donate/noCheck.png";
import anquanWhilte from "@/assets/donate/anquanWhilte.png";
import { Button } from "antd";
import ContractSend from "@/Hooks/ContractSend";
import ContractRequest from "@/Hooks/ContractRequest.ts";
import ContractList from "@/Contract/Contract";
import { storage } from "@/Hooks/useLocalStorage";
import { fromWei, getDecimals, toWei, Totast } from "@/Hooks/Utils";
const Size: FC = () => {
  const [algoBalance, setAlgoBalance] = useState<bigint>(0n);
  const walletAddress = storage.get("address");
  const amounts = [10, 100, 1000, 5000, 100000];
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [selected, setSelected] = useState<number>(10);
  const [betType, setBetType] = useState<number>(1); //1是单 2是双
  const computedAmount = () => {
    return selected * 1.95;
  };
  const submitClick = async () => {
    setBtnLoading(true);
    try {
      let amount = toWei(selected.toString(), getDecimals());
      if (algoBalance < amount) {
        Totast('余额不足','error')
        setBtnLoading(false);
        return;
      }
      console.log("amount--", amount);
      let isApply = false;
      let applyAmount = 0n;
      await ContractRequest({
        tokenName: "AIgoToken",
        methodsName: "allowance",
        params: [walletAddress, ContractList["AigoPrediction"].address],
      }).then((res) => {
        console.log("res.value--", res);
        if (res.value) {
          applyAmount = res.value;
        }
      });
      console.log("applyAmount", fromWei(applyAmount, getDecimals()));
      console.log("amount", fromWei(amount, getDecimals()));
      if (applyAmount < amount) {
        setBtnLoading(true);
        try {
          await ContractSend({
            tokenName: "AIgoToken",
            methodsName: "approve",
            params: [
              ContractList["AigoPrediction"].address,
              amount, //授权最大值
            ],
          }).then((res) => {
            if (res.value) {
              isApply = true;
            } else {
              return;
            }
          });
        } catch (error) {
        } finally {
          setBtnLoading(false);
        }
      } else {
        isApply = true;
      }
      if (!isApply) {
        return;
      }
      setBtnLoading(true);
      const result = await ContractSend({
        tokenName: "AigoPrediction",
        methodsName: "singleDoubleMint",
        params: [walletAddress, amount, 0, betType],
      });
      if (result.value) {
        Totast("投注成功", "success"); // 检查授权或者授权时发生了错误，请检查网络后重新尝试
      }
    } catch (error) {
    } finally {
      setBtnLoading(false);
    }
  };
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
    <div className="SizePage">
      <div className="hintBox">
        <div className="headerTopOption">
          <div className="blockOption">
            <img className="icon" src={studio}></img>
          </div>
          <div className="hintTxt">玩法规则 · 单双</div>
        </div>
        <div className="hintContent">
          <div className="txt">
            取交易哈希txHash的最后一位十六进制字符判定结果:
          </div>
          <div className="btnOption">
            <div className="btnFlex btnRight12">
              <span className="spn1">末位值/2==1</span>
              <img className="icon" src={blackRight}></img>
              <span className="spn3">单</span>
            </div>

            <div className="btnFlex">
              <span className="spn1">末位值/2!=1</span>
              <img className="icon" src={blackRight}></img>
              <span className="spn3">双</span>
            </div>
          </div>
        </div>
      </div>

      <div className="sumbitBox">
        <div className="sumbitOption">
          <div className="submitTxt">选择押注方向</div>
          <div className="submitBtnOption">
            <div
              onClick={() => setBetType(1)}
              className={`btn btnRight ${betType == 1 ? "btnCheck" : "btnOnCheck"}`}
            >
              <div className="headerTop">
                <div className="btnTop">单</div>
                <div className="checkOption">
                  {betType == 2 ? (
                    <img src={noCheck} className="icon"></img>
                  ) : (
                    <img src={checkIcon} className="checkIcon"></img>
                  )}
                </div>
              </div>
            </div>
            <div
              onClick={() => setBetType(2)}
              className={`btn btnRight ${betType == 2 ? "btnCheck" : "btnOnCheck"}`}
            >
              <div className="headerTop">
                <div className="btnTop">双</div>
                <div className="checkOption">
                  {betType == 1 ? (
                    <img src={noCheck} className="icon"></img>
                  ) : (
                    <img src={checkIcon} className="checkIcon"></img>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="subimtAmountList">
          <div className="amountHinTxt">投注金额</div>
          <div className="amountList">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {amounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelected(amount)}
                  className={`amount-btn ${selected === amount ? "selected" : ""}`}
                >
                  {amount} AIGO
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="expectBox">
          <div className="leftOption">
            <img src={shangzhang} className="icon"></img>
            <div className="txt">预计回报</div>
          </div>
          <div className="rightOption">
            <div className="expectNum">1.95X</div>
            <div className="computedAmount">{computedAmount()} AIGO</div>
          </div>
        </div>
        <div className="totalBox">
          <div className="headerOption">
            <div className="optionTxt">
              <div className="leftTxt">玩法</div>
              <div className="rightTxt">
                单双 · {betType == 0 ? "单" : "双"}
              </div>
            </div>
            <div className="optionTxt">
              <div className="leftTxt">投注金额</div>
              <div className="rightTxt">{selected} AIGO</div>
            </div>
          </div>
          <div className="totalHintTxt">
            <div className="leftTxt">合计支付</div>
            <div className="leftTxt">{selected} AIGO</div>
          </div>
          <Button
            className="btn"
            loading={btnLoading}
            onClick={() => submitClick()}
          >
            <img src={anquanWhilte} className="icon"></img>
            <div className="txt">确认下注</div>
          </Button>
        </div>
      </div>
    </div>
  );
};
export default Size;
