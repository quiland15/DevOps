from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def adminDashboard_view(request):
    return render(request, "kasir/adminDashboard.html", {
	"title":"Dashboard Admin",
	"user": request.user
    })

@login_required
def kasirDashboard_view(request):
    return render(request, "kasir/cashierDashboard.html", {
	"title":"Dashboard Kasir",
	"user": request.user
    })
