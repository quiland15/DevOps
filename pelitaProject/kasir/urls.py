from django.urls import path
from .views.auth import login_view
#from .views.dashboard import dashboard_view
#from .views.admin import admin_panel_view
#from .views.cashier import cashier_dashboard_view

urlpatterns = [
    path("login/", login_view, name="login"),
    #path("logout/", logout_view, name="logout"),
    #path("dashboard/", dashboard_view, name="dashboard"),
    #path("admin-panel/", admin_panel_view, name="admin_panel"),
    #path("cashier/", cashier_dashboard_view, name="cashier_dashboard"),
]