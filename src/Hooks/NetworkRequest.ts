// NetworkRequest.ts
import { message } from "antd";
import EnvManager from "@/config/EnvManager";
const RequestUrl = EnvManager.apiBase;
import { storage } from "@/Hooks/useLocalStorage";
import { t } from "i18next";

interface NetWorkProps {
  Url: string;
  Method?: "get" | "post" | "put" | "delete";
  Data?: Record<string, any>;
  showLoading?: boolean;
}

async function NetworkRequest(params: NetWorkProps): Promise<any> {
  const { Url, Method = "get", Data = {} } = params;

  let url = Url;
  const method = Method.toLowerCase();
  const key = "globalLoading";
  try {
    if (method === "get" && Object.keys(Data).length > 0) {
      const queryString = new URLSearchParams(Data).toString();
      url += "?" + queryString;
    }
    const response = await fetch(RequestUrl + url, {
      method: method.toUpperCase(),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer" + " " + storage.get("sign", ""),
      },
      body: method === "get" ? null : JSON.stringify(Data),
    });
    const result = await response.json();
    if (result.code === 401) {
      storage.remove("sign");
      // location.replace("/Home");
    } else if (!response.ok || result.code !== 200) {
      throw new Error(result.msg || t("请求错误"));
    }
    return { success: true, data: result };
  } catch (error: any) {
    message.error({
      content: t("请求错误") + (error.message || error),
      key,
    });
    return { success: false, error: error.message || error };
  }
}

export default NetworkRequest;
