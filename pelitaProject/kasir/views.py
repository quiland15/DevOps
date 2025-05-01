from django.shortcuts import render

# Create your views here.
def index(request):
    context = {
        'title':'UD.PELITA | Kasir',
    }
    return render(request, 'kasir/index.html', context)