import "./index.scss";
import React from "react";
import { t } from "i18next";
import { Empty } from "antd-mobile";
const NoData: React.FC = () => {
  return (
    <div className="no-data">
      <Empty description={t("暂无数据")} />
    </div>
  );
};
export default NoData;
