from django.urls import path
from practice import views

urlpatterns = [
    path('', views.login, name='login'),
    path('main/', views.main, name='main'),
    path('api/evaluate/', views.evaluate_essay, name='evaluate_essay'),
    path('signup/', views.signup, name='signup'),
    path('logout/', views.logout_view, name='logout'),
]
