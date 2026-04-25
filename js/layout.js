document.addEventListener("DOMContentLoaded", async () => {
  await loadLayout();
  initMobileMenu();
  initMobileDropdown();
  initMegaMenuScrollLock();
  initFooterAccordion();
  initCookieBanner();
});

async function loadLayout() {
  const headerTarget = document.getElementById("site-header");
  const footerTarget = document.getElementById("site-footer");

  if (headerTarget) {
    const header = await fetch("components/header.html").then(res => res.text());
    headerTarget.innerHTML = header;
  }

  if (footerTarget) {
    const footer = await fetch("components/footer.html").then(res => res.text());
    footerTarget.innerHTML = footer;
  }
}

function initMobileMenu() {
  const menu = document.getElementById("mobile-menu");
  const navList = document.getElementById("nav-list");

  if (!menu || !navList) return;

  menu.addEventListener("click", () => {
    const isOpen = navList.classList.toggle("active");

    menu.classList.toggle("active", isOpen);
    document.body.classList.toggle("no-scroll", isOpen);
  });

  navList.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 768 && !link.closest(".dropdown-parent")) {
        navList.classList.remove("active");
        menu.classList.remove("active");
        document.body.classList.remove("no-scroll");
      }
    });
  });
}

function initMobileDropdown() {
  const dropdownParents = document.querySelectorAll(".dropdown-parent > a");

  dropdownParents.forEach(parent => {
    parent.addEventListener("click", e => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        parent.parentElement.classList.toggle("active");
      }
    });
  });
}

function initMegaMenuScrollLock() {
  const megaMenuParent = document.querySelector(".mega-menu-parent");

  if (!megaMenuParent) return;

  megaMenuParent.addEventListener("mouseenter", () => {
    if (window.innerWidth > 768) {
      document.body.classList.add("no-scroll");
    }
  });

  megaMenuParent.addEventListener("mouseleave", () => {
    if (window.innerWidth > 768) {
      document.body.classList.remove("no-scroll");
    }
  });
}

function initFooterAccordion() {
  const footerHeaders = document.querySelectorAll(".footer-column h3");

  footerHeaders.forEach(header => {
    header.addEventListener("click", function () {
      if (window.innerWidth <= 768) {
        this.parentElement.classList.toggle("active");
      }
    });
  });
}

function initCookieBanner() {
  const cookieBanner = document.getElementById("cookie-banner");
  const acceptBtn = document.getElementById("accept-cookies");

  if (!cookieBanner || !acceptBtn) return;

  if (!localStorage.getItem("lohas_cookies_accepted")) {
    setTimeout(() => {
      cookieBanner.classList.add("show");
    }, 1500);
  }

  acceptBtn.addEventListener("click", () => {
    cookieBanner.style.transform = "translateY(100%)";
    localStorage.setItem("lohas_cookies_accepted", "true");

    setTimeout(() => {
      cookieBanner.classList.remove("show");
    }, 600);
  });
}
