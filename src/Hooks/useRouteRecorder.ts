// hooks/useRouteRecorder.ts
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { storage } from "@/Hooks/useLocalStorage";

const STORAGE_KEY = "lastVisitedPath";

export function useRouteRecorder() {
  const location = useLocation();
  const [lastPath, setLastPath] = useState<string>(() => {
    return storage.get(STORAGE_KEY) || "/";
  });

  // 每次路径变化时记录完整路径（包括 search 和 hash）
  useEffect(() => {
    const currentPath = location.pathname + location.search + location.hash;
    storage.set(STORAGE_KEY, currentPath);
    setLastPath(currentPath);
  }, [location]);

  // 获取上一次记录的路径
  const getLastPath = () => {
    return storage.get(STORAGE_KEY) || "/";
  };

  return { lastPath, getLastPath };
}
