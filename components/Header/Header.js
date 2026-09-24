"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import data from "@/data/header.json";
import hero from "@/data/hero.json";
import styles from "./Header.module.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const resolveHref = (href) => href.startsWith("#") && pathname !== "/" ? `/${href}` : href;

  return (
    <header className={styles.header}>
      <div className="container">
        <nav className={styles.nav}>
          <Link href={resolveHref("#about")} className={styles.logo}>
            <span className={styles.logoIcon} aria-hidden="true">{data.logoMark}</span>
            <span>{data.logo}</span>
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
            <a href={`mailto:${hero.email}`} className="btn btnPrimary">
              {data.contactLabel}
            </a>
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
            <li><a href={`mailto:${hero.email}`}>{data.contactLabel}</a></li>
          </ul>
        )}
      </div>
    </header>
  );
}
