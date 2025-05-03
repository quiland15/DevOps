from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from kasir.models import UserProfile

def login_view(request):
    context = {
        'title':'Login - PELITAKAS',
        'css':'css/login.css',
    }
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)

            # Cek role dan redirect
            role = user.userprofile.role
            if role == "admin":
                return redirect("admindashboard")
            elif role == "kasir":
                return redirect("kasirdashboard")
            else:
                messages.error(request, "Role tidak dikenali.")
                return redirect("login")
        else:
            messages.error(request, "Login gagal. Username atau password salah.")
    
    return render(request, "kasir/index.html", context)

def logout_view(request):
    logout(request)
    return redirect("login")
