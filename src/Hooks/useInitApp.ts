// hooks/useInitApp.ts
import { useEffect, useState } from "react";
import { dbPromise } from "@/Idb/db";
import {
  addGlobal,
  getGlobal,
  updateGlobal,
} from "@/Idb/Servers/globalService";
import chainConfig from "@/config/chainListData.ts";
import { useChainStore } from "@/Store/chainStore";

export const useInitApp = () => {
  const [loading, setLoading] = useState(true);
  // 获取 store 方法
  const initChainId = useChainStore((s) => s.initChainId);
  useEffect(() => {
    const init = async () => {
      const db = await dbPromise;
      const global = await getGlobal(1);
      if (!global) {
        await addGlobal({
          id: 1,
          chainId: chainConfig[0].chainId,
          chainConfigId: chainConfig[0].chainConfigId,
          rpc: chainConfig[0].rpcUrl,
          contractAddress: "",
          baseToken: "1",
          pool: "1",
          gasPrice: "1",
          briberyPrice: "1",
        });
      } else {
        updateGlobal(1, {
          chainId: chainConfig[0].chainId,
          chainConfigId: chainConfig[0].chainConfigId,
          rpc: chainConfig[0].rpcUrl,
        });
      }
      // 初始化 chain
      await initChainId();
      setLoading(false);
    };
    init();
  }, [initChainId]);
  return { loading };
};
