import "./App.css";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Spin } from "antd";
import EnvManager from "@/config/EnvManager";
import TaBbarBottom from "@/components/TaBbarBottom";
import AppRouter from "@/router";
import { listenWalletEvents } from "@/Hooks/WalletHooks";
import { userAddress } from "@/Store/Store";
import { storage } from "@/Hooks/useLocalStorage";
EnvManager.print();
function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAddress } = userAddress.getState();
  // 是否显示底部 Tab
  const showTab = [
    "/Wallet",
    "/Wallet/",
    "/History",
    "/History/",
    "/PlaceBet",
    "/PlaceBet/",
    "/My",
    "/My/",
  ].includes(location.pathname);
  const checkWallet = async () => {
    storage.set("sign", null);
    storage.set("address", null);
    listenWalletEvents(navigate);
    navigate("/Wallet");
  };
  useEffect(() => {
    checkWallet();
    // 只注册一次全局监听
  }, []);
  return (
    <div className="app">
      <div className="body">
        <AppRouter />
      </div>
      {showTab && (
        <div className="bottom">
          <TaBbarBottom />
        </div>
      )}
    </div>
  );
}

export default App;
