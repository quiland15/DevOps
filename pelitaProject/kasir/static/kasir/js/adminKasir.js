        const cart = [];
    
        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('show');
            document.getElementById('overlay').classList.toggle('show');
        }
    
        function renderProducts() {
            const list = document.getElementById('product-list');
            list.innerHTML = "";
            products.forEach(p => {
                const div = document.createElement('div');
                div.className = "col-md-6 col-lg-4 mb-3";
                div.innerHTML = `
                    <div class="card-product">
                        <h6>${p.name}</h6>
                        <small>${p.category}</small>
                        <div class="price mt-1">Rp ${p.price.toLocaleString()}</div>
                        <div class="product-stock">Stock: ${p.stock}</div>
                        <button class="btn btn-sm btn-primary mt-2 w-100" onclick="addToCart(${p.id})">Tambah</button>
                    </div>
                `;
                list.appendChild(div);
            });
        }
    
        function addToCart(id) {
            const product = products.find(p => p.id === id);
            const existing = cart.find(c => c.id === id);
            if (existing) {
                existing.qty++;
            } else {
                cart.push({ ...product, qty: 1 });
            }
            renderCart();
        }
    
        function updateQty(id, change) {
            const item = cart.find(c => c.id === id);
            if (!item) return;
            item.qty += change;
            if (item.qty <= 0) {
                const idx = cart.findIndex(c => c.id === id);
                cart.splice(idx, 1);
            }
            renderCart();
        }
    
        function removeItem(id) {
            const idx = cart.findIndex(c => c.id === id);
            if (idx > -1) {
                cart.splice(idx, 1);
            }
            renderCart();
        }
    
        function renderCart() {
            const tbody = document.querySelector("#cart-table tbody");
            tbody.innerHTML = "";
            let totalItems = 0;
            let totalPrice = 0;
            cart.forEach(item => {
                totalItems += item.qty;
                totalPrice += item.price * item.qty;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.name}</td>
                    <td>Rp ${item.price.toLocaleString()}</td>
                    <td>
                        <div class="d-flex">
                            <button class="btn btn-sm btn-light" onclick="updateQty(${item.id}, -1)">-</button>
                            <div class="mx-2">${item.qty}</div>
                            <button class="btn btn-sm btn-light" onclick="updateQty(${item.id}, 1)">+</button>
                        </div>
                    </td>
                    <td>Rp ${(item.price * item.qty).toLocaleString()}</td>
                    <td><button class="btn btn-sm btn-danger" onclick="removeItem(${item.id})">&times;</button></td>
                `;
                tbody.appendChild(tr);
            });
            document.getElementById('total-items').innerText = totalItems;
            document.getElementById('total-price').innerText = "Rp " + totalPrice.toLocaleString();
        }

        document.querySelector("searchProduct").addEventListener("input", function (e) {
            const keyword = e.target.value.toLowerCase();
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(keyword) ||
                p.category.toLowerCase().includes(keyword)
            );
            renderFilteredProducts(filtered);
        });
        
        function renderFilteredProducts(filteredList) {
            const list = document.getElementById('product-list');
            list.innerHTML = "";
        
            if (filteredList.length === 0) {
                list.innerHTML = `<p class="text-muted">Tidak ada produk ditemukan.</p>`;
                return;
            }
        
            filteredList.forEach(p => {
                const div = document.createElement('div');
                div.className = "col-md-6 col-lg-4 mb-3";
                div.innerHTML = `
                    <div class="card-product">
                        <h6>${p.name}</h6>
                        <small>${p.category}</small>
                        <div class="price mt-1">Rp ${p.price.toLocaleString()}</div>
                        <div class="product-stock">Stock: ${p.stock}</div>
                        <button class="btn btn-sm btn-primary mt-2 w-100" onclick="addToCart(${p.id})">Tambah</button>
                    </div>
                `;
                list.appendChild(div);
            });
        }      

document.querySelector(".btn.btn-primary.w-100").addEventListener("click", function () {
    const namaPelanggan = document.querySelector('input[placeholder="Masukkan nama pelanggan"]').value.trim();
    const metodePembayaran = document.querySelector('input[name="payment"]:checked')?.id || "cash";
    const totalPrice = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    const bayarDariInput = totalPrice; // bisa ganti dengan input field pembayaran nanti

    // Validasi keranjang
    if (cart.length === 0) {
        alert("Keranjang masih kosong!");
        return;
    }

    // Validasi stok
    const stokKurang = cart.find(item => item.qty > item.stock);
    if (stokKurang) {
        alert(`Stok produk "${stokKurang.name}" tidak cukup!`);
        return;
    }

    fetch("/kasir/checkout/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({
            items: cart,
            total: totalPrice,
            paid_amount: bayarDariInput,
            payment_method: metodePembayaran,
            customer: namaPelanggan
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            alert("Transaksi berhasil!");
            cart.length = 0;
            renderCart();
            renderProducts(); // untuk update stok visual
        } else {
            alert("Gagal: " + data.message);
        }
    })
    .catch(err => {
        console.error(err);
        alert("Terjadi kesalahan saat memproses pembayaran.");
    });
});

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

        renderProducts();
        renderCart();