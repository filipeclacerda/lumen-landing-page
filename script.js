const root = document.documentElement;
const themeToggle = document.getElementById("theme-toggle");
const menuToggle = document.getElementById("menu-toggle");
const mobileNav = document.getElementById("mobile-nav");

function setTheme(theme) {
  root.dataset.theme = theme;
  const nextLabel =
    theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro";
  themeToggle?.setAttribute("aria-label", nextLabel);
  themeToggle?.setAttribute("aria-pressed", String(theme === "dark"));

  try {
    localStorage.setItem("lumen-theme", theme);
  } catch {
    // O tema continua funcional em contextos que bloqueiam armazenamento local.
  }
}

themeToggle?.addEventListener("click", () => {
  setTheme(root.dataset.theme === "dark" ? "light" : "dark");
});

function closeMenu() {
  if (!mobileNav || !menuToggle) return;
  mobileNav.hidden = true;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir navegação");
}

menuToggle?.addEventListener("click", () => {
  if (!mobileNav) return;
  const opening = mobileNav.hidden;
  mobileNav.hidden = !opening;
  menuToggle.setAttribute("aria-expanded", String(opening));
  menuToggle.setAttribute(
    "aria-label",
    opening ? "Fechar navegação" : "Abrir navegação",
  );
});

mobileNav
  ?.querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mobileNav && !mobileNav.hidden) {
    closeMenu();
    menuToggle?.focus();
  }
});

// O layout interno do mockup tem 1060px fixos e é reduzido para caber no container.
const MOCK_WIDTH = 1060;
const viewport = document.querySelector(".mock-viewport");
const frame = document.querySelector(".mock-scale");

function fitMockup() {
  if (!(viewport instanceof HTMLElement) || !(frame instanceof HTMLElement))
    return;
  const scale = Math.min(1, viewport.clientWidth / MOCK_WIDTH);
  frame.style.transform = `scale(${scale})`;
  viewport.style.height = `${frame.offsetHeight * scale}px`;
}

if (viewport instanceof HTMLElement) {
  if ("ResizeObserver" in window) {
    new ResizeObserver(fitMockup).observe(viewport);
  } else {
    window.addEventListener("resize", fitMockup, { passive: true });
  }
  fitMockup();
}

const revealElements = document.querySelectorAll(".reveal");
if (
  "IntersectionObserver" in window &&
  !matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12 },
  );
  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}
