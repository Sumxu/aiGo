import "./index.scss";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import anquan from "@/assets/donate/anquan.png";
import NetworkRequest from "@/Hooks/NetworkRequest.ts";
import { storage } from "@/Hooks/useLocalStorage";
import {
  getDecimals,
  fromWei,
  getLastChars,
  copyText,
  getRange,
} from "@/Hooks/Utils";
import { Button, Spin } from "antd";
import ContractSend from "@/Hooks/ContractSend";
import { Dropdown, Radio, Space, InfiniteScroll } from "antd-mobile";
import NoData from "@/components/NoData";
interface listItem {
  address: string;
  amount: string;
  betType: number;
  blockHash: string;
  blockNumber: number;
  claimAmount: string;
  claimTime: string;
  createTime: string;
  ercIndex: number;
  id: number;
  multiple: number;
  payAmount: string;
  predictionContestType: number;
  status: number;
}
const History: React.FC = () => {
  const walletAddress = storage.get("address");
  const navigate = useNavigate();
  const [isMore, setIsMore] = useState<boolean>(false);
  const [listLoading, setListLoading] = useState<boolean>(false);
  const [active, setActive] = useState<number>(0);
  const [typeIndex, setTypeIndex] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [list, setList] = useState<listItem[]>([]);
  const [itemIndex, setItemIndex] = useState<number>(-999);
  const dropdownRef = useRef(null);
  const [current, setCurrent] = useState<number>(1);
  const typeList = [
    {
      label: "单双",
      value: 1,
    },
    {
      label: "尾数",
      value: 2,
    },
    {
      label: "牛牛",
      value: 3,
    },
  ];

  const typeMap = {
    1: "单双",
    2: "尾数",
    3: "牛牛",
  };
  const betTypeMap = {
    1: "单",
    2: "双",
  };
  const stautsMap = {
    0: "待开奖",
    1: "赢",
    2: "输",
    3: "和",
  };
  const [tabs, setTabs] = useState<any[]>([
    {
      label: "待开奖",
      value: 0,
    },
    {
      label: "赢",
      value: 1,
    },
    {
      label: "输",
      value: 2,
    },
    {
      label: "和",
      value: 3,
    },
  ]);
  const computedAmount = (amount) => {
    return amount * 1.95;
  };
  const bullfighting = (item) => {
    const payAmount = fromWei(item.payAmount, getDecimals());
    const submitAmount = Number(payAmount) / 10;
    console.log("submitAmount==", submitAmount);
    //赢 就是本金
    let amount = 0;
    if (item.status == 1) {
      amount = (submitAmount + submitAmount * item.multiple) * 0.95;
    } else if (item.status == 2) {
      //输 本金
      amount =
        Number(payAmount) - (submitAmount + submitAmount * item.multiple);
    } else {
      amount = payAmount;
    }
    return amount;
  };
  const dropDownClose = (item) => {
    setTypeIndex(item.value);
    setActive(0)
    dropdownRef.current?.close();
  };
  const tabChange = (tabIndex) => {
    setActive(tabIndex);
  };
  const initData = async () => {
    try {
      setList([]);
      setListLoading(true);
      const result = await NetworkRequest({
        Url: "predictionContest/myPredictionContest",
        Method: "post",
        Data: {
          current: 1,
          size: 10,
          status: active,
          predictionContestType: typeIndex,
        },
      });
      if (result.success) {
        if (result.data.data.records.length === 10) {
          setIsMore(true);
        } else {
          setIsMore(false);
        }
        setTotal(result.data.data.total);
        setList(result.data.data.records);
      }
    } catch (error) {
    } finally {
      setListLoading(false);
    }
  };
  const claimAmountChange = async (item, index) => {
    if (itemIndex == index) return;
    setItemIndex(index);
    try {
      await ContractSend({
        tokenName: "AigoPrediction",
        methodsName: "reaward",
        params: [item.id],
      });
      //延迟3秒钟去请求列表
      setTimeout(() => {
        initData();
      }, 3000);
    } catch (error) {
    } finally {
      setItemIndex(-999);
    }
  };

  // 获取更多数据信息
  const loadMoreAction = async () => {
    const nexPage = current + 1;
    setCurrent(nexPage);
    await NetworkRequest({
      Url: "predictionContest/myPredictionContest",
      Method: "post",
      Data: {
        current: nexPage,
        size: 10,
        status: active,
        predictionContestType: typeIndex,
      },
    }).then((res) => {
      if (res.success) {
        setList((prevList) => [...prevList, ...res.data.data.records]);
        if (res.data.data.records.length === 10) {
          setIsMore(true);
        } else {
          setIsMore(false);
        }
      }
    });
  };
  const openBsc = (item) => {
    const url = `https://testnet.bscscan.com/block/${item.blockNumber}`;
    copyText(url);
  };
  useEffect(() => {
    initData();
  }, [typeIndex, active]);
 
  return (
    <div className="HistoryPage">
      <div className="headerTopBox">
        <div className="historyTop">下注记录</div>
        <div className="hintOption">
          <img src={anquan} className="icon"></img>
          <div className="hintTxt">所有记录均可通过txHash在链上核验</div>
        </div>
        <div className="tabs">
          {tabs
            .filter((item) => typeIndex === 3 || item.value !== 3)
            .map((item, index) => (
              <div
                key={index}
                className={`tab ${active === index ? "active" : ""}`}
                onClick={() => tabChange(index)}
              >
                {item.label}
              </div>
            ))}

          <Dropdown className="DropdownBox" ref={dropdownRef}>
            <Dropdown.Item key="sorter" title={typeMap[typeIndex]}>
              <div style={{ padding: 12 }}>
                <Radio.Group defaultValue={typeIndex}>
                  <Space direction="vertical" block>
                    {typeList.map((item, index) => {
                      return (
                        <Radio
                          block
                          value={item.value}
                          onClick={() => dropDownClose(item)}
                        >
                          {item.label}
                        </Radio>
                      );
                    })}
                  </Space>
                </Radio.Group>
              </div>
            </Dropdown.Item>
          </Dropdown>
        </div>

        <div className="totalNumBox">
          <div className="leftTxt">
            共<span>{total}</span>记录
          </div>
          <div className="rightTxt">
            <div className="lineBlock"></div>
            <div className="hinTxt">区块链同步中</div>
          </div>
        </div>
      </div>

      <div className="listBox">
        {listLoading ? (
          <div className="spinBox">
            <Spin></Spin>
          </div>
        ) : list.length == 0 ? (
          <NoData />
        ) : (
          list.map((item, index) => {
            return (
              <div className="itemBox" key={item.id || index}>
                {" "}
                {/* 强烈建议加 key */}
                <div className="topHeaderOption">
                  <div className="leftOption">
                    <div className="typeBlock">
                      {typeMap[item.predictionContestType]}
                    </div>
                    <div
                      className={`statusBlock ${
                        item.status === 0
                          ? "statusNone"
                          : item.status === 1
                            ? "win"
                            : "lose"
                      }`}
                    >
                      {stautsMap[item.status]}
                    </div>
                  </div>
                  <div className="rightTime">{item.createTime}</div>
                </div>
                <div className="hintItemOption">
                  <div className="txt">
                    参与金额:{fromWei(item.amount, getDecimals())} ALGO
                  </div>
                  {item.predictionContestType == 1 && (
                    <div className="txt">下注:{betTypeMap[item.betType]}</div>
                  )}
                  {item.predictionContestType == 2 && (
                    <div className="txt">下注:尾数</div>
                  )}
                  {item.predictionContestType == 3 && (
                    <div className="txt">下注:牛牛</div>
                  )}
                </div>
                <div>
                  <div className="hintItemOption">
                    {item.predictionContestType == 3 ? (
                      <div className="txt">倍数:{item.multiple}</div>
                    ) : (
                      item.status == 1 && <div className="txt">倍数:1.95</div>
                    )}
                    <div className="rightOption">
                      {item.claimAmount ? (
                        <>
                          {item.status == 1 && (
                            <div className="txt">
                              已领取收益:
                              {fromWei(item.claimAmount, getDecimals())}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {item.predictionContestType == 3 && (
                            <div className="typeOption3">
                              <div className="txt">
                                可领取收益: {bullfighting(item)}
                              </div>
                              <Button
                                className="claimAmount"
                                loading={itemIndex == index}
                                onClick={() => claimAmountChange(item, index)}
                              >
                                领取
                              </Button>
                            </div>
                          )}
                          {item.predictionContestType != 3 &&
                            item.status == 1 && (
                              <div className="txt">
                                可领取收益:
                                {computedAmount(
                                  fromWei(item.amount, getDecimals()),
                                )}
                              </div>
                            )}
                          {item.status == 1 && (
                            <Button
                              className="claimAmount"
                              loading={itemIndex == index}
                              onClick={() => claimAmountChange(item, index)}
                            >
                              领取
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {item.claimAmount && (
                    <div className="claimDate">领取时间:{item.claimTime}</div>
                  )}
                </div>
                <div className="proofBox">
                  <div className="hintTxt">哈希值</div>
                  <div className="hashOption">{item.blockHash}</div>
                  <div className="endProof">
                    <div className="labelTxt">未位值:</div>
                    {item.predictionContestType == 1 && (
                      <div className="spn1">
                        {item.blockHash ? getLastChars(item.blockHash, 1) : "-"}
                      </div>
                    )}
                    {item.predictionContestType == 2 && (
                      <div className="spn1">
                        {item.blockHash ? getLastChars(item.blockHash, 2) : "-"}
                      </div>
                    )}

                    {item.predictionContestType == 3 && (
                      <div className="spnOption">
                        <div className="spn1">
                          庄家:
                          {item.blockHash
                            ? getRange(
                                item.blockHash,
                                item.blockHash.length - 5,
                                item.blockHash.length - 2,
                              )
                            : "-"}
                        </div>
                        <div className="spn1">
                          玩家:
                          {item.blockHash
                            ? getRange(
                                item.blockHash,
                                item.blockHash.length - 3,
                                item.blockHash.length,
                              )
                            : "-"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {item.status != 0 && (
                  <div className="endOption">
                    <div className="leftOption">
                      <span className="spn1">可验证</span>
                    </div>
                    <div className="rightIcon" onClick={() => openBsc(item)}>
                      复制区块地址
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        <InfiniteScroll loadMore={loadMoreAction} hasMore={isMore}>
          <div>
            {listLoading && (
              <div className="loding flex flexCenter">
                <Spin />
              </div>
            )}
          </div>
        </InfiniteScroll>
      </div>
    </div>
  );
};
export default History;
