from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.decorators import user_passes_test
from django.http import JsonResponse
from kasir.models import Product

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

@login_required
def admin_product_view(request):
    return render(request, "kasir/product.html", {
        "title":"Product",
        "user" : request.user
    })

@login_required
def admin_laporan_view(request):
    return render(request, "kasir/laporan.html", {
        "title":"Laporan",
        "user" : request.user
    })

@login_required
def admin_settings_view(request):
    return render(request, "kasir/settings.html", {
        "title":"Settings",
        "user" : request.user
    })

def get_products(request):
    products = Product.objects.select_related('category').all()
    data = []

    for product in products:
        data.append({
            "name": product.name,
            "category": product.category.name if product.category else "Tidak Ada Kategori",
            "price": f"Rp {product.price:,.0f}".replace(",", "."),
            "stock": product.stock,
            "popular": product.stock <= 10,  # logika 'popular' bisa disesuaikan
            "expiryDate": product.expired_at.strftime('%Y-%m-%d') if product.expired_at else None,
        })

    return JsonResponse(data, safe=False)