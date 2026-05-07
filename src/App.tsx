import "./App.css";
import { useEffect, useState, useRef, useCallback } from "react";
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
  // 用于保存清理函数
  const cleanupRef = useRef<(() => void) | null>(null);
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

  const checkWallet = useCallback(async () => {
    console.log('1----------')
    // storage.set("sign", null);
    // storage.set("address", null);
    // 注册监听并保存清理函数
    const cleanup = listenWalletEvents(navigate);
    if (cleanup) {
      cleanupRef.current = cleanup;
    }
    navigate("/Wallet");
  }, []);

  useEffect(() => {
    checkWallet();
    // 组件卸载时清理监听器
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []); // 推荐依赖 checkWallet（因为它是 useCallback）
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
