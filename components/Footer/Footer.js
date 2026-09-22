import styles from "./Footer.module.css";
import data from "@/data/footer.json";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <p>{data.copyright}</p>
      </div>
    </footer>
  );
}
