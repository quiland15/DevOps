from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.decorators import user_passes_test

def is_admin(user):
    return user.is_authenticated and user.is_superuser

@user_passes_test(is_admin)
def admin_panel_view(request):
    return render(request, "admin_panel.html")

@login_required
def cashier_admin_view(request):
    return render(request, "kasir/kasirAdmin.html", {
	"title":"Kasir Admin",
	"user" : request.user
    })

