"use strict";

const IMAGE_HOSTS = [
  "private-user-images.githubusercontent.com",
  "user-images.githubusercontent.com",
  "camo.githubusercontent.com",
];

function attachment(link) {
  const img = link.querySelector("img");
  if (!img || !link.href) return null;
  let url;
  try {
    url = new URL(link.href);
  } catch {
    return null;
  }
  const isGitHubImage =
    IMAGE_HOSTS.includes(url.hostname) ||
    (url.hostname === "github.com" && url.pathname.startsWith("/user-attachments/assets/")) ||
    /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(url.pathname);
  return isGitHubImage ? { href: link.href, img } : null;
}

// Every image attachment on the page, in document order, so that
// screenshots from different comments can be compared side by side.
function collectAttachments() {
  return [...document.querySelectorAll(".markdown-body a")].map(attachment).filter(Boolean);
}

function openLightbox(items, index) {
  const host = document.createElement("div");
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `
    <style>
      :host { all: initial; }
      .backdrop {
        position: fixed; inset: 0; z-index: 2147483647;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0, 0, 0, 0.92);
        overflow: auto;
      }
      .backdrop.fit img { max-width: calc(100vw - 160px); max-height: calc(100vh - 120px); cursor: zoom-in; }
      .backdrop.full { display: block; }
      .backdrop.full img { display: block; margin: auto; cursor: zoom-out; }
      img { object-fit: contain; user-select: none; }
      .bar {
        position: fixed; top: 12px; right: 12px; z-index: 1;
        display: flex; gap: 8px; align-items: center;
      }
      .bar, .nav {
        font: 500 13px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        color: #fff;
      }
      .bar a, .bar button, .bar .counter, .nav {
        color: #fff; background: rgba(20, 20, 20, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 6px; padding: 8px 12px;
        cursor: pointer; text-decoration: none;
      }
      .bar a:hover, .bar button:hover, .nav:hover { background: #3a3a3a; }
      .counter { cursor: default; font-variant-numeric: tabular-nums; }
      .nav {
        position: fixed; top: 50%; transform: translateY(-50%); z-index: 1;
        width: 44px; height: 44px; padding: 0;
        display: flex; align-items: center; justify-content: center;
      }
      .nav svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
      .nav.prev { left: 12px; }
      .nav.next { right: 12px; }
      .nav:disabled { opacity: 0.3; cursor: default; }
      .nav:disabled:hover { background: rgba(20, 20, 20, 0.9); }
      .single .nav, .single .counter { display: none; }
    </style>
    <div class="backdrop fit">
      <div class="bar">
        <span class="counter"></span>
        <a target="_blank" rel="noopener noreferrer">Open original</a>
        <button type="button" class="close">Close (Esc)</button>
      </div>
      <button type="button" class="nav prev" aria-label="Previous image (Left arrow)">
        <svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>
      </button>
      <button type="button" class="nav next" aria-label="Next image (Right arrow)">
        <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
      </button>
      <img alt="">
    </div>`;

  const backdrop = root.querySelector(".backdrop");
  const picture = root.querySelector("img");
  const original = root.querySelector("a");
  const counter = root.querySelector(".counter");
  const prev = root.querySelector(".prev");
  const next = root.querySelector(".next");
  if (items.length === 1) backdrop.classList.add("single");

  function show(i) {
    index = Math.max(0, Math.min(i, items.length - 1));
    prev.disabled = index === 0;
    next.disabled = index === items.length - 1;
    const { href, img } = items[index];
    picture.src = img.currentSrc || img.src || href;
    picture.alt = img.alt || "";
    original.href = href;
    counter.textContent = `${index + 1} / ${items.length}`;
  }

  const previousOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = "hidden";

  function close() {
    document.removeEventListener("keydown", onKey, true);
    document.documentElement.style.overflow = previousOverflow;
    host.remove();
  }
  function onKey(event) {
    const actions = { Escape: close, ArrowLeft: () => show(index - 1), ArrowRight: () => show(index + 1) };
    const action = actions[event.key];
    if (!action || (items.length === 1 && event.key !== "Escape")) return;
    event.preventDefault();
    event.stopPropagation();
    action();
  }

  picture.addEventListener("click", (event) => {
    event.stopPropagation();
    backdrop.classList.toggle("fit");
    backdrop.classList.toggle("full");
  });
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) close();
  });
  root.querySelector(".close").addEventListener("click", close);
  prev.addEventListener("click", () => show(index - 1));
  next.addEventListener("click", () => show(index + 1));
  document.addEventListener("keydown", onKey, true);
  show(index);
  document.body.append(host);
}

document.addEventListener(
  "click",
  (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest(".markdown-body a");
    if (!link || !attachment(link)) return;
    const items = collectAttachments();
    const index = items.findIndex((item) => item.href === link.href);
    if (index === -1) return;
    event.preventDefault();
    openLightbox(items, index);
  },
  true
);
