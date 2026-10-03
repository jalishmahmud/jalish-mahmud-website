import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaGithub, FaLinkedinIn } from "react-icons/fa";
import profile from "@/data/hero.json";
import { siteConfig } from "@/lib/site-config";
import baseStyles from "./Contact.module.css";
import { withDesignStyles } from "@/lib/design-styles";
const styles = withDesignStyles(baseStyles, "Contact");

export default function ContactInfo() {
  const phone = profile.phone.replace(/\(\+88\)/, "+88").replace(/[^+\d]/g, "");
  return <aside className={styles.info} aria-label="Contact information">
    <div className={styles.identity}><span className={styles.availability}>{profile.availability}</span><h2>{siteConfig.fullName}</h2><p>{siteConfig.jobTitle}</p></div>
    <a className={styles.infoCard} href={`mailto:${profile.email}`}><FaEnvelope aria-hidden="true" /><span><strong>Email</strong><span>{profile.email}</span><small>Send email →</small></span></a>
    <a className={styles.infoCard} href={`tel:${phone}`}><FaPhone aria-hidden="true" /><span><strong>Phone</strong><span>{profile.phone}</span><small>Call →</small></span></a>
    <div className={styles.infoCard}><FaMapMarkerAlt aria-hidden="true" /><span><strong>Location</strong><span>{profile.location}</span></span></div>
    <h2>Connect with me</h2>
    <div className={styles.socials}><a className="btn btnOutline" href={siteConfig.social.linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedinIn aria-hidden="true" />LinkedIn</a><a className="btn btnOutline" href={siteConfig.social.github} target="_blank" rel="noopener noreferrer"><FaGithub aria-hidden="true" />GitHub</a></div>
  </aside>;
}
