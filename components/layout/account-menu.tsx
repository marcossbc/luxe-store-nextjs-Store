"use client";

import Link from "next/link";
import { ChevronDown, Headphones, Heart, LogOut, MapPin, User, UserRound } from "lucide-react";
import { HeaderDropdown } from "@/components/layout/header-dropdown";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

const initialsOf = (name: string) => name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

/** Header account block: "Sign in / Register" for visitors, the customer's own name once signed in. */
export function AccountMenu() {
  const { user, logout } = useAuth();
  const first = user?.name.split(" ")[0] ?? "";

  return (
    <HeaderDropdown
      id="account-menu"
      label="Account menu"
      align="right"
      width={300}
      triggerClassName="flex items-center gap-2 rounded-full py-1.5 pl-2 pr-3 text-left text-white transition-colors hover:bg-white/10"
      trigger={(open) =>
        user ? (
          <>
            <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#FFEBB0] via-[#EBA43C] to-[#B45309] text-[13px] font-bold text-neutral-900">{initialsOf(user.name) || <UserRound size={16} />}</span>
            <span className="hidden leading-tight xl:block">
              <span className="block text-[11px] text-white/60">Welcome back</span>
              <span className="block max-w-[9rem] truncate text-sm font-semibold" data-testid="header-user-name">{first}</span>
            </span>
            <ChevronDown size={14} className={cn("hidden text-white/60 transition-transform xl:block", open && "rotate-180")} />
          </>
        ) : (
          <>
            <User size={22} />
            <span className="hidden leading-tight xl:block">
              <span className="block text-[11px] text-white/60">Welcome</span>
              <span className="block text-sm font-semibold">Sign in / Register</span>
            </span>
            <ChevronDown size={14} className={cn("hidden text-white/60 transition-transform xl:block", open && "rotate-180")} />
          </>
        )
      }
    >
      {(close) =>
        user ? (
          <div className="p-2">
            <div className="px-3 pb-3 pt-2">
              <div className="truncate font-semibold">{user.name}</div>
              <div className="truncate text-xs text-muted-foreground">{user.email}</div>
            </div>
            <div className="border-t pt-2">
              {[{ l: "My profile", h: "/profile", I: UserRound }, { l: "My orders", h: "/profile", I: MapPin }, { l: "Wishlist", h: "/wishlist", I: Heart }, { l: "Customer support", h: "/contact", I: Headphones }].map(({ l, h, I }) => (
                <Link key={l} href={h} onClick={close} className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm hover:bg-accent"><I size={16} className="text-muted-foreground" /> {l}</Link>
              ))}
            </div>
            <div className="mt-1 border-t pt-2">
              <button type="button" onClick={async () => { close(); await logout(); }} className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm text-rose-500 hover:bg-accent"><LogOut size={16} /> Sign out</button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex gap-2">
              <Link href="/register" onClick={close} className="flex h-10 flex-1 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90">Register</Link>
              <Link href="/login" onClick={close} className="flex h-10 flex-1 items-center justify-center rounded-full border text-sm font-semibold transition-colors hover:bg-accent">Sign in</Link>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Create an account to place orders, save your wishlist and follow your deliveries.</p>
          </div>
        )
      }
    </HeaderDropdown>
  );
}
