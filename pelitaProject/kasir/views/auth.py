from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages

def login_view(request):
    if request.method == "POST":
        user = authenticate(
            request,
            username=request.POST["username"],
            password=request.POST["password"]
        )
        if user is not None:
            login(request, user)
            return redirect("dashboard")
        else:
            messages.error(request, "Login gagal.")
    return render(request, "login.html")

def logout_view(request):
    logout(request)
    return redirect("login")
