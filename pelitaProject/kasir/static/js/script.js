function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('show');
    document.getElementById('overlay').classList.toggle('show');
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
});
