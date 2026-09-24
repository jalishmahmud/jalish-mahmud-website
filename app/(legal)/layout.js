import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import styles from "./legal.module.css";

export default function LegalLayout({ children }) {
  return <><Header /><main className={`container ${styles.page}`}><article>{children}</article></main><Footer /></>;
}
