from django.shortcuts import render

# Create your views here.
def index(request):
    context = {
        'title':'UD.PELITA | Portofolio',
    }
    return render(request, 'portofolio/index.html', context)