import Link from "next/link";
import styles from "./Footer.module.css";
import data from "@/data/footer.json";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.content}`}>
        <p>{data.copyright}</p>
        <nav aria-label="Legal">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-and-conditions">Terms and Conditions</Link>
        </nav>
      </div>
    </footer>
  );
}
