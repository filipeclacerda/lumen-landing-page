const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuButton = document.querySelector("[data-menu-button]");

function closeMenu({ restoreFocus = false } = {}) {
  if (!(nav instanceof HTMLElement) || !(menuButton instanceof HTMLElement)) {
    return;
  }

  nav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menu");
  document.body.classList.remove("menu-open");

  if (restoreFocus) menuButton.focus();
}

menuButton?.addEventListener("click", () => {
  if (!(nav instanceof HTMLElement)) return;

  const opening = !nav.classList.contains("open");
  nav.classList.toggle("open", opening);
  menuButton.setAttribute("aria-expanded", String(opening));
  menuButton.setAttribute("aria-label", opening ? "Fechar menu" : "Abrir menu");
  document.body.classList.toggle("menu-open", opening);
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => closeMenu());
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav?.classList.contains("open")) {
    closeMenu({ restoreFocus: true });
  }
});

const updateHeader = () => {
  header?.classList.toggle("scrolled", window.scrollY > 18);
};

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const revealElements = document.querySelectorAll(".reveal");
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

if ("IntersectionObserver" in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -5%" },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...(nav?.querySelectorAll("a[href^='#']") ?? [])];

if ("IntersectionObserver" in window && sections.length > 0) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      navLinks.forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${visible.target.id}`,
        );
      });
    },
    { rootMargin: "-25% 0px -60%", threshold: [0.05, 0.25, 0.5] },
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

document.querySelectorAll(".faq-list details").forEach((details) => {
  details.addEventListener("toggle", () => {
    if (!details.open) return;
    document.querySelectorAll(".faq-list details[open]").forEach((other) => {
      if (other !== details) other.open = false;
    });
  });
});

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});
