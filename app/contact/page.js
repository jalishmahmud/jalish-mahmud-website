import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import ContactForm from "@/components/Contact/ContactForm";
import ContactInfo from "@/components/Contact/ContactInfo";
import baseStyles from "@/components/Contact/Contact.module.css";
import { withDesignStyles } from "@/lib/design-styles";
const styles = withDesignStyles(baseStyles, "Contact");
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata = buildPageMetadata({ title: "Contact", description: `Contact ${siteConfig.fullName} about software engineering, React and Next.js development, AWS deployment, API integration, hiring opportunities or collaboration.`, path: "/contact" });

export default function ContactPage() {
  return <><Header /><main className={`container ${styles.page}`}>
    <div className={styles.hero}><span className={styles.kicker}>Get in touch</span><h1>Let’s build something together.</h1><p>Have a project in mind, an opportunity to share, or a question? Choose what you’d like to discuss and tell me a little about it.</p></div>
    <div className={styles.layout}><ContactInfo /><section className={styles.formCard} aria-labelledby="contact-form-title"><h2 id="contact-form-title">Send a message</h2><ContactForm /></section></div>
  </main><Footer /></>;
}
