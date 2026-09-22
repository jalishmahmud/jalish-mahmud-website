import styles from "./SectionHeader.module.css";

export default function SectionHeader({ title, subtitle }) {
  return (
    <div className={styles.header}>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
