"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";
import Image from "next/image";
import BrandMark from "@/components/BrandMark/BrandMark";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import { brandAssets } from "@/lib/brand-assets";
import data from "@/data/header.json";
import baseStyles from "./Header.module.css";
import { withDesignStyles } from "@/lib/design-styles";
const styles = withDesignStyles(baseStyles, "Header");

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const resolveHref = (href) => href.startsWith("#") && pathname !== "/" ? `/${href}` : href;

  return (
    <header className={styles.header}>
      <div className="container">
        <nav className={styles.nav}>
          <Link
            href="/"
            className={styles.logo}
            onNavigate={() => {
              setMenuOpen(false);
              if (pathname === "/") window.scrollTo({ top: 0, left: 0, behavior: "instant" });
            }}
          >
            <BrandMark className={styles.logoIcon} />
            <span className={styles.logoName}>
              <Image src={brandAssets.wordmark} alt={data.logo} width={595} height={182} className={styles.logoWordmark} loading="eager" />
            </span>
          </Link>
          <ul className={styles.links}>
            {data.links.map(([label, href]) => (
              <li key={href}>
                <Link href={resolveHref(href)} onClick={() => setMenuOpen(false)}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            <ThemeToggle />
            <Link href="/contact" className="btn btnPrimary">
              {data.contactLabel}
            </Link>
            <button
              className={styles.menuButton}
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
            </button>
          </div>
        </nav>
        {menuOpen && (
          <ul className={styles.mobileLinks}>
            {data.links.map(([label, href]) => (
              <li key={href}>
                <Link href={resolveHref(href)} onClick={() => setMenuOpen(false)}>
                  {label}
                </Link>
              </li>
            ))}
            <li><Link href="/contact" onClick={() => setMenuOpen(false)}>{data.contactLabel}</Link></li>
          </ul>
        )}
      </div>
    </header>
  );
}
