from django.urls import path
from .views.auth import login_view, logout_view
from .views.dashboard import adminDashboard_view, kasirDashboard_view

urlpatterns = [
    path("login/", login_view, name="login"),
    path("logout/", logout_view, name="logout"),
    path("adminDashboard/", adminDashboard_view, name="admindashboard"),
    path("kasirDashboard/", kasirDashboard_view, name="kasirdashboard"),
]