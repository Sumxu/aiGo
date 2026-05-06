import "./index.scss";
import type { FC } from "react";
import { useState } from "react";
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
const Cow: FC = () => {
  const walletAddress = storage.get("address");
  const amounts = [10, 100, 500, 1000, 5000, 100000];
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [selected, setSelected] = useState<number>(10);
  const [betType, setBetType] = useState<number>(1); //下注的牛倍数
  const computedAmount = () => {
    return selected * 10; 
  };
  
  const submitClick = async () => {
    setBtnLoading(true);
    try {
    const payAmount=computedAmount()
      let amount = toWei(payAmount.toString(), getDecimals());
      let isApply = false;
      let applyAmount = 0n;
      await ContractRequest({
        tokenName: "AIgoToken",
        methodsName: "allowance",
        params: [walletAddress, ContractList["AigoPrediction"].address],
      }).then((res) => {
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
              amount, 
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
        methodsName: "bullfightingMint",
        params: [walletAddress, amount, 0],
      });
        Totast("购买成功", "success"); // 检查授权或者授权时发生了错误，请检查网络后重新尝试
    } catch (error) {
    } finally {
      setBtnLoading(false);
    }
  };
  return (
    <div className="CowPage">
      <div className="hintBox">
        <div className="headerTopOption">
          <div className="blockOption">
            <img className="icon" src={studio}></img>
          </div>
          <div className="hintTxt">玩法规则 · 牛牛</div>
        </div>
        <div className="hintContent">
          <div className="txt">
            <span>玩家投入:</span>
            投注金额为玩家转账金额(本金)的10%；假设玩家转账1000，那么他的投注金额就为100。
          </div>
          <div className="txt">
            <span>开奖来源:</span>使用交易哈希（txHash）的最后五位十六进制字符
            D1 D2 D3 D4 D5 作为原始开奖数据
          </div>
          <div className="txt">
            <span>点数计算:</span> 庄家点数 = value(D1) + value(D2) +
            value(D3)，玩家点数 = value(D3) + value(D4)+ value(D5)（D3
            为双方共有位）
          </div>
          <div className="txt">
            <span>最终点数:</span> 对每方点数取模 10（sum % 10），所得结果 0
            表示“牛牛”（最大），1-9 表示牛一至牛九
          </div>
          <div className="txt">
            <span>特殊平局与比较规则:</span>{" "}
            1.当结果为牛一或牛二且玩家与平台点数相同时，平台判定为胜（玩家不中奖）2.当结果为牛三及以上且玩家与平台点数相同时，按各自三位中的字母/数字逐位比较大小（字母视作
            10，数字按其数值；0
            为最小），较大者胜；若仍全位相同则进入下一条规则。
            3.若在牛三及以上的比较中双方三位逐位完全相同（即无法分胜负），则视为和局
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
            <div className="expectNum">{computedAmount()}X</div>
            <div className="computedAmount">{computedAmount()} ALGO</div>
          </div>
        </div>
        <div className="totalBox">
          <div className="headerOption">
            <div className="optionTxt">
              <div className="leftTxt">玩法</div>
              <div className="rightTxt">牛牛</div>
            </div>
            <div className="optionTxt">
              <div className="leftTxt">投注金额</div>
              <div className="rightTxt">{selected} ALGO</div>
            </div>
             <div className="optionTxt">
              <div className="leftTxt">押金</div>
              <div className="rightTxt">{computedAmount()-selected} ALGO</div>
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
export default Cow;
