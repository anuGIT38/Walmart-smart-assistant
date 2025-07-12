category_budget_thresholds = {
    "snacks": 30,
    "smartphone": 15000,
    "laptop": 40000,
    "electronics": 20000,
    "shampoo": 100,
    "milk": 60,
    "apparel": 2000
}
ALLOWED_FILTER_KEYS = {
    "price", "brand", "tags", "health_attributes", "item", "name", "type", "strength", "fat_content", "organic"
}
CATEGORY_ALIASES = {
    "grocery": ["milk", "snacks", "beverage","coffee"],
    "food_and_beverage": ["milk", "snacks", "beverage"],
    "beverage": ["juice", "tea", "coffee", "milk"],
    "dairy": ["milk", "cheese", "curd"],
    "electronics": ["laptop", "smartphone"],
    "food": ["snacks"],
}
