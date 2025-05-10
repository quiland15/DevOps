from django.shortcuts import render

# Create your views here.
def index(request):
    context = {
        'title':'Quiland | Portofolio',
    }
    return render(request, 'MyPortofolio/index.html', context)