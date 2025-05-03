from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def cashier_menu_view(request):
    return render(request, "kasir/kasir.html", {
	"title":"Kasir",
	"user": request.user
    })