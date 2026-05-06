import "./index.scss";
import type { FC } from "react";
import { useState } from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import ContractList from "@/Contract/Contract";
import studio from "@/assets/donate/studio.png";
import blackRight from "@/assets/donate/blackRight.png";
import shangzhang from "@/assets/donate/shangzhang.png";
import anquanWhilte from "@/assets/donate/anquanWhilte.png";
import ContractSend from "@/Hooks/ContractSend";
import ContractRequest from "@/Hooks/ContractRequest.ts";
import { storage } from "@/Hooks/useLocalStorage";
import { fromWei, getDecimals, toWei, Totast } from "@/Hooks/Utils";
const SingleOrDouble: FC = () => {
    const walletAddress = storage.get("address");
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const amounts = [10, 100, 500, 1000, 5000, 100000];
  const [selected, setSelected] = useState<number>(10);
  const computedAmount = () => {
    return selected * 1.95;
  };
  const submitClick = async () => {
    setBtnLoading(true);
    try {
      let amount = toWei(selected.toString(), getDecimals());
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
        methodsName: "mantissaMint",
        params: [walletAddress, amount,0],
      });
      if (result.value) {
        Totast("购买成功", "success"); // 检查授权或者授权时发生了错误，请检查网络后重新尝试
      }
    } catch (error) {
    } finally {
      setBtnLoading(false);
    }
  };
  return (
    <div className="SingleOrDoublePage">
      <div className="hintBox">
        <div className="headerTopOption">
          <div className="blockOption">
            <img className="icon" src={studio}></img>
          </div>
          <div className="hintTxt">玩法规则 · 尾数</div>
        </div>
        <div className="hintContent">
          <div className="txt">取自交易哈希的最后两位十六进制字符判定结果</div>
          <div className="btnOption">
            <div className="btnFlex btnRight12">
              <span className="spn1">后两位</span>
              <span className="spn2">数字+字母</span>
              <img src={blackRight} className="icon"></img>
              <span className="spn3">中</span>
            </div>
          </div>
        </div>
      </div>

      <div className="sumbitBox">
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
            <div className="computedAmount">{computedAmount()} ALGO</div>
          </div>
        </div>
        <div className="totalBox">
          <div className="headerOption">
            <div className="optionTxt">
              <div className="leftTxt">玩法</div>
              <div className="rightTxt">尾数</div>
            </div>
            <div className="optionTxt">
              <div className="leftTxt">投注金额</div>
              <div className="rightTxt">{computedAmount()} ALGO</div>
            </div>
          </div>
          <div className="totalHintTxt">
            <div className="leftTxt">合计支付</div>
            <div className="leftTxt">{computedAmount()} ALGO</div>
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
export default SingleOrDouble;
