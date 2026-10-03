import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import baseStyles from "./legal.module.css";
import { withDesignStyles } from "@/lib/design-styles";
const styles = withDesignStyles(baseStyles, "legal");

export default function LegalLayout({ children }) {
  return <><Header /><main className={`container ${styles.page}`}><article>{children}</article></main><Footer /></>;
}
