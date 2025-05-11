let products = [];

async function fetchProducts() {
  try {
    const response = await fetch("/kasir/api/products/");
    if (!response.ok) throw new Error("Gagal memuat produk");
    products = await response.json();
    renderProducts("all");
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan saat mengambil data produk.");
  }
}

async function loadCategories() {
  const res = await fetch("/kasir/api/categories/");
  const categories = await res.json();

  const categorySelect = document.getElementById("category");
  categorySelect.innerHTML = '<option value="" disabled selected>Pilih kategori</option>';

  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = cat.name;
    categorySelect.appendChild(opt);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
  loadCategories();
});
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
  const btnDownloadLowStock = document.getElementById("downloadLowStockBtn");

  let editIndex = null; // null means add mode, otherwise edit mode

  function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const content = document.querySelector(".content");
    const overlay = document.getElementById("overlay");
  
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle("show");
      overlay.classList.toggle("show");
    } else {
      sidebar.classList.toggle("collapsed");
      content.classList.toggle("full");
    }
  }
  

  // Render products based on filter and search
  function renderProducts(filter = "all") {
    const searchTerm = searchInput.value.toLowerCase();
    const categoryTerm = categoryFilter.value;

    let filteredProducts = products;

    // Filter by stock menipis if needed
    if (filter === "stok") {
      filteredProducts = filteredProducts.filter((p) => p.stock <= 3);
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

  // Sembunyikan tombol download PDF
  btnDownloadLowStock.classList.add("hidden");
});
btnStok.addEventListener("click", () => {
  btnStok.classList.add("bg-white", "border", "border-[#D1D5DB]", "text-[#1E1E1E]");
  btnStok.classList.remove("bg-[#E6E6E6]", "text-[#9CA3AF]");
  btnSemua.classList.remove("bg-white", "border", "border-[#D1D5DB]", "text-[#1E1E1E]");
  btnSemua.classList.add("bg-[#E6E6E6]", "text-[#9CA3AF]");
  renderProducts("stok");

  // Tampilkan tombol download PDF
  btnDownloadLowStock.classList.remove("hidden");
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
    document.getElementById("cancelBtn").addEventListener("click", () => {
    editIndex = null;
    document.getElementById("addProductForm").reset();
    modalBackdrop.classList.add("hidden"); // tutup modal
  });
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  // Add or Edit product form submit
document.getElementById("addProductForm").addEventListener("submit", async function (e) {
  e.preventDefault();

const productData = {
  id: editIndex !== null ? products[editIndex].id : undefined,
  name: document.getElementById("productName").value.trim(),
  category_id: parseInt(document.getElementById("category").value),
  price: parseInt(document.getElementById("price").value),
  stock: parseInt(document.getElementById("stock").value),
  expiryDate: document.getElementById("expiryDate").value || null
};

  const url = "/kasir/api/manageProducts/";
  const method = editIndex !== null ? "PUT" : "POST";

  if (editIndex !== null) {
    productData.id = products[editIndex].id;
  }

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData)
    });

    if (!res.ok) throw new Error("Gagal menyimpan produk");

    document.getElementById("addProductForm").reset();
    editIndex = null;
    modalBackdrop.classList.add("hidden");
    await fetchProducts();
  } catch (err) {
    alert("Gagal menyimpan data produk");
    console.error(err);
  }
});
  // Handle action buttons in table (edit, delete)
  productBody.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const index = parseInt(btn.getAttribute("data-index"), 10);
    if (isNaN(index) || !action) return;

    if (action === "edit") {
      // Open modal with product data for editing
      editIndex = index;
      modalTitle.textContent = "Edit Produk";
      const p = products[index];
      addProductForm.productName.value = p.name;
      addProductForm.category.value = p.category_id;
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