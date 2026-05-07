"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Nav from "../components/common/Nav";
import Footer from "../components/footer";
import Analytics from "../components/Analytics";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const [toggle, setToggle] = useState(false);
  const pathname = usePathname();
  const isLoyaltyBot = pathname === "/loyalty_bot";

  return (
    <>
      {process.env.NODE_ENV === "production" && <Analytics />}
      <div
        className={`mx-auto flex min-h-screen w-full max-w-screen-2xl flex-col ${
          isLoyaltyBot ? "bg-[#1a2081] text-white" : "bg-vl-cream text-vl-ink"
        }`}
        style={
          isLoyaltyBot
            ? { backgroundColor: "#1a2081", color: "#ffffff" }
            : { backgroundColor: "#f4efe6", color: "#14100d" }
        }
      >
        <main
          className={`content flex w-full flex-1 flex-col min-h-0 ${isLoyaltyBot ? "bg-[#1a2081]" : "bg-transparent"}`}
        >
          <div className="nav-container min-h-[5rem] shrink-0">
            <Nav setToggle={setToggle} toggle={toggle} />
          </div>

          <div className="item-container relative min-h-min flex-1 overflow-x-visible overflow-y-visible">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </>
  );
}
