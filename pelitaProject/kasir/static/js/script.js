function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('show');
    document.getElementById('overlay').classList.toggle('show');
  }

  // Chart.js Example
  const ctx = document.getElementById('salesChart').getContext('2d');
  const salesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
      datasets: [
        {
          label: 'Pertanian',
          backgroundColor: '#0d6efd',
          data: [10, 20, 30, 40, 50, 60]
        },
        {
          label: 'Peternakan',
          backgroundColor: '#f39c12',
          data: [60, 50, 40, 30, 20, 10]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true
    }
  });