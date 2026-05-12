import type { FC } from "react";
import "@/App.css";
import "./index.scss";
import { TabBar } from "antd-mobile";
import { t } from "i18next";
import wallet from "@/assets/tabbar/wallet.png";
import list from "@/assets/tabbar/list.png";
import listCheck from "@/assets/tabbar/listCheck.png";
import walletCheck from "@/assets/tabbar/walletCheck.png";
import placeBet from "@/assets/tabbar/placeBet.png";
import placeBetCheck from "@/assets/tabbar/placeBetCheck.png";
import { useNavigate, useLocation } from "react-router-dom";
import { storage } from "@/Hooks/useLocalStorage";
import { Totast } from "@/Hooks/Utils";
import { userAddress } from "@/Store/Store";
import tabbarHome from "@/assets/basic/tabbarHome.png";
const TaBbarBottom: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const setRouteActive = (value: string) => {
    //如果没有签名就不能登录
    if (storage.get("sign")) {
      navigate(value);
    } else {
      Totast("请先链接钱包", "info");
    }
  };
  const tabs = [
    {
      key: "/Wallet",
      keys: "/Wallet/",
      title: t("钱包"),
      icon: { default: wallet, active: walletCheck },
      // icon: { default: home, active: homeActive },
    },
    {
      key: "/PlaceBet",
      keys: "/PlaceBet/",
      title: "下注",
      icon: { default: placeBet, active: placeBetCheck },
    },
    {
      key: "/History",
      keys: "/History/",
      title: "记录",
      icon: { default: list, active: listCheck },
    },
  ];
  return (
    <TabBar
      className="custom-tabbar"
      activeKey={pathname}
      safeArea
      onChange={(value) => setRouteActive(value)}
    >
      {tabs.map((item) => (
        <TabBar.Item
          key={item.key}
          title={
            <span
              style={{
                color:
                  pathname === item.key || pathname === item.keys
                    ? "#FFFFFF"
                    : "#676B8F",
              }}
            >
              {item.title}
            </span>
          }
          icon={
            <img
              src={
                pathname === item.key || pathname === item.keys
                  ? item.icon.active
                  : item.icon.default
              }
              style={{ width: 20, height: 20 }}
              alt={item.title}
            />
          }
        />
      ))}
    </TabBar>
  );
};
export default TaBbarBottom;
