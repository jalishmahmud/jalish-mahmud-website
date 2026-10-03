import FloatingContact from "@/components/Contact/FloatingContact";
import Link from "next/link";
import baseStyles from "./Footer.module.css";
import { withDesignStyles } from "@/lib/design-styles";
const styles = withDesignStyles(baseStyles, "Footer");
import data from "@/data/footer.json";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <FloatingContact />
      <div className={`container ${styles.content}`}>
        <p>{data.copyright}</p>
        <nav aria-label="Footer">
          <Link href="/contact">Contact</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-and-conditions">Terms and Conditions</Link>
        </nav>
      </div>
    </footer>
  );
}
