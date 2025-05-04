from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.decorators import user_passes_test
from django.http import JsonResponse
from kasir.models import Product, Category
from django.views.decorators.csrf import csrf_exempt
import json


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

@login_required
def get_products(request):
    products = Product.objects.select_related('category').all()
    data = []

    for product in products:
        data.append({
	    "id": product.id,
            "name": product.name,
            "category": product.category.name if product.category else "Tidak Ada Kategori",
            "price": f"Rp {product.price:,.0f}".replace(",", "."),
            "stock": product.stock,
            "popular": product.stock <= 10,  # logika 'popular' bisa disesuaikan
            "expiryDate": product.expired_at.strftime('%Y-%m-%d') if product.expired_at else None,
        })

    return JsonResponse(data, safe=False)

@login_required
def get_categories(request):
    categories = Category.objects.all()
    data = [{"id": c.id, "name": c.name} for c in categories]
    return JsonResponse(data, safe=False)

@csrf_exempt
def manage_products(request):
    if request.method == "GET":
        products = Product.objects.select_related('category').all()
        data = [
            {
                "id": p.id,
                "name": p.name,
                "category": p.category.name if p.category else None,
                "category_id": p.category.id if p.category else None,
                "price": p.price,
                "stock": p.stock,
                "expiryDate": p.expired_at.strftime('%Y-%m-%d') if p.expired_at else None
            } for p in products
        ]
        return JsonResponse(data, safe=False)

    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            category = Category.objects.get(id=data["category_id"])
            product = Product.objects.create(
                name=data["name"],
                category=category,
                price=data["price"],
                stock=data["stock"],
                expired_at=data["expiryDate"]
            )
            return JsonResponse({"status": "success", "id": product.id})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

    elif request.method == "PUT":
        try:
            data = json.loads(request.body)
            product = Product.objects.get(id=data["id"])
            product.name = data["name"]
            product.category = Category.objects.get(id=data["category_id"])
            product.price = data["price"]
            product.stock = data["stock"]
            product.expired_at = data["expiryDate"]
            product.save()
            return JsonResponse({"status": "success"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

    elif request.method == "DELETE":
        try:
            data = json.loads(request.body)
            product = Product.objects.get(id=data["id"])
            product.delete()
            return JsonResponse({"status": "success"})
        except Product.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Produk tidak ditemukan"}, status=404)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

    return JsonResponse({"status": "error", "message": "Metode tidak diizinkan"}, status=405)