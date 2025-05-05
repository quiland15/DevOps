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
    
        renderProducts();
        renderCart();