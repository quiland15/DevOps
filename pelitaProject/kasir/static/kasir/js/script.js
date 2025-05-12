function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const content = document.querySelector(".content");

  if (window.innerWidth <= 768) {
    // MODE MOBILE - toggle show/hide
    sidebar.classList.toggle("show");
  } else {
    // MODE DESKTOP - toggle collapse/expand
    sidebar.classList.toggle("collapsed");
    content.classList.toggle("full");
  }
}

document.getElementById("overlay").addEventListener("click", () => {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.remove("show");
});


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
});
