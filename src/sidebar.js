// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  initSidebar();
});

// Also run on Astro page transitions
document.addEventListener("astro:page-load", function () {
  initSidebar();
});

function initSidebar() {
  // Elements
  const sidebar = document.getElementById("sidebar");
  const content = document.getElementById("content");
  const openSidebarBtn = document.getElementById("open-sidebar");
  const closeSidebarBtn = document.getElementById("close-sidebar");
  const sidebarOverlay = document.getElementById("sidebar-overlay");
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  const submenuItems = document.querySelectorAll(".has-submenu");
  const arrowIcons = document.querySelectorAll(".submenu-arrow");

  // Check if initialization already happened to prevent duplicate event listeners
  if (sidebar.dataset.initialized === "true") return;
  sidebar.dataset.initialized = "true";

  // Store sidebar state in localStorage
  const sidebarState = {
    get isOpen() {
      return localStorage.getItem("sidebarOpen") === "true";
    },
    set isOpen(value) {
      localStorage.setItem("sidebarOpen", value);
    },
  };

  // Search functionality
  const searchList = JSON.parse(document.getElementById("search-data")?.textContent || "[]");

  function initSearch() {
    if (!searchInput || !searchResults) return;

    searchInput.addEventListener("input", function () {
      const query = this.value.toLowerCase().trim();

      if (query.length < 2) {
        searchResults.innerHTML = "";
        searchResults.classList.add("hidden");
        return;
      }

      // Filter results
      const filteredResults = searchList.filter((item) => item.title.toLowerCase().includes(query)).slice(0, 5); // Limit to 5 results

      // Display results
      if (filteredResults.length > 0) {
        searchResults.innerHTML = filteredResults
          .map(
            (item) => `
          <a href="${item.url}" class="block border-b border-slate-700 px-4 py-2 hover:bg-slate-700">
            ${highlightMatch(item.title, query)}
          </a>
        `,
          )
          .join("");
        searchResults.classList.remove("hidden");
      } else {
        searchResults.innerHTML = `<div class="px-4 py-2 text-gray-400">No results found</div>`;
        searchResults.classList.remove("hidden");
      }
    });

    // Hide search results when clicking outside
    document.addEventListener("click", function (e) {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.add("hidden");
      }
    });
  }

  function highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, '<span class="bg-teal-900 text-white">$1</span>');
  }

  // Sidebar toggle functionality
  function initSidebarToggle() {
    if (openSidebarBtn && closeSidebarBtn && sidebar && sidebarOverlay) {
      // Apply initial state based on localStorage and screen size
      if (window.innerWidth < 1024) {
        // Mobile view
        if (sidebarState.isOpen) {
          sidebar.classList.remove("-translate-x-full");
          sidebarOverlay.classList.remove("hidden");
          document.body.classList.add("overflow-hidden");
        } else {
          sidebar.classList.add("-translate-x-full");
          sidebarOverlay.classList.add("hidden");
          document.body.classList.remove("overflow-hidden");
        }
      } else {
        // Desktop view
        sidebar.classList.remove("-translate-x-full");
        sidebarOverlay.classList.add("hidden");
        document.body.classList.remove("overflow-hidden");
      }

      // Open sidebar on mobile
      openSidebarBtn.addEventListener("click", function () {
        sidebar.classList.remove("-translate-x-full");
        sidebarOverlay.classList.remove("hidden");
        document.body.classList.add("overflow-hidden");
        sidebarState.isOpen = true;
      });

      // Close sidebar on mobile
      closeSidebarBtn.addEventListener("click", closeSidebar);
      sidebarOverlay.addEventListener("click", closeSidebar);

      // Handle window resize
      window.addEventListener("resize", function () {
        if (window.innerWidth >= 1024) {
          // lg breakpoint
          sidebar.classList.remove("-translate-x-full");
          sidebarOverlay.classList.add("hidden");
          document.body.classList.remove("overflow-hidden");
        } else {
          // Only close on resize if it was previously closed
          if (!sidebarState.isOpen) {
            sidebar.classList.add("-translate-x-full");
            sidebarOverlay.classList.add("hidden");
            document.body.classList.remove("overflow-hidden");
          }
        }
      });
    }
  }

  function closeSidebar() {
    sidebar.classList.add("-translate-x-full");
    sidebarOverlay.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    sidebarState.isOpen = false;
  }

  // Submenu toggle functionality
  function initSubmenuToggle() {
    submenuItems.forEach((item) => {
      const submenu = item.querySelector(".submenu");
      const arrow = item.querySelector(".submenu-arrow");

      // Initially hide all submenus
      if (submenu) {
        submenu.style.maxHeight = "0";
        submenu.style.overflow = "hidden";
        submenu.style.transition = "max-height 0.3s ease-in-out";
      }

      item.addEventListener("click", function (e) {
        // Don't propagate the click if it's on a link inside the menu item
        if (e.target.tagName === "A" && !e.target.classList.contains("submenu-arrow")) {
          return;
        }

        if (submenu) {
          if (submenu.style.maxHeight === "0px") {
            submenu.style.maxHeight = submenu.scrollHeight + "px";
            if (arrow) arrow.style.transform = "rotate(90deg)";
          } else {
            submenu.style.maxHeight = "0";
            if (arrow) arrow.style.transform = "rotate(0)";
          }
        }
      });
    });

    // Handle rotate for all arrow icons on hover
    arrowIcons.forEach((arrow) => {
      const menuItem = arrow.closest(".menu-item");
      if (menuItem) {
        menuItem.addEventListener("mouseenter", () => {
          arrow.style.transform = "translateX(5px)";
        });
        menuItem.addEventListener("mouseleave", () => {
          if (
            !menuItem.querySelector(".submenu")?.style.maxHeight ||
            menuItem.querySelector(".submenu")?.style.maxHeight === "0px"
          ) {
            arrow.style.transform = "translateX(0)";
          }
        });
      }
    });

    // Check if current page should have an open submenu
    const currentPath = window.location.pathname;
    submenuItems.forEach((item) => {
      const links = item.querySelectorAll("a");
      links.forEach((link) => {
        if (link.getAttribute("href") && currentPath.startsWith(link.getAttribute("href"))) {
          const submenu = item.querySelector(".submenu");
          const arrow = item.querySelector(".submenu-arrow");
          if (submenu) {
            submenu.style.maxHeight = submenu.scrollHeight + "px";
            if (arrow) arrow.style.transform = "rotate(90deg)";
          }
        }
      });
    });
  }

  // Initialize all functionalities
  initSidebarToggle();
  initSubmenuToggle();
  initSearch();
}

// This script is needed to pass the search data from Astro to JavaScript
document.addEventListener("astro:page-load", () => {
  // This helps with hydration in Astro's View Transitions
  if (!document.getElementById("search-data")) {
    const searchDataScript = document.createElement("script");
    searchDataScript.id = "search-data";
    searchDataScript.type = "application/json";
    searchDataScript.textContent = JSON.stringify(SEARCH_LIST_FROM_ASTRO);
    document.body.appendChild(searchDataScript);
  }
});
