import Link from "next/link";
import { FaArrowLeft, FaChartSimple, FaFilePen, FaPlus, FaRightFromBracket } from "react-icons/fa6";
import styles from "./AdminShell.module.css";

export default function AdminShell({ children, title, action }) {
  return <div className={styles.layout}><aside><Link href="/" className={styles.logo}><span>JM</span> Admin</Link><nav><Link href="/admin/dashboard"><FaChartSimple /> Dashboard</Link><Link href="/admin/blogs"><FaFilePen /> Blogs</Link><Link href="/admin/blogs/new"><FaPlus /> Create blog</Link></nav><div className={styles.bottom}><Link href="/blog"><FaArrowLeft /> View website</Link><form action="/api/auth/logout" method="post"><button><FaRightFromBracket /> Logout</button></form></div></aside><main><div className={styles.top}><div><span>Workspace</span><h1>{title}</h1></div>{action}</div>{children}</main></div>;
}
