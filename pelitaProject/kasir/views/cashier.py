from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from kasir.models import Transaction, TransactionItem, Product, InventoryLog
from django.contrib.auth.decorators import login_required
import json
from decimal import Decimal

@login_required
def cashier_menu_view(request):
    products = Product.objects.select_related('category').all()
    return render(request, "kasir/kasir.html", {
        "title": "Kasir",
        "user": request.user,
        "products": products,
    })

@csrf_exempt
@login_required
def checkout(request):
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body)

        items = data.get("items", [])
        total = Decimal(data.get("total", 0))
        payment_method = data.get("payment_method", "Tunai")
        paid_amount = Decimal(data.get("paid_amount", 0))
        customer_name = data.get("customer", "")

        if not items or total <= 0:
            return JsonResponse({"status": "error", "message": "Data tidak valid."}, status=400)

        change_amount = paid_amount - total

        # Buat transaksi
        trx = Transaction.objects.create(
            cashier=request.user,
            total_amount=total,
            payment_method=payment_method,
            paid_amount=paid_amount,
            change_amount=change_amount,
        )

        # Simpan item dan update stok
        for item in items:
            product_id = item.get("id")
            qty = int(item.get("qty"))
            product = Product.objects.get(id=product_id)

            subtotal = product.price * qty

            TransactionItem.objects.create(
                transaction=trx,
                product=product,
                quantity=qty,
                price=product.price,
                subtotal=subtotal
            )

            # Kurangi stok
            product.stock -= qty
            product.save()

            # Simpan log stok keluar
            InventoryLog.objects.create(
                product=product,
                type="out",
                quantity=qty,
                description=f"Penjualan kepada {customer_name}"
            )

        return JsonResponse({"status": "success", "transaction_id": trx.id})

    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)