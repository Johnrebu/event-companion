import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STRUCTURED_DATA_ID = "structured-data";

type RouteMetaConfig = {
  title: string;
  description: string;
  path: string;
  robots: string;
};

const ROUTE_META: Record<string, RouteMetaConfig> = {
  "/": {
    title: "Corona Creative Solutions | Event Management",
    description:
      "Corona Creative Solutions builds and manages memorable events with streamlined planning, operations, SOPs, and budgeting support.",
    path: "/",
    robots: "index, follow",
  },
  "/expenses": {
    title: "Expense Command Center | Corona Creative Solutions",
    description:
      "Internal expense tracking and financial reporting workspace for Corona Creative Solutions.",
    path: "/expenses",
    robots: "noindex, nofollow",
  },
  "/events": {
    title: "Events Dashboard | Corona Creative Solutions",
    description:
      "Internal event calendar and operations dashboard for Corona Creative Solutions.",
    path: "/events",
    robots: "noindex, nofollow",
  },
  "/sop": {
    title: "Pre-Event SOP | Corona Creative Solutions",
    description:
      "Internal pre-event standard operating procedures for Corona Creative Solutions teams.",
    path: "/sop",
    robots: "noindex, nofollow",
  },
  "/corona-sop": {
    title: "Event SOP | Corona Creative Solutions",
    description:
      "Internal event execution standard operating procedures for Corona Creative Solutions teams.",
    path: "/corona-sop",
    robots: "noindex, nofollow",
  },
  "/roadmap": {
    title: "Vision Board | Corona Creative Solutions",
    description:
      "Internal roadmap and planning view for Corona Creative Solutions.",
    path: "/roadmap",
    robots: "noindex, nofollow",
  },
  "/feedback-form": {
    title: "Reimbursement Form | Corona Creative Solutions",
    description:
      "Internal petty cash reimbursement form for Corona Creative Solutions team members.",
    path: "/feedback-form",
    robots: "noindex, nofollow",
  },
  "/reimbursement-form": {
    title: "Reimbursement Form | Corona Creative Solutions",
    description:
      "Internal petty cash reimbursement form for Corona Creative Solutions team members.",
    path: "/reimbursement-form",
    robots: "noindex, nofollow",
  },
};

const NOT_FOUND_META: RouteMetaConfig = {
  title: "Page Not Found | Corona Creative Solutions",
  description: "The page you are looking for could not be found.",
  path: "/",
  robots: "noindex, nofollow",
};

const getSiteUrl = () => {
  const configuredUrl = import.meta.env.VITE_SITE_URL?.trim();
  const siteUrl = configuredUrl || window.location.origin;

  return siteUrl.replace(/\/$/, "");
};

const upsertMeta = (
  selector: string,
  attributes: Record<string, string>,
  content: string,
) => {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    Object.entries(attributes).forEach(([key, value]) => {
      element?.setAttribute(key, value);
    });
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
};

const upsertCanonical = (href: string) => {
  let element = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
};

const upsertStructuredData = (isHomepage: boolean, description: string) => {
  const existing = document.getElementById(STRUCTURED_DATA_ID);

  if (!isHomepage) {
    existing?.remove();
    return;
  }

  const siteUrl = getSiteUrl();
  const defaultImage = `${siteUrl}/corona-logo.png`;

  const payload = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Corona Creative Solutions",
    url: `${siteUrl}/`,
    description,
    publisher: {
      "@type": "Organization",
      name: "Corona Creative Solutions",
      logo: {
        "@type": "ImageObject",
        url: defaultImage,
      },
    },
  };

  let script = existing as HTMLScriptElement | null;

  if (!script) {
    script = document.createElement("script");
    script.id = STRUCTURED_DATA_ID;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(payload);
};

export const RouteMeta = () => {
  const location = useLocation();

  useEffect(() => {
    const siteUrl = getSiteUrl();
    const defaultImage = `${siteUrl}/corona-logo.png`;
    const meta = ROUTE_META[location.pathname] ?? NOT_FOUND_META;
    const canonicalUrl = new URL(meta.path, `${siteUrl}/`).toString();
    const isHomepage = location.pathname === "/";

    document.title = meta.title;

    upsertMeta('meta[name="description"]', { name: "description" }, meta.description);
    upsertMeta('meta[name="robots"]', { name: "robots" }, meta.robots);
    upsertMeta('meta[property="og:title"]', { property: "og:title" }, meta.title);
    upsertMeta(
      'meta[property="og:description"]',
      { property: "og:description" },
      meta.description,
    );
    upsertMeta('meta[property="og:type"]', { property: "og:type" }, "website");
    upsertMeta('meta[property="og:url"]', { property: "og:url" }, canonicalUrl);
    upsertMeta('meta[property="og:image"]', { property: "og:image" }, defaultImage);
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title" }, meta.title);
    upsertMeta(
      'meta[name="twitter:description"]',
      { name: "twitter:description" },
      meta.description,
    );
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image" }, defaultImage);
    upsertCanonical(canonicalUrl);
    upsertStructuredData(isHomepage, meta.description);
  }, [location.pathname]);

  return null;
};
