"use client";

import { motion } from "framer-motion";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartContext } from "@/components/layout/cart-provider";
import { useToast } from "@/components/layout/toast-provider";
import { formatPrice } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/lib/types";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartContext();
  const { toast } = useToast();

  const handleRemove = () => {
    removeItem(item.id);
    toast("Item removed from cart", "info");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="flex gap-4 p-4 rounded-2xl border bg-card shadow-sm"
    >
      <img src={item.image} alt={item.name} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{item.category}</p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 border rounded-lg bg-background px-1">
            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:text-foreground text-muted-foreground" disabled={item.quantity <= 1}>
              <Minus size={14} />
            </button>
            <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:text-foreground text-muted-foreground" disabled={item.quantity >= item.maxQuantity}>
              <Plus size={14} />
            </button>
          </div>
          <div className="text-right">
            <div className="font-bold text-foreground">{formatPrice(item.price * item.quantity)}</div>
            <div className="text-xs text-muted-foreground">{formatPrice(item.price)} each</div>
          </div>
        </div>
      </div>
      <button onClick={handleRemove} className="p-2 h-fit rounded-lg hover:bg-accent text-muted-foreground hover:text-destructive transition-colors">
        <Trash2 size={18} />
      </button>
    </motion.div>
  );
}
