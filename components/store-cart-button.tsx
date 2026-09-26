"use client";

import { useState } from "react";

type CartItem = { productId: string; slug: string; name: string; price: number; currency: string; imageUrl?: string; quantity: number };

export function StoreCartButton({ item }: { item: Omit<CartItem, "quantity"> }) {
  const [added, setAdded] = useState(false);
  function add() {
    const raw = localStorage.getItem("dnc-cart");
    const parsed = raw ? JSON.parse(raw) : []; const cart: CartItem[] = Array.isArray(parsed) ? parsed.filter((x) => x && typeof x.productId === "string" && Number.isFinite(Number(x.quantity)) && Number(x.quantity) > 0) : [];
    const existing = cart.find((x) => x.productId === item.productId);
    if (existing) existing.quantity += 1;
    else cart.push({ ...item, quantity: 1 });
    localStorage.setItem("dnc-cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("dnc-cart-updated"));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }
  return <button className="primary-btn" type="button" onClick={add}>{added ? "تمت الإضافة" : "أضف إلى السلة"}</button>;
}
