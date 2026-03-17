"use client";
import { useState, useEffect, useCallback } from "react";
import { Asset, Liability } from "@/lib/types";

export function useAssets() {
  const [assets,  setAssets]  = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res  = await fetch("/api/assets");
    const data = await res.json();
    setAssets(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const add = async (payload: Omit<Asset, "id"|"user_id"|"updated_at">) => {
    await fetch("/api/assets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    await fetch_();
  };

  const update = async (id: string, payload: Partial<Asset>) => {
    await fetch(`/api/assets/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    await fetch_();
  };

  const remove = async (id: string) => {
    await fetch(`/api/assets/${id}`, { method: "DELETE" });
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  return { assets, loading, add, update, remove };
}

export function useLiabilities() {
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading,     setLoading]     = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res  = await fetch("/api/liabilities");
    const data = await res.json();
    setLiabilities(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const add = async (payload: Omit<Liability, "id"|"user_id"|"updated_at">) => {
    await fetch("/api/liabilities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    await fetch_();
  };

  const update = async (id: string, payload: Partial<Liability>) => {
    await fetch(`/api/liabilities/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    await fetch_();
  };

  const remove = async (id: string) => {
    await fetch(`/api/liabilities/${id}`, { method: "DELETE" });
    setLiabilities(prev => prev.filter(l => l.id !== id));
  };

  return { liabilities, loading, add, update, remove };
}
