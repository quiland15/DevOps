from django.urls import path
from .views.auth import login_view, logout_view
from .views.dashboard import adminDashboard_view, kasirDashboard_view
from .views.cashier import cashier_menu_view
from .views.admin import cashier_admin_view, admin_product_view, admin_laporan_view, get_products

urlpatterns = [
    path("login/", login_view, name="login"),
    path("logout/", logout_view, name="logout"),
    path("adminDashboard/", adminDashboard_view, name="admindashboard"),
    path("kasirDashboard/", kasirDashboard_view, name="kasirdashboard"),
    path("kasir/", cashier_menu_view, name="kasir"),
    path("adminKasir/", cashier_admin_view, name="adminKasir"),
    path("product/", admin_product_view, name="product"),
    path("laporan/", admin_laporan_view, name="laporan"),
    path("api/products/", get_products, name='get_products'),
]