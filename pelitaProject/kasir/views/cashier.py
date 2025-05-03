from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def cashier_dashboard_view(request):
    if not request.user.groups.filter(name='Cashier').exists():
        return render(request, 'login')
    return render(request, "kasir/kasir.html")
