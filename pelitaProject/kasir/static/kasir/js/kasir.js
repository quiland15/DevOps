    let selectedProduct = null;
    const cart = [];

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
            if (!product) return;
        
            selectedProduct = product;
        
            const isNominal = document.getElementById("toggle-nominal")?.checked || false;
            let qty = 1;
        
            if (isNominal) {
                const uangInput = parseFloat(document.getElementById("input-uang")?.value || "0");
                if (isNaN(uangInput) || uangInput <= 0) {
                    alert("Nominal uang tidak valid.");
                    return;
                }
                qty = uangInput / product.price;
            } else {
                const qtyInput = parseFloat(document.getElementById("input-qty")?.value || "0");
                if (!isNaN(qtyInput) && qtyInput > 0) {
                    qty = qtyInput;
                } else {
                    // fallback: tetap tambah 1 seperti biasa
                    qty = 1;
                }
            }
        
            const existing = cart.find(c => c.id === id);
            if (existing) {
                existing.qty += qty;
            } else {
                cart.push({ ...product, qty });
            }
        
            renderCart();
        
            // Reset input setelah menambahkan
            document.getElementById("input-uang").value = "";
            document.getElementById("input-qty").value = "";
            document.getElementById("toggle-nominal").checked = false;
            document.getElementById("input-uang").style.display = "none";
            document.getElementById("input-qty").readOnly = false;
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
                totalPrice += item.subtotal || (item.price * item.qty);
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
                    <td>Rp ${(item.subtotal || (item.price * item.qty)).toLocaleString()}</td>
                    <td><button class="btn btn-sm btn-danger" onclick="removeItem(${item.id})">&times;</button></td>
                `;
                tbody.appendChild(tr);
            });
            document.getElementById('total-items').innerText = totalItems;
            document.getElementById('total-price').innerText = "Rp " + totalPrice.toLocaleString();
        }

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

        document.addEventListener("DOMContentLoaded", function () {
            renderProducts(); // Tampilkan semua dulu
            renderCart();
          
            document.querySelector("#searchProduct").addEventListener("input", function (e) {
              const keyword = e.target.value.toLowerCase();
          
              if (keyword === "") {
                renderProducts(); // Reset ke semua produk
                return;
              }
          
              const filtered = products.filter(p =>
                p.name.toLowerCase().includes(keyword) ||
                p.category.toLowerCase().includes(keyword)
              );
          
              renderFilteredProducts(filtered);
            });
        });

        document.getElementById('toggle-nominal').addEventListener('change', function () {
            const uangInput = document.getElementById('input-uang');
            const qtyInput = document.getElementById('input-qty');

            if (!selectedProduct) {
                alert("Pilih produk terlebih dahulu.");
                this.checked = false;
                return;
            }
        
            if (this.checked) {
                uangInput.style.display = 'block';
                qtyInput.readOnly = true;
                qtyInput.value = "";
            
                // Kosongkan dulu cart sementara
                const idx = cart.findIndex(c => c.id === selectedProduct.id);
                if (idx !== -1) {
                    cart.splice(idx, 1);
                }
            
                renderCart();
            
                uangInput.oninput = function () {
                    const hargaPerKg = selectedProduct.price;
                    const uang = parseFloat(this.value);
                
                    if (!isNaN(uang) && hargaPerKg > 0) {
                        let berat = uang / hargaPerKg;
                    
                        // Bulatkan ke 2 desimal sebagai angka (bukan string)
                        berat = parseFloat(berat.toFixed(2));
                    
                        qtyInput.value = berat;
                    
                        // Update cart langsung
                        const existing = cart.find(c => c.id === selectedProduct.id);
                        if (existing) {
                            existing.qty = berat;
                            existing.subtotal = uang;
                        } else {
                            cart.push({ ...selectedProduct, qty: berat, subtotal: uang });
                        }
                    
                        renderCart();
                    }
                };
            } else {
                // Mode normal manual qty
                uangInput.style.display = 'none';
                qtyInput.readOnly = false;
                qtyInput.value = "";
            }
        });
          
        document.getElementById("hamburger").addEventListener("click", toggleSidebar);
        
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
    const totalPrice = cart.reduce((acc, item) => acc + (item.subtotal || (item.price * item.qty)), 0);
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
            const payload = {
                header: "TOKO UD PELITA",
                address: "Jl. Perjuangan No.88",
                datetime: new Date().toLocaleString("id-ID"),
                items: [
                    ...cart.map(item => `${item.name}     ${item.qty} x Rp ${item.price.toLocaleString()}`),
                    `Subtotal   Rp ${totalPrice.toLocaleString()}`,
                    `Bayar      ${metodePembayaran.charAt(0).toUpperCase() + metodePembayaran.slice(1)}`
                ]
            };
            kirimStrukKePrinter(payload);
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

async function kirimStrukKePrinter(payload) {
    try {
        const res = await fetch("http://192.168.1.155:5000/print", {  // Ganti IP sesuai IP komputer kasir
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const result = await res.json();
        if (res.ok) {
            alert("✅ Struk berhasil dicetak!");
        } else {
            alert("❌ Gagal cetak: " + (result.error || "Unknown error"));
        }
    } catch (err) {
        alert("❌ Error koneksi ke printer: " + err.message);
    }
}