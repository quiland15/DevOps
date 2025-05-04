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
            "category_id": product.category.id if product.category else None,
            "price": f"Rp {product.price:,.0f}".replace(",", "."),
            "stock": product.stock,
            "popular": product.stock <= 10,
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
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            name = data.get("name")
            category_id = data.get("category_id")
            price = data.get("price")
            stock = data.get("stock")
            expiry = data.get("expiryDate")

            # Validasi minimal
            if not all([name, category_id, price, stock]):
                raise ValueError("Semua field wajib diisi.")

            category = Category.objects.get(id=int(category_id))
            expired_at = expiry if expiry else None

            product = Product.objects.create(
                name=name,
                category=category,
                price=int(price),
                stock=int(stock),
                expired_at=expired_at
            )
            return JsonResponse({"status": "success", "id": product.id})

        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

    elif request.method == "PUT":
        try:
            data = json.loads(request.body)
            product = Product.objects.get(id=data["id"])

            product.name = data["name"]
            product.category = Category.objects.get(id=int(data["category_id"]))
            product.price = int(data["price"])
            product.stock = int(data["stock"])
            product.expired_at = data["expiryDate"] or None
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
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

    return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)