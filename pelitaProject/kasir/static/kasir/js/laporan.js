    async function toggleSidebar() {
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

    document.getElementById("hamburger").addEventListener("click", toggleSidebar);

   // Utility to format currency
    function formatCurrency(num) {
      return (
        "Rp " +
        num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      );
    }

    // Render stock reduction history
    function renderStockReductions(data) {
      const tbody = document.getElementById("stockReductionBody");
      tbody.innerHTML = "";
      if (data.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="4" class="py-2 px-3 text-center text-[#94A3B8]">Tidak ada data</td></tr>';
        return;
      }
      data.forEach((item) => {
        const tr = document.createElement("tr");
        tr.className = "border-b border-[#E2E8F0]";
        tr.innerHTML = `
          <td class="py-2 px-3">${new Date(item.date).toLocaleDateString("id-ID")}</td>
          <td class="py-2 px-3">${item.product}</td>
          <td class="py-2 px-3 text-center font-semibold">${item.quantity}</td>
          <td class="py-2 px-3">${item.reason}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    // Render revenue history
    function renderRevenues(data) {
      const tbody = document.getElementById("revenueBody");
      tbody.innerHTML = "";
      if (data.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="3" class="py-2 px-3 text-center text-[#94A3B8]">Tidak ada data</td></tr>';
        return;
      }
      data.forEach((item) => {
        const tr = document.createElement("tr");
        tr.className = "border-b border-[#E2E8F0]";
        tr.innerHTML = `
          <td class="py-2 px-3">${new Date(item.date).toLocaleDateString("id-ID")}</td>
          <td class="py-2 px-3">${item.source}</td>
          <td class="py-2 px-3 text-right font-semibold">${formatCurrency(item.amount)}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    // Render transactions with optional filter and search
    function renderTransactions(data, searchTerm = "") {
      const tbody = document.getElementById("transactionBody");
      tbody.innerHTML = "";
      let totalRevenue = 0;
      const filtered = data.filter((t) => {
        const term = searchTerm.toLowerCase();
        return (
          t.customer.toLowerCase().includes(term) ||
          t.cashier.toLowerCase().includes(term) ||
          t.payment.toLowerCase().includes(term) ||
          t.status.toLowerCase().includes(term) ||
          t.id.toString().includes(term) ||
          new Date(t.date).toLocaleDateString("id-ID").includes(term)
        );
      });
      if (filtered.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="8" class="py-2 px-3 text-center text-[#94A3B8]">Tidak ada data</td></tr>';
      } else {
        filtered.forEach((t) => {
          totalRevenue += t.total;
          const tr = document.createElement("tr");
          tr.className = "border-b border-[#E2E8F0]";
          tr.innerHTML = `
            <td class="py-2 px-3 font-semibold text-[#475569]">#${t.id}</td>
            <td class="py-2 px-3">${new Date(t.date).toLocaleDateString("id-ID")}</td>
            <td class="py-2 px-3">${t.customer}</td>
            <td class="py-2 px-3">${t.cashier}</td>
            <td class="py-2 px-3 font-semibold text-[#475569] text-center">${t.items}</td>
            <td class="py-2 px-3 font-semibold text-[#1E293B] text-right">${formatCurrency(t.total)}</td>
            <td class="py-2 px-3">${t.payment}</td>
            <td class="py-2 px-3">
              <span class="text-[10px] bg-[#DCFCE7] text-[#22C55E] px-2 py-0.5 rounded-full font-semibold">${t.status}</span>
            </td>
          `;
          tbody.appendChild(tr);
        });
      }
      document.getElementById("transactionTotal").textContent = formatCurrency(totalRevenue);
      document.getElementById("totalRevenue").textContent = formatCurrency(totalRevenue);
      document.getElementById("totalTransactions").textContent = filtered.length;
      // Calculate total items sold
      const totalItems = filtered.reduce((acc, cur) => acc + cur.items, 0);
      document.getElementById("totalItemsSold").textContent = totalItems;
      // Calculate total stock reduction for filtered period
      const filteredStock = filterByDate(stockReductions, currentFilterType, currentFilterDate);
      const totalStock = filteredStock.reduce((acc, cur) => acc + cur.quantity, 0);
      document.getElementById("totalStockReduction").textContent = totalStock;
    }

    // Filter data by date based on filterType and filterDate
    function filterByDate(data, filterType, filterDate) {
      if (!filterDate) return data;
      const dateObj = new Date(filterDate);
      return data.filter((item) => {
        const itemDate = new Date(item.date);
        if (filterType === "month") {
          return (
            itemDate.getFullYear() === dateObj.getFullYear() &&
            itemDate.getMonth() === dateObj.getMonth()
          );
        } else if (filterType === "week") {
          // Get week number of itemDate and filterDate
          const getWeekNumber = (d) => {
            d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
            const dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
          };
          return (
            itemDate.getFullYear() === dateObj.getFullYear() &&
            getWeekNumber(itemDate) === getWeekNumber(dateObj)
          );
        } else if (filterType === "day") {
          return (
            itemDate.getFullYear() === dateObj.getFullYear() &&
            itemDate.getMonth() === dateObj.getMonth() &&
            itemDate.getDate() === dateObj.getDate()
          );
        }
        return true;
      });
    }

    // Global current filter state
    let currentFilterType = "month";
    let currentFilterDate = null;

    // Apply filter and render all data accordingly
    function applyFilter() {
      const filteredTransactions = filterByDate(transactions, currentFilterType, currentFilterDate);
      const filteredRevenues = filterByDate(revenues, currentFilterType, currentFilterDate);
      const filteredStock = filterByDate(stockReductions, currentFilterType, currentFilterDate);

      renderStockReductions(filteredStock);
      renderRevenues(filteredRevenues);
      renderTransactions(filteredTransactions, document.getElementById("searchTransaction").value.trim());
    }

    // Update URL download PDF berdasarkan filter aktif
    document.getElementById("downloadLaporan").addEventListener("click", function (e) {
      if (!currentFilterDate || !currentFilterType) {
        alert("Silakan pilih filter dan tanggal terlebih dahulu!");
        e.preventDefault();
        return;
      }
    
      // Format tanggal untuk query
      const downloadLink = `laporan-pdf/?filter=${currentFilterType}&date=${currentFilterDate}`;
      this.href = downloadLink;
    });

    // Initialize date input type and value based on filter type
    function updateDateInputType() {
      const filterTypeSelect = document.getElementById("filterType");
      const filterDateInput = document.getElementById("filterDate");
      currentFilterType = filterTypeSelect.value;

      if (currentFilterType === "month") {
        filterDateInput.type = "month";
        // Set default to current month
        const now = new Date();
        filterDateInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      } else if (currentFilterType === "week") {
        filterDateInput.type = "date";
        // Set default to current date
        const now = new Date();
        filterDateInput.value = now.toISOString().slice(0, 10);
      } else if (currentFilterType === "day") {
        filterDateInput.type = "date";
        // Set default to current date
        const now = new Date();
        filterDateInput.value = now.toISOString().slice(0, 10);
      }
      currentFilterDate = filterDateInput.value;
    }

    // Event listeners
    document.getElementById("filterType").addEventListener("change", () => {
      updateDateInputType();
    });

    document.getElementById("filterDate").addEventListener("change", (e) => {
      currentFilterDate = e.target.value;
    });

    document.getElementById("applyFilter").addEventListener("click", () => {
      applyFilter();
    });

    document.getElementById("searchTransaction").addEventListener("input", (e) => {
      renderTransactions(
        filterByDate(transactions, currentFilterType, currentFilterDate),
        e.target.value.trim()
      );
    });

    

    // Initial render
    updateDateInputType();
    applyFilter();