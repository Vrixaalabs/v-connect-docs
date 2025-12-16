document.documentElement.style.scrollBehavior = "smooth";

// Mobile sidebar toggle
const sidebar = document.getElementById("sidebar");
const burger = document.getElementById("burger");

burger?.addEventListener("click", () => {
  sidebar.classList.toggle("is-open");
});

// Close sidebar when clicking a nav link (mobile)
sidebar?.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (!a) return;
  sidebar.classList.remove("is-open");
});

// Code tabs
document.querySelectorAll(".codepane").forEach((pane) => {
  const tabs = pane.querySelectorAll(".tab");
  const blocks = pane.querySelectorAll("[data-code]");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");

      const lang = tab.dataset.lang;
      blocks.forEach((b) => b.classList.toggle("is-hidden", b.dataset.code !== lang));
    });
  });
});

// Copy buttons
const toast = document.getElementById("toast");
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("is-show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("is-show"), 1200);
}

document.querySelectorAll(".copybtn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const text = btn.getAttribute("data-copy") || "";
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard");
    } catch {
      showToast("Copy failed");
    }
  });
});

// Build "On this page" TOC from sections
const toc = document.getElementById("toc");
const headings = Array.from(document.querySelectorAll(".doc__section"))
  .map((sec) => {
    const id = sec.id;
    const titleEl = sec.querySelector("h1, h2, h3");
    const title = titleEl ? titleEl.textContent.trim() : id;
    return { id, title };
  })
  .filter((x) => x.id && x.title);

if (toc) {
  toc.innerHTML = headings
    .map((h) => `<a href="#${h.id}" data-toc="${h.id}">${h.title}</a>`)
    .join("");
}

// Active section highlighting (sidebar + toc)
const sections = Array.from(document.querySelectorAll(".doc__section"));

const io = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    const id = visible.target.id;

    document.querySelectorAll(".navlink").forEach((a) => {
      const href = a.getAttribute("href");
      a.classList.toggle("is-active", href === `#${id}`);
    });

    document.querySelectorAll("#toc a").forEach((a) => {
      a.classList.toggle("is-active", a.getAttribute("data-toc") === id);
    });
  },
  { rootMargin: "-20% 0px -70% 0px", threshold: [0.08, 0.2, 0.4] }
);

sections.forEach((s) => io.observe(s));

// Cmd/Ctrl+K focuses search input
const search = document.getElementById("search");
window.addEventListener("keydown", (e) => {
  const isMac = navigator.platform.toLowerCase().includes("mac");
  const mod = isMac ? e.metaKey : e.ctrlKey;
  if (mod && e.key.toLowerCase() === "k") {
    e.preventDefault();
    search?.focus();
  }
});
