import { useState, useEffect } from "react";
import useContractRequest from "./ContractRequest";
import { ethers } from "ethers";
import {useTranslation} from "react-i18next";

function ExchangeRate() {
    // 多语言
    const { t } = useTranslation();

    const [rate, setRate] = useState<string>("0");

    useEffect(() => {
        useContractRequest({tokenName: "MinerPool",methodsName: "matToUSDC", params: [ethers.utils.parseUnits("1",18)]}).then((res)=>{
            setRate(ethers.utils.formatUnits(res.value,6));
        })
    }, []);

    return (
        <span>{t("price.text1")}：1 MAT ≈ {rate} USDC</span>
    );
}

export default ExchangeRate;
