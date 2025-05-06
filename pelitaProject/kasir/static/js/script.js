function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('show');
    document.getElementById('overlay').classList.toggle('show');
  }

  // Chart.js Example
const ctx = document.getElementById('salesChart').getContext('2d');
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: chartLabels,
    datasets: [
      {
        label: 'Pertanian',
        backgroundColor: '#0d6efd',
        data: salesPertanian,
      },
      {
        label: 'Peternakan',
        backgroundColor: '#f39c12',
        data: salesPeternakan,
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false
  }
});
