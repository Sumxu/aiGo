import {useState,useEffect} from "react";
import ContractRequest from "./ContractRequest.ts";
import {DecSubt} from "./Utils.ts";
import {ethers} from "ethers";
interface ExchangePriceProps {
    amount:string;
}
function ExchangePrice(Props:ExchangePriceProps) {
    const [Price,setPrice] = useState<string>("0");
    useEffect(()=>{
        if(Props.amount && Props.amount !== "0") {
            ContractRequest({tokenName: "MinerPool",methodsName: "matToUSDC",params:[ethers.utils.parseUnits(Props.amount,18)]}).then((res)=>{
                setPrice(ethers.utils.formatUnits(res.value,6));
            });
        }else{
            setPrice("0");
        }
    },[Props.amount]);
    return(
        <span>{DecSubt(Price,10)}</span>
    );
}

export default ExchangePrice;