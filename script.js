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

  const previewRevealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        previewRevealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0 },
  );

  revealElements.forEach((element) => {
    const observer = element.matches(".product-stage")
      ? previewRevealObserver
      : revealObserver;
    observer.observe(element);
  });
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

const releaseUrl = "https://github.com/filipeclacerda/lumen/releases/latest";
const releaseApiUrl =
  "https://api.github.com/repos/filipeclacerda/lumen/releases/latest";

const assetMatchers = {
  "windows-exe": /(?:windows-x64-setup|x64-setup)\.exe$/i,
  "windows-msi": /(?:windows-x64|x64).*\.msi$/i,
  "mac-arm64": /(?:macos-arm64|aarch64|arm64)\.dmg$/i,
  "mac-x64": /(?:macos-x64|x86_64|x64)\.dmg$/i,
  "linux-appimage": /(?:linux-x64|amd64|x86_64).*\.appimage$/i,
  "linux-deb": /(?:linux-x64|amd64|x86_64).*\.deb$/i,
};

const smartDownloadProfiles = {
  windows: {
    asset: "windows-exe",
    icon: "#i-windows",
    label: "Baixar para Windows",
  },
  mac: {
    asset: "mac-arm64",
    icon: "#i-apple",
    label: "Baixar para macOS",
  },
  linux: {
    asset: "linux-appimage",
    icon: "#i-linux",
    label: "Baixar para Linux",
  },
};

const userAgent = window.navigator.userAgent.toLowerCase();
const currentPlatform = userAgent.includes("windows")
  ? "windows"
  : userAgent.includes("mac")
    ? "mac"
    : userAgent.includes("linux")
      ? "linux"
      : null;

function configureSmartDownloads(profile) {
  if (!profile) return;

  document.querySelectorAll("[data-smart-download]").forEach((link) => {
    link.setAttribute("data-download", profile.asset);
    link.setAttribute("aria-label", profile.label);

    const label = link.querySelector("[data-smart-download-label]");
    const icon = link.querySelector("[data-smart-download-icon]");

    if (label) label.textContent = profile.label;
    icon?.setAttribute("href", profile.icon);
  });
}

const initialSmartDownloadProfile = currentPlatform
  ? smartDownloadProfiles[currentPlatform]
  : null;

configureSmartDownloads(initialSmartDownloadProfile);

if (currentPlatform) {
  const platformCard = document.querySelector(
    `[data-platform-card="${currentPlatform}"]`,
  );
  const recommendation = platformCard?.querySelector(".platform-recommended");

  platformCard?.classList.add("is-recommended");
  if (recommendation instanceof HTMLElement) recommendation.hidden = false;
}

async function refineMacDownload() {
  if (currentPlatform !== "mac") return;

  const userAgentData = window.navigator.userAgentData;
  if (typeof userAgentData?.getHighEntropyValues !== "function") return;

  try {
    const hints = await userAgentData.getHighEntropyValues(["architecture"]);
    if (hints.architecture === "x86") {
      configureSmartDownloads({
        ...smartDownloadProfiles.mac,
        asset: "mac-x64",
      });
    }
  } catch {
    // A arquitetura é uma melhoria progressiva; o fallback segue funcional.
  }
}

async function resolveLatestDownloads() {
  await refineMacDownload();

  const response = await window.fetch(releaseApiUrl);
  if (!response.ok) throw new Error("Não foi possível consultar a release.");

  const release = await response.json();
  const assets = Array.isArray(release.assets) ? release.assets : [];

  document.querySelectorAll("[data-download]").forEach((link) => {
    const key = link.getAttribute("data-download");
    const matcher = key ? assetMatchers[key] : null;
    const asset = matcher
      ? assets.find((candidate) => matcher.test(candidate.name))
      : null;

    if (
      !(link instanceof HTMLElement) ||
      link.tagName !== "A" ||
      !asset?.browser_download_url
    ) {
      return;
    }

    link.setAttribute("href", asset.browser_download_url);
    link.title = `Baixar ${asset.name}`;
  });

  if (typeof release.tag_name === "string") {
    document.querySelectorAll("[data-release-version]").forEach((element) => {
      element.textContent = release.tag_name;
    });
  }
}

resolveLatestDownloads().catch(() => {
  document.querySelectorAll("[data-download]").forEach((link) => {
    if (link instanceof HTMLElement && link.tagName === "A") {
      link.setAttribute("href", releaseUrl);
    }
  });
});
