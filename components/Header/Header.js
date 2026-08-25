import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import ClientOnly from "@/components/ClientOnly/ClientOnly";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className="container">
        <nav className={styles.nav}>
          <Link href="#about" className={styles.logo}>
            <span className={styles.logoIcon}>&lt;/&gt;</span>
            <span>Jalish Mahmud</span>
          </Link>
          <ul className={styles.links}>
            <li>
              <Link href="#about">About</Link>
            </li>
            <li>
              <Link href="#skills">Skills</Link>
            </li>
            <li>
              <Link href="#experience">Experience</Link>
            </li>
            <li>
              <Link href="#projects">Projects</Link>
            </li>
            <li>
              <Link href="#blog">Blog</Link>
            </li>
          </ul>
          <div className={styles.actions}>
            <ClientOnly>
              <ThemeToggle />
            </ClientOnly>
            <a href="mailto:jalish93@gmail.com" className="btn btnPrimary">
              Contact Me
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
