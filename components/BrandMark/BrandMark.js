import { brandAssets } from "@/lib/brand-assets";
import styles from "./BrandMark.module.css";

const backgrounds = {
  "--brand-icon-classic": `url(${brandAssets.favicon.classic})`,
  "--brand-icon-v2": `url(${brandAssets.favicon.v2})`,
};

export default function BrandMark({ className = "" }) {
  return <span className={`${styles.mark} ${className}`} style={backgrounds} aria-hidden="true" />;
}
