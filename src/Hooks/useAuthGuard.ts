import { useEffect, useState } from "react";
import { storage } from "@/Hooks/useLocalStorage";
import { useNavigate, useLocation } from "react-router-dom";
import { isWalletConnected } from "@/Hooks/useWalletStatus";
import { ensureWalletConnected } from "@/Hooks/walletHooks/wallet";
import { userAddress } from "@/Store/chainStore";

export function useAuthGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  const wallet = storage.get('address');

  const [ready, setReady] = useState(false);
  const [invite, setInvite] = useState<string | null>(null); // 新增 invite 状态

  useEffect(() => {
    const init = async () => {
      // -----------------------------
      // 1️⃣ 先检查 URL 是否有 invite 参数
      const params = new URLSearchParams(location.search);
      const inviteParam = params.get("invite");
      if (inviteParam) {
        setInvite(inviteParam);           // 保存到 state
        storage.set("invite", inviteParam); // 可选：存本地
      }

      // -----------------------------
      const token = storage.get("token", "");
      const account = await isWalletConnected();

      // 2️⃣ token 不存在 → 去登录
      if (!token) {
        setReady(true);
        if (location.pathname !== "/login") navigate("/login");
        return;
      }

      // 3️⃣ 钱包未连接 → 去登录
      if (!account) {
        setReady(true);
        if (location.pathname !== "/login") navigate("/login");
        return;
      }

      // 4️⃣ 钱包有 account 但 store 里还没同步地址
      if (!wallet) {
        await ensureWalletConnected();
      }

      setReady(true);

      // 如果现在停在登录页 → 自动跳 home
      if (location.pathname === "/login") navigate("/nft");
    };

    init();
  }, []);

  // 返回 ready 和 invite
  return { ready, invite };
}
