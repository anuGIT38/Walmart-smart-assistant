import os
import requests
import re
import json
import datetime
from dotenv import load_dotenv
from textblob import TextBlob
from difflib import get_close_matches


from voice_input import get_voice_input
# Load API key
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"

# Load Walmart product data
try:
    with open("walmart_products.json", "r") as f:
        all_products = json.load(f)
except FileNotFoundError:
    print("⚠️ Error: 'walmart_products.json' file not found.")
    all_products = []

# Build a list of known brands
known_brands = list(set([product["brand"].lower()
                    for product in all_products]))


def correct_brand_names(query):
    words = query.lower().split()
    corrected = []
    for word in words:
        close = get_close_matches(word, known_brands, n=1, cutoff=0.8)
        if close:
            corrected.append(close[0])
        else:
            corrected.append(word)
    return " ".join(corrected)


# Session memory
session_context = {
    "last_query": None,
    "user_preferences": {
        "price_range": None,
        "preferred_brands": [],
        "tags": []
    }
}

# Synonym mapping for category normalization
synonym_map = {
    "mobile": "phone", "cellphone": "phone", "mobile phone": "phone",
    "snack": "snacks", "chips": "snacks",
    "laptop": "electronics",
    "shoes": "footwear", "tee": "t-shirt", "trousers": "pants", "pant": "pants",
    "cream": "skincare",
}
# spelling correction


def correct_spelling(query):
    return str(TextBlob(query).correct())


def normalize_category(cat):
    return synonym_map.get(cat.lower(), cat.lower())


# Step 1:Query Categorization

def categorize_query(user_query):
    prompt = f"""
Classify the user query into a JSON object with the following keys:
- "intent": the user's goal (e.g., "recommend", "compare", "explain", "analyze", "search", "review")
- "category": broad product category (e.g., "shampoo", "phone", "snacks", "jeans")
- "filters": a dictionary of constraints (e.g., price range, brand, features)

Respond ONLY in this format (JSON only, no extra text, no explanation.)


User query: "{user_query}"
"""

    headers = {"Content-Type": "application/json"}
    payload = {"contents": [{"parts": [{"text": prompt}]}]}

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        text_response = response.json(
        )["candidates"][0]["content"]["parts"][0]["text"]
        return extract_json(text_response)
    except Exception as e:
        print("❌ Gemini categorization call failed:", e)
        return {"intent": "recommend", "category": "general", "filters": {}}


# Extract JSON
def extract_json(text):
    try:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group())

    except json.JSONDecodeError as e:
        print("JSON decode error:", e)
    return None

# Step 2: Retrieve natching products


def retrieve_products(parsed_query):
    results = []
    category = normalize_category(parsed_query["category"])
    filters = parsed_query.get("filters", {})

    for product in all_products:
        if category in product["category"].lower():
            match = True
            for key, val in filters.items():
                if key == "brand":
                    if isinstance(val, str):
                        if val.lower() not in product["brand"].lower():
                            match = False
                    else:
                        match = False  # Skip if val is not string
                elif key == "price":
                    try:
                        if int(product.get("price", 0)) > int(val):
                            match = False
                    except:
                        match = False
                elif key == "tags":
                    user_tags = [t.strip().lower() for t in str(val).split(",")]
                    product_tags = [t.lower() for t in product.get("tags", [])]
                    if not any(tag in product_tags for tag in user_tags):
                        match = False
            if match:
                results.append(product)
    return results[:5]


# Step 3: Prompt Generation


