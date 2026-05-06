import "./index.scss";
import { forwardRef, useImperativeHandle, useRef } from "react";
// import logoTop from "@/assets/home/logoTop.png";
import logoTop from "@/assets/home/logoTop.png";
import WalletBox from "../WalletBox";
import type { WalletBoxRef } from "../WalletBox";
export type HeaderFixedLoginRef = {
  initWallet: () => void;
};
type Props = {
  onLoginSuccess?: (address: string) => void; // 父组件注册回调
};
const HeaderFixedLogin = forwardRef<HeaderFixedLoginRef, Props>(
  ({ onLoginSuccess }, ref) => {
    const walletRef = useRef<WalletBoxRef>(null);

    useImperativeHandle(ref, () => ({
      initWallet() {
        walletRef.current?.initWallet();
      },
    }));
    // 登录成功后可以做额外处理
    const handleLoginSuccess = (address: string) => {
      onLoginSuccess?.(address); // 抛给 Home
    };
    return (
      <div className="headerFixedLoginBox scrolled">
        <img src={logoTop} className="logoTopIcon" />
        <WalletBox ref={walletRef} onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  },
);

export default HeaderFixedLogin;
