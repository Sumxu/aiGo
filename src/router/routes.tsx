import { lazy } from "react";
import { Navigate } from "react-router-dom";
const Wallet = lazy(() => import("@/pages/Tabbar/Wallet/index"));
const PlaceBet = lazy(() => import("@/pages/Tabbar/PlaceBet"));
const History = lazy(() => import("@/pages/Tabbar/History/index"));
export const routes = [
  { path: "/", element: <Navigate to="/Wallet" replace /> },
  { path: "/Wallet", element: <Wallet /> },
  { path: "/PlaceBet", element: <PlaceBet /> },
  { path: "/History", element: <History /> },
];