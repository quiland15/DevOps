let products = [];

async function fetchProducts() {
  try {
    const response = await fetch("/api/products/");
    if (!response.ok) throw new Error("Gagal memuat produk");
    products = await response.json();
    renderProducts("all");
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan saat mengambil data produk.");
  }
}

fetchProducts();

  const productBody = document.getElementById("productBody");
  const btnSemua = document.getElementById("btn-semua");
  const btnStok = document.getElementById("btn-stok");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const btnTambahProduk = document.getElementById("btnTambahProduk");
  const modalBackdrop = document.getElementById("modalBackdrop");
  const closeModalBtn = document.getElementById("closeModal");
  const cancelBtn = document.getElementById("cancelBtn");
  const addProductForm = document.getElementById("addProductForm");
  const modalTitle = document.getElementById("modalTitle");

  let editIndex = null; // null means add mode, otherwise edit mode

  // Render products based on filter and search
  function renderProducts(filter = "all") {
    const searchTerm = searchInput.value.toLowerCase();
    const categoryTerm = categoryFilter.value;

    let filteredProducts = products;

    // Filter by stock menipis if needed
    if (filter === "stok") {
      filteredProducts = filteredProducts.filter((p) => p.stock <= 10);
    }

    // Filter by category if not all
    if (categoryTerm !== "all") {
      filteredProducts = filteredProducts.filter((p) => p.category === categoryTerm);
    }

    // Filter by search term
    if (searchTerm) {
      filteredProducts = filteredProducts.filter((p) =>
        p.name.toLowerCase().includes(searchTerm)
      );
    }

    productBody.innerHTML = "";

    if (filteredProducts.length === 0) {
      productBody.innerHTML = `<tr><td colspan="5" class="py-4 px-3 text-center text-[#6B7280]">Tidak ada produk ditemukan</td></tr>`;
      return;
    }

    filteredProducts.forEach((product, idx) => {
      const tr = document.createElement("tr");
      tr.className = "border-t border-[#E6E6E6]";

      // Produk cell with popular badge if any
      const popularBadge = product.popular
        ? `<span class="ml-2 text-[10px] font-semibold text-[#B45309] bg-[#FEF3C7] rounded px-1.5 py-0.5 select-none">Popular</span>`
        : "";

      tr.innerHTML = `
        <td class="py-2 px-3 border-r border-[#E6E6E6] font-semibold">
          ${product.name} ${popularBadge}
        </td>
        <td class="py-2 px-3 border-r border-[#E6E6E6] text-[#6B7280]">${product.category}</td>
        <td class="py-2 px-3 border-r border-[#E6E6E6]">${product.price}</td>
        <td class="py-2 px-3 border-r border-[#E6E6E6]">${product.stock}</td>
        <td class="py-2 px-3 flex space-x-2 text-[#6B7280]">
          <button aria-label="Naikkan stok" class="hover:text-[#0052CC]" data-action="up" data-index="${idx}">
            <i class="fas fa-arrow-up"></i>
          </button>
          <button aria-label="Turunkan stok" class="hover:text-[#0052CC]" data-action="down" data-index="${idx}">
            <i class="fas fa-arrow-down"></i>
          </button>
          <button aria-label="Edit produk" class="hover:text-[#0052CC]" data-action="edit" data-index="${idx}">
            <i class="fas fa-edit"></i>
          </button>
          <button aria-label="Hapus produk" class="text-[#EF4444] hover:text-[#B91C1C]" data-action="delete" data-index="${idx}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
      productBody.appendChild(tr);
    });
  }

  // Initial render all products
  renderProducts("all");

  // Button click handlers
  btnSemua.addEventListener("click", () => {
    btnSemua.classList.add("bg-white", "border", "border-[#D1D5DB]", "text-[#1E1E1E]");
    btnSemua.classList.remove("bg-[#E6E6E6]", "text-[#9CA3AF]");
    btnStok.classList.remove("bg-white", "border", "border-[#D1D5DB]", "text-[#1E1E1E]");
    btnStok.classList.add("bg-[#E6E6E6]", "text-[#9CA3AF]");
    renderProducts("all");
  });

  btnStok.addEventListener("click", () => {
    btnStok.classList.add("bg-white", "border", "border-[#D1D5DB]", "text-[#1E1E1E]");
    btnStok.classList.remove("bg-[#E6E6E6]", "text-[#9CA3AF]");
    btnSemua.classList.remove("bg-white", "border", "border-[#D1D5DB]", "text-[#1E1E1E]");
    btnSemua.classList.add("bg-[#E6E6E6]", "text-[#9CA3AF]");
    renderProducts("stok");
  });

  // Search input event
  searchInput.addEventListener("input", () => {
    if (btnSemua.classList.contains("bg-white")) {
      renderProducts("all");
    } else {
      renderProducts("stok");
    }
  });

  // Category filter event
  categoryFilter.addEventListener("change", () => {
    if (btnSemua.classList.contains("bg-white")) {
      renderProducts("all");
    } else {
      renderProducts("stok");
    }
  });

  // Show modal for add or edit
  btnTambahProduk.addEventListener("click", () => {
    editIndex = null;
    modalTitle.textContent = "Tambah Produk";
    addProductForm.reset();
    modalBackdrop.classList.remove("hidden");
  });

  // Close modal
  function closeModal() {
    modalBackdrop.classList.add("hidden");
    editIndex = null;
  }
  closeModalBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  // Add or Edit product form submit
  addProductForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = addProductForm.productName.value.trim();
    const category = addProductForm.category.value;
    const price = addProductForm.price.value.trim();
    const stock = parseInt(addProductForm.stock.value, 10);
    const expiryDate = addProductForm.expiryDate.value;

    if (!name || !category || !price || isNaN(stock) || !expiryDate) {
      alert("Mohon isi semua field dengan benar.");
      return;
    }

    if (editIndex === null) {
      // Add new product
      products.push({
        name,
        category,
        price,
        stock,
        popular: false,
        expiryDate,
      });
    } else {
      // Edit existing product
      products[editIndex] = {
        ...products[editIndex],
        name,
        category,
        price,
        stock,
        expiryDate,
      };
    }

    closeModal();

    // Reset filters to show all and clear search
    btnSemua.click();
    searchInput.value = "";
    categoryFilter.value = "all";

    renderProducts("all");
  });

  // Handle action buttons in table (up, down, edit, delete)
  productBody.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const index = parseInt(btn.getAttribute("data-index"), 10);
    if (isNaN(index) || !action) return;

    if (action === "up") {
      // Increase stock by 1
      products[index].stock++;
      renderProducts(btnSemua.classList.contains("bg-white") ? "all" : "stok");
    } else if (action === "down") {
      // Decrease stock by 1 but not below 0
      if (products[index].stock > 0) {
        products[index].stock--;
        renderProducts(btnSemua.classList.contains("bg-white") ? "all" : "stok");
      }
    } else if (action === "edit") {
      // Open modal with product data for editing
      editIndex = index;
      modalTitle.textContent = "Edit Produk";
      const p = products[index];
      addProductForm.productName.value = p.name;
      addProductForm.category.value = p.category;
      addProductForm.price.value = p.price;
      addProductForm.stock.value = p.stock;
      addProductForm.expiryDate.value = p.expiryDate || "";
      modalBackdrop.classList.remove("hidden");
    } else if (action === "delete") {
      // Confirm and delete product
      if (confirm(`Hapus produk "${products[index].name}"?`)) {
        products.splice(index, 1);
        renderProducts(btnSemua.classList.contains("bg-white") ? "all" : "stok");
      }
    }
  });