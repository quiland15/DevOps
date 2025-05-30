from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.decorators import user_passes_test
from django.http import JsonResponse
from kasir.models import Product, Category, Transaction, InventoryLog, TransactionItem, UserProfile
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.core.serializers.json import DjangoJSONEncoder
import json
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
from reportlab.lib.pagesizes import A4
from django.http import HttpResponse
from decimal import Decimal
from django.db.models import Sum
from datetime import datetime, timedelta
from django.views.decorators.http import require_http_methods
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet


def is_admin(user):
    return user.is_authenticated and user.is_superuser

@user_passes_test(is_admin)
def admin_panel_view(request):
    return render(request, "admin_panel.html")

@login_required
def cashier_admin_view(request):
    products = Product.objects.select_related('category').all()
    return render(request, "kasir/kasirAdmin.html", {
	"title":"Kasir Admin",
	"user" : request.user,
	"products": products,
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

@csrf_exempt
@login_required
@require_http_methods(["GET", "POST", "PUT", "DELETE"])
def manage_users(request):
    if request.method == "GET":
        users = User.objects.filter(userprofile__isnull=False, is_superuser=False).select_related('userprofile')
        data = [
            {
                "id": u.id,
                "name": u.get_full_name(),
                "email": u.email,
                "role": u.userprofile.role if hasattr(u, 'userprofile') else "",
            } for u in users
        ]
        return JsonResponse(data, safe=False)

    data = json.loads(request.body)
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            name = data.get("name")
            email = data.get("email")
            role = data.get("role")
            password = data.get("password")

            if not all([name, email, role, password]):
                return JsonResponse({"status": "error", "message": "Semua field wajib diisi"}, status=400)

            user = User.objects.create_user(
                username=name,  # atau generate username unik
                email=email,
                password=password,
                first_name=name
            )

            # Buat user profile dan simpan role
            UserProfile.objects.create(
                user=user,
                role=role
            )

            return JsonResponse({"status": "success", "id": user.id})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    elif request.method == "PUT":
        try:
            user = User.objects.get(id=data["id"])
            user.first_name = data.get("name")
            user.email = data.get("email")
            user.username = data.get("email")

            if data.get("password"):
                user.set_password(data.get("password"))
            user.save()

            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.role = data.get("role")
            profile.save()

            return JsonResponse({"status": "success"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

    elif request.method == "DELETE":
        try:
            user = User.objects.get(id=data["id"])
            user.delete()
            return JsonResponse({"status": "success"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

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

            old_stock = product.stock  # ?? stok sebelum diubah
            new_stock = int(data["stock"])
            diff = new_stock - old_stock

            product.name = data["name"]
            product.category = Category.objects.get(id=int(data["category_id"]))
            product.price = int(data["price"])
            product.stock = new_stock
            product.expired_at = data["expiryDate"] or None
            product.save()

            # ? Tambahkan log stok
            if diff != 0:
                InventoryLog.objects.create(
                    product=product,
                    type='in' if diff > 0 else 'out',
                    quantity=abs(diff),
                    description='Update stok manual oleh admin'
                )

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


@login_required
def admin_laporan_view(request):
    transactions = Transaction.objects.all()
    inventory_logs = InventoryLog.objects.filter(type='out')
    transaction_items = TransactionItem.objects.select_related('transaction', 'product')

    # Total Summary
    total_revenue = transactions.aggregate(total=Sum('total_amount'))['total'] or 0
    total_stock_out = inventory_logs.aggregate(total=Sum('quantity'))['total'] or 0
    total_items_sold = transaction_items.aggregate(total=Sum('quantity'))['total'] or 0
    total_transactions = transactions.count()

    # JSON-friendly structure
    transactions_data = [
        {
            "id": t.id,
            "date": t.created_at.strftime("%Y-%m-%d"),
            "customer": "Umum",  # bisa diubah kalau kamu punya data pelanggan
            "cashier": t.cashier.username if t.cashier else "Tidak diketahui",
            "items": TransactionItem.objects.filter(transaction=t).aggregate(total=Sum('quantity'))['total'] or 0,
            "total": float(t.total_amount),
            "payment": t.payment_method,
            "status": "Selesai",  # bisa diubah sesuai field status jika kamu punya
        } for t in transactions
    ]

    revenue_data = [
        {
            "date": t.created_at.strftime("%Y-%m-%d"),
            "source": "Penjualan Produk",
            "amount": float(t.total_amount)
        } for t in transactions
    ]

    stock_data = [
        {
            "date": s.created_at.strftime("%Y-%m-%d"),
            "product": s.product.name,
            "quantity": s.quantity,
            "reason": s.description
        } for s in inventory_logs
    ]

    context = {
        "title": "Laporan",
        "user": request.user,
        "total_revenue": total_revenue,
        "total_stock_out": total_stock_out,
        "total_items_sold": total_items_sold,
        "total_transactions": total_transactions,
        "transactions": json.dumps(transactions_data, cls=DjangoJSONEncoder),
        "revenues": json.dumps(revenue_data, cls=DjangoJSONEncoder),
        "inventory_logs": json.dumps(stock_data, cls=DjangoJSONEncoder),
    }

    return render(request, "kasir/laporan.html", context)

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

@login_required
def download_low_stock_pdf(request):
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="stok_menipis.pdf"'

    # PDF Setup
    p = canvas.Canvas(response, pagesize=A4)
    width, height = A4
    y = height - 3 * cm

    # Judul
    p.setFont("Helvetica-Bold", 14)
    p.drawString(2 * cm, y, "Laporan Produk dengan Stok Menipis")
    y -= 1 * cm

    # Header Tabel
    p.setFont("Helvetica-Bold", 10)
    p.drawString(2 * cm, y, "No")
    p.drawString(3.5 * cm, y, "Nama Produk")
    p.drawString(12 * cm, y, "Jumlah Stok")
    y -= 0.5 * cm

    # Garis horizontal di bawah header
    p.line(2 * cm, y + 0.3 * cm, 18 * cm, y + 0.3 * cm)

    # Ambil data produk dengan stok <= 10
    low_stock_products = Product.objects.filter(stock__lte=5)

    # Tampilkan isi tabel
    p.setFont("Helvetica", 10)
    no = 1
    for product in low_stock_products:
        if y < 3 * cm:
            p.showPage()
            y = height - 3 * cm
        p.drawString(2 * cm, y, str(no))
        p.drawString(3.5 * cm, y, product.name)
        p.drawString(12 * cm, y, str(product.stock))
        y -= 0.5 * cm
        no += 1

    p.showPage()
    p.save()
    return response

def download_laporan_pdf(request):
    filter_type = request.GET.get('filter')  # "day", "week", "month"
    filter_date = request.GET.get('date')    # contoh: "2025-05-26" atau "2025-05"

    start_date = end_date = datetime.today()

    # Parse filter waktu
    if filter_type == "day":
        start_date = end_date = datetime.strptime(filter_date, "%Y-%m-%d")
    elif filter_type == "week":
        ref_date = datetime.strptime(filter_date, "%Y-%m-%d")
        start_date = ref_date - timedelta(days=ref_date.weekday())
        end_date = start_date + timedelta(days=6)
    elif filter_type == "month":
        year, month = map(int, filter_date.split('-'))
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = datetime(year, month + 1, 1) - timedelta(days=1)

    # Ambil data dari database
    inventory_logs = InventoryLog.objects.filter(created_at__range=(start_date, end_date))
    transactions = Transaction.objects.filter(created_at__range=(start_date, end_date))
    transaction_items = TransactionItem.objects.filter(transaction__in=transactions)

    # PDF setup
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="laporan_transaksi.pdf"'
    doc = SimpleDocTemplate(response, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    elements = []
    styles = getSampleStyleSheet()

    # Judul
    elements.append(Paragraph("Laporan Transaksi", styles['Title']))
    elements.append(Spacer(1, 12))

    # Header tabel custom: ID | Tanggal | Produk | Jumlah | Total
    elements.append(Paragraph("Detail Transaksi", styles['Heading3']))
    table_data = [["ID", "Tanggal", "Produk", "Jumlah", "Total"]]

    # Mapping transaksi
    for trx in transactions:
        trx_items = TransactionItem.objects.filter(transaction=trx)
        for item in trx_items:
            # Cari log pengurangan stok yang sesuai (optional)
            # log = inventory_logs.filter(product=item.product, created_at__date=trx.created_at.date()).first()
            log = inventory_logs.filter(
                product=item.product,
                created_at__date=trx.created_at.date()
            ).order_by('-created_at').first()
            jumlah_log = log.quantity if log else item.quantity
            table_data.append([
                f"#{trx.id}",
                trx.created_at.strftime('%d/%m/%Y'),
                item.product.name,
                str(jumlah_log),
                f"Rp {item.subtotal:,.0f}"
            ])

    # Buat tabel
    table = Table(table_data, colWidths=[2*cm, 3.5*cm, 6*cm, 2*cm, 4*cm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('ALIGN', (3,1), (3,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 24))

    # Total pendapatan
    total_pendapatan = transactions.aggregate(total=Sum('total_amount'))['total'] or 0
    elements.append(Paragraph(f"Total Pendapatan: Rp {total_pendapatan:,.0f}", styles['Heading2']))

    # Build PDF
    doc.build(elements)
    return response