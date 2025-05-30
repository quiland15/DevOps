from django.urls import path
from .views.auth import login_view, logout_view
from .views.dashboard import adminDashboard_view, kasirDashboard_view
from .views.cashier import cashier_menu_view, checkout
from .views.admin import cashier_admin_view, admin_product_view, admin_laporan_view, get_products, manage_products, get_categories, download_low_stock_pdf,admin_settings_view, manage_users, download_laporan_pdf

urlpatterns = [
    path("login/", login_view, name="login"),
    path("logout/", logout_view, name="logout"),
    path("adminDashboard/", adminDashboard_view, name="admindashboard"),
    path("kasirDashboard/", kasirDashboard_view, name="kasirdashboard"),
    path("kasir/", cashier_menu_view, name="kasir"),
    path("adminKasir/", cashier_admin_view, name="adminKasir"),
    path("product/", admin_product_view, name="product"),
    path("laporan/", admin_laporan_view, name="laporan"),
    path("pengaturan/", admin_settings_view, name="pengaturan"),
    path("api/products/", get_products, name='get_products'),
    path("api/manageProducts/", manage_products, name='manage_products'),
    path("api/categories/", get_categories, name='get_categories'),
    path('checkout/', checkout, name='checkout'),
    path('kasir/low-stock-pdf/',download_low_stock_pdf, name='download_low_stock_pdf'),
    path('api/users/', manage_users, name='manage_users'),
    path('laporan/pdf/', download_laporan_pdf, name='download_laporan_pdf'),
]