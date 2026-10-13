"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import BlogActions from "@/components/BlogActions/BlogActions";
import styles from "./DashboardTable.module.css";

const PAGE_SIZES = [5, 10, 25, 50, 100];
const viewFormatter = new Intl.NumberFormat("en-US");
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export default function DashboardTable({ articles }) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ field: "updatedAt", direction: "desc" });

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const matches = articles.filter((article) =>
      !query || [article.title, article.category, article.status].some((value) =>
        String(value || "").toLocaleLowerCase().includes(query)
      )
    );

    return [...matches].sort((a, b) => {
      const comparison = sort.field === "views"
        ? a.views - b.views
        : String(a[sort.field] || "").localeCompare(String(b[sort.field] || ""), undefined, { sensitivity: "base" });
      return (sort.direction === "asc" ? comparison : -comparison)
        || String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
    });
  }, [articles, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const firstIndex = (currentPage - 1) * pageSize;
  const visible = filtered.slice(firstIndex, firstIndex + pageSize);
  const pageNumbers = [...new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages])]
    .filter((number) => number >= 1 && number <= totalPages)
    .sort((a, b) => a - b);

  function changeSort(field) {
    setSort((previous) => ({
      field,
      direction: previous.field === field && previous.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  }

  function sortHeader(label, field) {
    return <th scope="col" aria-sort={sort.field === field ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}>
      <button className={styles.sortButton} type="button" onClick={() => changeSort(field)}>
        {label}<span aria-hidden="true">{sort.field === field ? (sort.direction === "asc" ? " ↑" : " ↓") : " ↕"}</span>
      </button>
    </th>;
  }

  return <section className={styles.panel} aria-labelledby="recently-updated-heading">
    <div className={styles.heading}>
      <div>
        <h2 id="recently-updated-heading">Recently updated</h2>
        <p>Manage articles and see their public view counts.</p>
      </div>
    </div>

    <div className={styles.toolbar}>
      <div className={styles.searchField}>
        <label htmlFor="dashboard-article-search">Search articles</label>
        <input id="dashboard-article-search" type="search" placeholder="Search title, category, or status" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
      </div>
      <div className={styles.pageSizeField}>
        <label htmlFor="dashboard-page-size">Show</label>
        <select id="dashboard-page-size" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}>
          {PAGE_SIZES.map((size) => <option value={size} key={size}>{size}</option>)}
        </select>
        <span>per page</span>
      </div>
    </div>

    <div className={styles.tableScroll}>
      <table className={styles.table}>
        <thead><tr>
          {sortHeader("Title", "title")}
          {sortHeader("Status", "status")}
          {sortHeader("Views", "views")}
          {sortHeader("Updated", "updatedAt")}
          <th scope="col">Actions</th>
        </tr></thead>
        <tbody>
          {visible.map((article) => <tr key={article.id}>
            <td className={styles.titleCell}><Link href={`/admin/blogs/${article.id}/edit`}>{article.title}</Link><span>{article.category}</span></td>
            <td><span className={`${styles.status} ${article.status === "published" ? styles.published : styles.draft}`}>{article.status}</span></td>
            <td className={styles.viewsCell}>{viewFormatter.format(article.views)}</td>
            <td className={styles.dateCell}>{article.updatedAt ? <time dateTime={article.updatedAt}>{dateFormatter.format(new Date(article.updatedAt))}</time> : "—"}</td>
            <td className={styles.actionsCell}><BlogActions id={article.id} slug={article.slug} category={article.category} categorySlug={article.categorySlug} status={article.status} /></td>
          </tr>)}
          {!visible.length && <tr><td className={styles.empty} colSpan={5}>{articles.length ? "No articles match your search." : "No articles yet. Create your first article to get started."}</td></tr>}
        </tbody>
      </table>
    </div>

    <div className={styles.footer}>
      <p aria-live="polite">{filtered.length ? `Showing ${firstIndex + 1}–${firstIndex + visible.length} of ${filtered.length} articles` : "Showing 0 articles"}</p>
      {totalPages > 1 && <nav className={styles.pagination} aria-label="Article pages">
        <button type="button" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Previous</button>
        {pageNumbers.map((number, index) => <span className={styles.pageSlot} key={number}>
          {index > 0 && number - pageNumbers[index - 1] > 1 && <span className={styles.ellipsis} aria-hidden="true">…</span>}
          <button type="button" aria-label={`Page ${number}`} aria-current={number === currentPage ? "page" : undefined} onClick={() => setPage(number)}>{number}</button>
        </span>)}
        <button type="button" onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>Next</button>
      </nav>}
    </div>
  </section>;
}
