import { requireAuth, isAdmin, logout } from "../../js/auth.js";
import { getAdminCustomers } from "../../js/api.js";

const CUSTOMERS_PER_PAGE = 25;

let currentPage = 1;
let totalPages = 1;

const projectAdminPage = () => {
  requireAuth();

  if (!isAdmin()) {
    window.location.href = "unauthorized.html";
    return;
  }

  document.body.classList.add("authorized");
};

const setupLogout = () => {
  const logoutButton = document.querySelector("#admin-logout-button");

  if (!logoutButton) return;

  logoutButton.addEventListener("click", logout);
};

const displayCustomers = (customers) => {
  const customersList = document.querySelector("#customers-list");

  if (!customersList) return;

  if (customers.length === 0) {
    customersList.innerHTML = `
            <tr>
                <td colspan="4">No customers found.</td>
            </tr>
        `;
    return;
  }

  customersList.innerHTML = customers
    .map(
      (customer) => `
    <tr>
        <td>#${customer.id}</td>

        <td>
            ${customer.first_name} ${customer.last_name}
        </td>

        <td>
            ${customer.email}
        </td>

        <td>
            ${new Date(customer.created_at).toLocaleDateString()}
        </td>
    </tr>
`,
    )
    .join("");
};

const updateCustomersCount = (total, page, limit, customers) => {
  const startElement = document.querySelector("#customers-start");
  const endElement = document.querySelector("#customers-end");
  const totalElement = document.querySelector("#customers-total");

  if (!startElement || !endElement || !totalElement) return;

  if (total === 0) {
    startElement.textContent = "0";
    endElement.textContent = "0";
    totalElement.textContent = "0";
    return;
  }

  const start = (page - 1) * limit + 1;
  const end = start + customers.length - 1;

  startElement.textContent = start;
  endElement.textContent = end;
  totalElement.textContent = total;
};

const renderPagination = (pagination) => {
  const previousButton = document.querySelector("#previous-page");
  const nextButton = document.querySelector("#next-page");
  const currentPageDisplay = document.querySelector("#current-page-display");

  if (!previousButton || !nextButton || !currentPageDisplay) return;

  currentPage = pagination.page;
  totalPages = pagination.totalPages;

  previousButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages || totalPages === 0;

  currentPageDisplay.textContent = `${currentPage} / ${totalPages}`;
};

const getCustomerSearch = () => {
  const searchInput = document.querySelector("#customer-search");

  if (!searchInput) return undefined;

  return searchInput.value.trim() || undefined;
};

const showCustomerSkeletons = () => {
  const customersTableSection = document.querySelector(
    ".customers-table-section"
  );

  if (!customersTableSection) return;

  customersTableSection.classList.add("loading");
};

const hideCustomerSkeletons = () => {
  const customersTableSection = document.querySelector(
    ".customers-table-section"
  );

  if (!customersTableSection) return;

  customersTableSection.classList.remove("loading");
};

const loadCustomers = async (page = 1) => {
  showCustomerSkeletons();

  const startTime = performance.now();

  try {
    const search = getCustomerSearch();

    const params = {
      search,
      page,
      limit: CUSTOMERS_PER_PAGE,
    };

    const data = await getAdminCustomers(params);

    const elapsedTime = performance.now() - startTime;
    const minimumLoadingTime = 800;
    const remainingTime = minimumLoadingTime - elapsedTime;

    if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }

    displayCustomers(data.customers);

    updateCustomersCount(
      data.pagination.total,
      data.pagination.page,
      data.pagination.limit,
      data.customers,
    );

    renderPagination(data.pagination);

    hideCustomerSkeletons();
  } catch (error) {
    hideCustomerSkeletons();

    console.error("Failed to load customers:", error);

    window.alert("Failed to load customers")
  }
};

const setupCustomerSearch = () => {
  const searchForm = document.querySelector("#customer-search-form");
  const resetButton = document.querySelector("#reset-customer-search");

  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      loadCustomers(1);
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      searchForm.reset();
      loadCustomers(1);
    });
  }
};

const setupPaginationControls = () => {
  const previousButton = document.querySelector("#previous-page");
  const nextButton = document.querySelector("#next-page");

  if (previousButton) {
    previousButton.addEventListener("click", () => {
      if (currentPage > 1) {
        loadCustomers(currentPage - 1);
      }
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      if (currentPage < totalPages) {
        loadCustomers(currentPage + 1);
      }
    });
  }
};

const initializeCustomersPage = async () => {
  projectAdminPage();
  setupLogout();
  setupCustomerSearch();
  setupPaginationControls();

  await loadCustomers(1);
};

initializeCustomersPage();
