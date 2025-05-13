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

  // Chart.js Example
document.addEventListener("DOMContentLoaded", () => {
  const labels = JSON.parse(document.getElementById("labels-data").textContent);
  const pertanian = JSON.parse(document.getElementById("pertanian-data").textContent);
  const peternakan = JSON.parse(document.getElementById("peternakan-data").textContent);

  const ctx = document.getElementById('salesChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Pertanian',
          backgroundColor: '#0d6efd',
          data: pertanian,
        },
        {
          label: 'Peternakan',
          backgroundColor: '#f39c12',
          data: peternakan,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true
    }
  });

  document.getElementById("hamburger").addEventListener("click", toggleSidebar);
});
