import { isAuthenticated, isAdmin } from "./auth.js";

const setupNavigation = () => {
    const authNavigation = document.querySelector("#auth-navigation");
    const menuToggle = document.querySelector("#menu-toggle");
    const mobileMenu = document.querySelector("#mobile-menu");

    if (!authNavigation || !menuToggle || !mobileMenu) return;

    const currentPage = window.location.pathname.split("/").pop();

    const isCurrentPage = (page) => currentPage === page;

    if (isAuthenticated()) {
        authNavigation.innerHTML = `
            ${!isCurrentPage("wishlist.html") ? `<a href="wishlist.html">Wishlist</a>` : ""}
            ${!isCurrentPage("orders.html") ? `<a href="orders.html">My Orders</a>` : ""}
            ${isAdmin() ? `<a href="admin/index.html">Dashboard</a>` : ""}
            <button id="logout-button" type="button">Logout</button>
        `;

        const logoutButton = document.querySelector("#logout-button");

        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.href = "index.html";
        });

    } else {
        authNavigation.innerHTML = `
            ${!isCurrentPage("login.html") ? `<a href="login.html">Login</a>` : ""}
        `;
    }

    menuToggle.addEventListener("click", () => {
        const isOpen = mobileMenu.classList.toggle("menu-open");

        menuToggle.setAttribute("aria-expanded", isOpen);

        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close menu" : "Open menu"
        );

        menuToggle.textContent = isOpen ? "✕" : "☰";
    });
};

export { setupNavigation };