def build_prompt(parsed_query, product_data=None):
    task = parsed_query["intent"].capitalize()
    category = parsed_query["category"]
    filters = parsed_query.get("filters", {})
    
    if task.lower() == "compare":
        prompt = f"You are a smart assistant. Compare the pros and cons of top brands of {category}. Mention which is more suitable bsed on filters like {filters}."
    elif task.lower() == "explain":
        prompt= f"Explain important things a user should know about buying {category} with filters: {filters}. Focus on ingredients, safety, health, sustanibility."
    else:
        prompt = f"You are a helpful shopping assistant. {task} a {category}"

    if filters:
        prompt += " with the following conditions:\n"
        for k, v in filters.items():
            prompt += f"- {k}: {v}\n"
    if any(term in user_query.lower() for term in ["healthy", "healthiest", "low fat", "organic", "nutritious"]):
        prompt += "\nFocus on nutritional value: low fat, organic ingredients, fewer additives, high protein."

    if product_data:
        prompt += "\nHere are some products to consider:\n"
        for item in product_data:
            prompt += f"- {item['name']}, ₹{item['price']}, Features: {item['features']}\n"

    prefs = session_context["user_preferences"]
    if prefs["preferred_brands"]:
        prompt += f"\nUser prefers brands like: {', '.join(prefs['preferred_brands'])}"
    if prefs["price_range"]:
        prompt += f"\nTry to stay under ₹{prefs['price_range']}"
    if prefs["tags"]:
        prompt += f"\nUser prefers products with these tags: {', '.join(prefs['tags'])}"

    prompt += "\nRespond in 3 bullet points. Keep the response short and relevant.If any product is eco-friendly, healthy or sustainable, highlight that in your response."

    return prompt

# Step 4: Ask Gemini


def ask_gemini(prompt):
    headers = {"Content-Type": "application/json"}
    payload = {"contents": [{"parts": [{"text": prompt}]}]}

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        print("❌ Gemini response generation failed:", e)
        return "⚠️ Sorry, I couldn't fetch a response."


# Step 5: Log for feedback analytics
def log_interaction(user_query, structured_query, final_prompt, gemini_response, feedback=None, correction=None):
    log_entry = {
        "timestamp": str(datetime.datetime.now()),
        "user_query": user_query,
        "structured_query": structured_query,
        "prompt": final_prompt,
        "response": gemini_response,
        "feedback": feedback,
        "correction": correction,
    }
    with open("logs.jsonl", "a") as f:
        f.write(json.dumps(log_entry) + "\n")

# Main pipeline for user query


def get_answer_for_user(user_query):
    user_query = correct_spelling(user_query)
    user_query = correct_brand_names(user_query)
    # If vague query and session has context
    if any(keyword in user_query.lower() for keyword in ["another", "cheaper", "better", "more"]):
        if session_context["last_query"]:
            print("ℹ️ Detected follow-up query. Using context from previous query.")
            parsed = session_context["last_query"]
            user_query = f"{parsed['intent']} {parsed['category']} with changes: {user_query}"
        else:

            return None, None, "❌ Sorry, I need more context to help with that."

    parsed = categorize_query(user_query)
    if not parsed:
        return None, None, "❌ Sorry, I couldn't understand your request."

    session_context["last_query"] = parsed
    if "price" in parsed.get("filters", {}):
        session_context["user_preferences"]["price_range"] = parsed["filters"]["price"]
    if "brand" in parsed.get("filters", {}):
        brand = parsed["filters"]["brand"]
        if brand not in session_context["user_preferences"]["preferred_brands"]:
            session_context["user_preferences"]["preferred_brands"].append(
                brand)
    if "tags" in parsed.get("filters", {}):
        session_context["user_preferences"]["tags"] = parsed["filters"]["tags"].split(
            ",")

    product_matches = retrieve_products(parsed)
    if not product_matches:
        print("ℹ️ Trying again with relaxed filters.")
        parsed["filters"].pop("price", None)
        product_matches = retrieve_products(parsed, all_products)

    final_prompt = build_prompt(
        parsed, product_matches if product_matches else None)
    gemini_response = ask_gemini(final_prompt)
    return parsed, final_prompt, gemini_response


# Main CLI loop
if __name__ == "__main__":
    mode = input("Type 'v' for voice input or enter your query: ")
    if mode.lower() == 'v':
        user_query = get_voice_input()
        if not user_query:
            exit()
    else:
        user_query = mode
    parsed, prompt, gemini_reply = get_answer_for_user(user_query)

    print("\n🛍️ Assistant says:\n" + gemini_reply)

# Feedback loop
    feedback = input("\nWas this helpful? (y/n): ")
    correction = ""
    if feedback.lower() == "n":
        correction = input(
            "✏️ Suggest a better answer or keyword to improve: ")
    if parsed and prompt and gemini_reply:
        log_interaction(user_query, parsed, prompt,
                        gemini_reply, feedback, correction)
