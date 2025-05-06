from django.shortcuts import render
from django.db.models import Sum, Count
from django.contrib.auth.decorators import login_required
from kasir.models import Product, Transaction, TransactionItem, InventoryLog
# from django.utils.timezone import now
# from datetime import timedelta
from django.db.models.functions import TruncMonth

@login_required
def adminDashboard_view(request):
    total_penjualan = Transaction.objects.count()
    total_pendapatan = Transaction.objects.aggregate(total=Sum('total_amount'))['total'] or 0
    total_item_terjual = TransactionItem.objects.aggregate(total=Sum('quantity'))['total'] or 0
    total_produk = Product.objects.count()
    low_stock_products = Product.objects.filter(stock__lte=2).order_by('stock')[:5]


    monthly_data = (
        TransactionItem.objects
        .select_related('product__category', 'transaction')
        .annotate(month=TruncMonth('transaction__created_at'))
        .values('month', 'product__category__name')
        .annotate(total=Sum('quantity'))
        .order_by('month')
    )

    labels = []
    sales_pertanian = []
    sales_peternakan = []

    for data in monthly_data:
        month_str = data['month'].strftime('%b')  # contoh: Jan, Feb
        if month_str not in labels:
            labels.append(month_str)
            sales_pertanian.append(0)
            sales_peternakan.append(0)

        index = labels.index(month_str)
        category_name = data['product__category__name'].lower()

        if 'pertanian' in category_name:
            sales_pertanian[index] += data['total']
        elif 'peternakan' in category_name:
            sales_peternakan[index] += data['total']

    # Produk populer (dari TransactionItem)
    produk_populer = (
        TransactionItem.objects.values('product__name')
        .annotate(jumlah=Sum('quantity'), harga=Sum('price'))
        .order_by('-jumlah')[:3]
    )

    # Transaksi terbaru (5 terakhir)
    transaksi_terbaru = Transaction.objects.select_related('cashier').order_by('-created_at')[:5]

    context = {
        "title": "Dashboard Admin",
        "user": request.user,
        "total_penjualan": total_penjualan,
        "total_pendapatan": total_pendapatan,
        "total_item_terjual": total_item_terjual,
        "total_produk": total_produk,
        "produk_populer": produk_populer,
        "transaksi_terbaru": transaksi_terbaru,
	"low_stock_products" : low_stock_products,
        "sales_pertanian": sales_pertanian,
        "sales_peternakan": sales_peternakan,
    }

    return render(request, "kasir/adminDashboard.html", context)

@login_required
def kasirDashboard_view(request):
    return render(request, "kasir/cashierDashboard.html", {
	"title":"Dashboard Kasir",
	"user": request.user
    })
