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

function detectCurrentPlatform() {
  const navigatorPlatform =
    window.navigator.userAgentData?.platform ?? window.navigator.platform ?? "";
  const platform = String(navigatorPlatform).toLowerCase();
  const userAgent = window.navigator.userAgent.toLowerCase();

  if (
    platform === "windows" ||
    platform.startsWith("win") ||
    userAgent.includes("windows nt")
  ) {
    return "windows";
  }

  if (platform.startsWith("mac") || userAgent.includes("macintosh")) {
    return "mac";
  }

  if (platform.startsWith("linux") || userAgent.includes("linux")) {
    return "linux";
  }

  return null;
}

const currentPlatform = detectCurrentPlatform();

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

const wingetOptions = document.querySelectorAll("[data-winget]");

if (currentPlatform === "windows") {
  wingetOptions.forEach((option) => {
    if (option instanceof HTMLElement) option.hidden = false;
  });
}

function setupWingetDisclosure(details) {
  const summary = details.querySelector("summary");
  const command = details.querySelector(".hero-winget-line__command");

  if (!(summary instanceof HTMLElement) || !(command instanceof HTMLElement)) {
    return;
  }

  let disclosureAnimation;
  let commandAnimation;
  let targetOpen = details.open;

  summary.addEventListener("click", (event) => {
    event.preventDefault();
    targetOpen = !targetOpen;

    disclosureAnimation?.cancel();
    commandAnimation?.cancel();

    if (reducedMotion) {
      details.open = targetOpen;
      return;
    }

    const startHeight = details.getBoundingClientRect().height;

    if (targetOpen) details.open = true;

    const endHeight = targetOpen
      ? details.scrollHeight
      : summary.getBoundingClientRect().height;

    details.style.height = `${startHeight}px`;
    details.style.overflow = "hidden";

    const currentDisclosureAnimation = details.animate(
      { height: [`${startHeight}px`, `${endHeight}px`] },
      {
        duration: 320,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
      },
    );

    disclosureAnimation = currentDisclosureAnimation;
    commandAnimation = command.animate(
      {
        opacity: targetOpen ? [0, 1] : [1, 0],
        transform: targetOpen
          ? ["translateY(-8px)", "translateY(0)"]
          : ["translateY(0)", "translateY(-6px)"],
      },
      {
        duration: targetOpen ? 240 : 180,
        easing: "ease-out",
        fill: "forwards",
      },
    );

    currentDisclosureAnimation.addEventListener("finish", () => {
      if (disclosureAnimation !== currentDisclosureAnimation) return;

      details.open = targetOpen;
      details.style.height = "";
      details.style.overflow = "";
      commandAnimation?.cancel();
      disclosureAnimation = undefined;
      commandAnimation = undefined;
    });
  });
}

document
  .querySelectorAll("details.hero-winget-line")
  .forEach((details) => setupWingetDisclosure(details));

function copyWithFallback(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) throw new Error("Não foi possível copiar o comando.");
}

async function writeToClipboard(text) {
  if (typeof window.navigator.clipboard?.writeText === "function") {
    try {
      await window.navigator.clipboard.writeText(text);
      return;
    } catch {
      // O fallback mantém a cópia disponível fora de contextos HTTPS.
    }
  }

  copyWithFallback(text);
}

async function copyWingetCommand(button) {
  const wingetOption = button.closest("[data-winget]");
  const command = wingetOption?.querySelector("[data-winget-command]");
  const label = button.querySelector("[data-winget-copy-label]");
  const status = wingetOption?.querySelector("[data-winget-copy-status]");
  const text = command?.textContent?.trim();
  const defaultLabel =
    button.getAttribute("data-copy-default-label") ?? "Copiar";

  if (!text) return;

  try {
    await writeToClipboard(text);

    button.classList.add("is-copied");
    if (label) label.textContent = "Copiado";
    if (status) status.textContent = "Comando WinGet copiado.";
  } catch {
    button.classList.remove("is-copied");
    if (label) label.textContent = "Tente novamente";
    if (status)
      status.textContent = "Não foi possível copiar o comando WinGet.";
  }

  window.setTimeout(() => {
    button.classList.remove("is-copied");
    if (label) label.textContent = defaultLabel;
  }, 2500);
}

document.querySelectorAll("[data-copy-winget]").forEach((button) => {
  button.addEventListener("click", () => copyWingetCommand(button));
});

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
