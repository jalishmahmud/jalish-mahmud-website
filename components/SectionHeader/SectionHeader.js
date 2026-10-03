import baseStyles from "./SectionHeader.module.css";
import { withDesignStyles } from "@/lib/design-styles";
const styles = withDesignStyles(baseStyles, "SectionHeader");

export default function SectionHeader({ title, subtitle }) {
  return (
    <div className={styles.header}>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
