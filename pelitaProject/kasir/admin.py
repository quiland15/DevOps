from django.contrib import admin
from .models import (
    UserProfile,
    Category,
    Product,
    Transaction,
    TransactionItem,
    InventoryLog,
    Setting,
)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'created_at', 'updated_at')

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'stock', 'expired_at')
    list_filter = ('category', 'expired_at')
    search_fields = ('name',)

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'cashier', 'total_amount', 'payment_method', 'created_at')
    list_filter = ('payment_method', 'created_at')
    date_hierarchy = 'created_at'

@admin.register(TransactionItem)
class TransactionItemAdmin(admin.ModelAdmin):
    list_display = ('transaction', 'product', 'quantity', 'price', 'subtotal')
    list_filter = ('product',)

@admin.register(InventoryLog)
class InventoryLogAdmin(admin.ModelAdmin):
    list_display = ('product', 'type', 'quantity', 'description', 'created_at')
    list_filter = ('type', 'created_at')

@admin.register(Setting)
class SettingAdmin(admin.ModelAdmin):
    list_display = ('key', 'value')
