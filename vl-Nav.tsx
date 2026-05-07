"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { RxHamburgerMenu } from "react-icons/rx";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavProps {
  setToggle: (value: boolean) => void;
  toggle: boolean;
}

const Nav = ({ setToggle, toggle }: NavProps) => {
  const pathname = usePathname();
  const isLoyaltyBot = pathname === "/loyalty_bot";
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const pathActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const desktopShell =
    "inline-flex min-h-[2.25rem] items-center justify-center rounded-full px-3.5 py-2 text-[0.9375rem] font-semibold leading-snug transition-colors duration-200";

  const desktopIdle = isLoyaltyBot
    ? "text-white/90 hover:bg-white/10 hover:text-white"
    : "text-vl-cream/90 hover:bg-white/10 hover:text-vl-cream";

  const desktopActive = isLoyaltyBot
    ? "bg-white/15 text-white ring-1 ring-white/30"
    : "bg-vl-cream text-vl-brown-dark shadow-sm ring-1 ring-vl-brown/25";

  const desktopClass = (href: string) =>
    `${desktopShell} ${pathActive(href) ? desktopActive : desktopIdle}`;

  const productsActive = pathname.startsWith("/products") || pathname === "/tools";
  const productsBtnClass = `${desktopShell} ${
    productsActive ? desktopActive : desktopIdle
  }`;

  const mobileShell =
    "inline-flex min-h-[2.125rem] items-center justify-center rounded-full px-3 py-2 text-sm font-semibold leading-snug transition-colors duration-200";
  const mobileClass = (href: string) =>
    `${mobileShell} ${pathActive(href) ? desktopActive : desktopIdle}`;

  const navIcon =
    "text-1xl rounded-full p-1 " +
    (isLoyaltyBot
      ? "text-white hover:bg-white/10 hover:text-white"
      : "text-vl-cream hover:bg-white/10 hover:text-vl-cream");

  const drawerShell =
    "block w-full rounded-full px-3.5 py-2 text-center text-[0.9375rem] font-semibold leading-snug transition-colors duration-200";
  const drawerIdle = isLoyaltyBot
    ? "text-white/90 hover:bg-white/10"
    : "text-vl-ink hover:bg-vl-cream-muted/80 hover:text-vl-brown-dark";
  const drawerActive = isLoyaltyBot
    ? "bg-white/15 text-white ring-1 ring-white/30"
    : "bg-vl-cream text-vl-brown-dark ring-1 ring-vl-brown/25";
  const drawerNavClass = (href: string) =>
    `${drawerShell} ${pathActive(href) ? drawerActive : drawerIdle}`;

  const dropdownPanel =
    "w-fit whitespace-nowrap rounded-lg border p-4 text-sm shadow-lg " +
    (isLoyaltyBot
      ? "border-white/20 bg-[#0f145c] text-white"
      : "border-vl-brown/20 bg-vl-cream-deep text-vl-ink");
  const dropdownCategory =
    "cursor-pointer text-base font-bold " +
    (isLoyaltyBot ? "text-white/70 hover:text-white" : "text-vl-ink-muted hover:text-vl-brown-dark");
  const dropdownItem = (isGames: boolean) =>
    "text-sm font-medium transition-colors duration-200 " +
    (isLoyaltyBot
      ? isGames
        ? "text-sky-300 hover:text-sky-200"
        : "text-white/90 hover:text-white"
      : isGames
        ? "text-vl-brown-light hover:text-vl-brown"
        : "text-vl-ink hover:text-vl-brown");

  const links = [
    {
      category: "Productivity",
      items: [
        { name: "Voltis Core", route: "/tools" },
        { name: "NotepadPro", route: "/notepadpro" },
        { name: "Pinnacle Transfer", route: "/pinnacle-transfer" },
        { name: "Clipstack", route: "/clipstack" },
        { name: "Toolkit", route: "/bg" },
        { name: "Loyalty Bot", route: "/loyalty_bot" },
      ],
    },
    {
      category: "Fashion",
      items: [
        { name: "Wearhouse", route: "/wearhouse" },
        { name: "Outfeatz", route: "/outfeatz" },
        { name: "Afrogarm", route: "/afrogarm" },
      ],
    },
    {
      category: "Lifestyle",
      items: [{ name: "PONY", route: "https://myponyapp.com/" }],
    },
    {
      category: "Games",
      items: [
        { name: "Games Home", route: "https://voltislabsgames.com/" },
        { name: "Spinnersonic", route: "/spinner" },
        { name: "Spellcheck", route: "/spellcheck" },
      ],
    },
    {
      category: "Social Media",
      items: [{ name: "VModel", route: "/vmodel" }],
    },
  ];

  /** Mobile hamburger: productivity before fashion (stable order, not index-fragile). */
  const linksMobile = (
    [
      "Productivity",
      "Fashion",
      "Lifestyle",
      "Games",
      "Social Media",
    ] as const
  )
    .map((name) => links.find((c) => c.category === name))
    .filter((c): c is (typeof links)[number] => c != null);

  useEffect(() => {
    if (toggle) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [toggle]);

  /* Opening the drawer locks body scroll; ensure any navigation clears it so subpages are usable */
  useEffect(() => {
    setToggle(false);
    setDropdownOpen(false);
  }, [pathname]);

  return (
    <div
      className={`fixed left-0 right-0 top-0 z-40 border-b backdrop-blur-sm ${
        isLoyaltyBot
          ? "border-transparent bg-[#1a2081]/95 text-white"
          : "border-vl-brown/30 bg-vl-brown-dark text-vl-cream"
      }`}
    >
      <div className="mx-auto flex min-h-[5rem] w-full max-w-screen-2xl items-center justify-between px-6 text-sm md:px-16">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Link href="/">
            <Image
              src="/icons/voltis.svg"
              alt="logo"
              width={90}
              height={80}
              className={`hidden md:block ${isLoyaltyBot ? "" : "brightness-0 invert"}`}
            />
            <Image
              src="/icons/voltis.svg"
              alt="logo"
              width={85}
              height={85}
              className={`block md:hidden ${isLoyaltyBot ? "" : "brightness-0 invert"}`}
            />
          </Link>
        </motion.div>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 transform flex-row items-center gap-3 text-nowrap pl-10 lg:flex xl:pl-0">
          <Link href="/" className={desktopClass("/")}>
            Home
          </Link>
          <div
            className="group relative inline-block"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <Link href="/products" className={productsBtnClass}>
              Products
            </Link>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  className={`absolute left-0 right-0 top-full flex flex-col items-center p-4 ${
                    isLoyaltyBot ? "text-white" : "text-vl-ink"
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div className={dropdownPanel}>
                    <div className="flex flex-row justify-center gap-8">
                      {links.map((category) => (
                        <div key={category.category} className="relative flex min-w-[9rem] flex-col items-start">
                          <div className={`${dropdownCategory} text-left`}>{category.category}</div>
                          <div className="mt-2 w-full">
                            <ul className="flex flex-col gap-2 text-left">
                              {category.items.map((item) => (
                                <li key={item.name}>
                                  <a
                                    href={item.route}
                                    className={dropdownItem(item.name === "Games Home")}
                                    target={item.route.startsWith("http") ? "_blank" : undefined}
                                    rel={item.route.startsWith("http") ? "noopener noreferrer" : undefined}
                                  >
                                    {item.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link href="/blog" className={desktopClass("/blog")}>
            News Blog
          </Link>
          <Link href="/Aboutus" className={desktopClass("/Aboutus")}>
            About Us
          </Link>
          <Link href="/contact-us" className={desktopClass("/contact-us")}>
            Contact Us
          </Link>
        </nav>

        <div className="flex items-center space-x-3 sm:space-x-5 md:space-x-6 lg:hidden">
          <Link href="/" className={mobileClass("/")}>
            Home
          </Link>
          <Link href="/products" className={productsBtnClass}>
            Products
          </Link>
          <button type="button" className={navIcon} onClick={() => setToggle(!toggle)}>
            <RxHamburgerMenu size={25} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {toggle && (
          <>
            <motion.nav
              className="fixed left-0 top-0 z-50 flex h-screen w-[60%] flex-col bg-vl-cream-deep px-6 py-20 text-vl-ink sm:w-[50%]"
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="absolute top-5">
                <Image src="/icons/voltis.svg" alt="logo" width={75} height={75} className="block md:hidden" />
              </span>
              <button
                type="button"
                className={`absolute right-6 top-5 text-2xl ${
                  isLoyaltyBot ? "text-white hover:text-white/85" : "text-vl-ink hover:text-vl-brown"
                }`}
                onClick={() => setToggle(false)}
              >
                ✕
              </button>

              <div className="no-scrollbar max-h-[35rem] flex-grow overflow-y-auto py-5">
                {linksMobile.map((category) => (
                  <div key={category.category} className="mb-6">
                    <h3
                      className={`mb-4 text-lg font-bold ${
                        isLoyaltyBot ? "text-white/70" : "text-vl-ink-muted"
                      }`}
                    >
                      {category.category}
                    </h3>
                    <ul className="space-y-2">
                      {category.items.map((item) => (
                        <li key={item.name}>
                          <a
                            href={item.route}
                            className={`block ${dropdownItem(item.name === "Games Home")}`}
                            onClick={() => setToggle(false)}
                            target={item.route.startsWith("http") ? "_blank" : undefined}
                            rel={item.route.startsWith("http") ? "noopener noreferrer" : undefined}
                          >
                            {item.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                <div className="flex flex-col space-y-2">
                  <Link href="/blog" onClick={() => setToggle(false)} className={drawerNavClass("/blog")}>
                    News Blog
                  </Link>
                  <Link href="/Aboutus" onClick={() => setToggle(false)} className={drawerNavClass("/Aboutus")}>
                    About Us
                  </Link>
                  <Link href="/contact-us" onClick={() => setToggle(false)} className={drawerNavClass("/contact-us")}>
                    Contact Us
                  </Link>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 w-full border-t border-vl-brown/15 bg-vl-cream py-4 pl-6">
                <p className="text-sm text-vl-ink-muted">
                  © 2026 Voltis Labs. <br /> All rights reserved.
                </p>
              </div>
            </motion.nav>

            <motion.div
              className="fixed right-0 top-0 z-40 h-screen w-[40%] bg-vl-brown/20 backdrop-blur-sm sm:w-[50%]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setToggle(false)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Nav;
