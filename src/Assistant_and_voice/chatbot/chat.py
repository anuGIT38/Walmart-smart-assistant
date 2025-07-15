"""
chat.py - Main chatbot logic for SmartAssistant
Handles user queries, product search, filtering, context, and follow-up logic.
Integrates with Gemini API for intent/category extraction and supports robust error handling and conversational context.
"""
import os
import requests
import re
import json
import datetime
from dotenv import load_dotenv
from typing import Dict, List, Optional, Any
from difflib import get_close_matches
from dataclasses import dataclass, field
import logging
from functools import lru_cache
try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    cred = credentials.Certificate("./firebaseKey.json")
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    FIRESTORE_AVAILABLE = True
except ImportError:
    firebase_admin = None
    credentials = None
    firestore = None
    FIRESTORE_AVAILABLE = False

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load API key
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("Missing GEMINI_API_KEY in environment variables")

API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"

@dataclass
class Product:
    name: str
    brand: str
    price: float
    category: str
    features: str
    id: str = ""
    tags: List[str] = field(default_factory=list)
    zone: Optional[str] = None

class ProductDatabase:
    def __init__(self, collection_name: str):
        if not FIRESTORE_AVAILABLE:
            raise ImportError("firebase_admin is not installed. Please install it with 'pip install firebase-admin'.")
        self.products = self._load_products_from_firestore(collection_name)
        self.known_brands = self._extract_brands()
        self.known_products = self._extract_product_names()
        # Debug prints removed

    def _extract_product_names(self) -> List[str]:
        """Extract product names for fuzzy matching"""
        return [p.name.lower() for p in self.products]

    def _load_products_from_firestore(self, collection_name: str) -> List[Product]:
        if not FIRESTORE_AVAILABLE or firestore is None:
            raise ImportError("firebase_admin is not installed or Firestore is unavailable. Please install it with 'pip install firebase-admin'.")
        db = firestore.client()
        products_ref = db.collection(collection_name)
        docs = list(products_ref.stream())
        # print(f"Fetched {len(docs)} documents from Firestore collection '{collection_name}'")  # Debug print removed
        products = []
        for doc in docs:
            p = doc.to_dict()
            # print("Firestore document:", p)  # Debug print removed
            if not p:
                logger.warning(f"Skipping empty Firestore document: {doc.id}")
                continue
            if not all(k in p for k in ['name', 'brand', 'price', 'category', 'features']):
                logger.warning(f"Skipping product missing required fields: {p}")
                continue
            if isinstance(p['price'], str):
                p['price'] = float(p['price'].replace('₹', '').replace(',', ''))
            p.setdefault('id', doc.id)
            p.setdefault('tags', [])
            products.append(Product(**p))
        return products

    def _extract_brands(self) -> List[str]:
        return list(set(p.brand.lower() for p in self.products))

    def get_product_location(self, product_name: str) -> str:
        # Find the product by name (case-insensitive, partial match)
        product = next((p for p in self.products if product_name.lower() in p.name.lower()), None)
        if not product:
            return "Sorry, I couldn't find that product in the store."

        zone = getattr(product, 'zone', None)
        category = getattr(product, 'category', None)
        if not zone and not category:
            return f"Sorry, I couldn't determine the location for {product.name}."

        if firestore is None:
            raise ImportError("firebase_admin is not installed or Firestore is unavailable. Please install it with 'pip install firebase-admin'.")

        db = firestore.client()
        layout = None

        # Try exact match with zone
        if zone:
            layout_docs = db.collection('store_layout').where('zone', '==', zone).stream()
            for doc in layout_docs:
                layout = doc.to_dict()
                break

        # If not found, try fuzzy/substring match with zone
        if not layout and zone:
            all_layouts = db.collection('store_layout').stream()
            for doc in all_layouts:
                l = doc.to_dict()
                if zone.lower() in l.get('zone', '').lower() or l.get('zone', '').lower() in zone.lower():
                    layout = l
                    break

        # If still not found, try category as before
        if not layout and category:
            all_layouts = db.collection('store_layout').stream()
            for doc in all_layouts:
                l = doc.to_dict()
                if category.lower() in l.get('zone', '').lower() or l.get('zone', '').lower() in category.lower():
                    layout = l
                    break
            if not layout:
                all_layouts = db.collection('store_layout').stream()
                for doc in all_layouts:
                    l = doc.to_dict()
                    if category.lower() in l.get('section', '').lower() or l.get('section', '').lower() in category.lower():
                        layout = l
                        break

        if not layout:
            return f"Sorry, I couldn't find the location for {product.name}."

        return (
            f"{product.name} is located in Aisle {layout.get('aisle', 'N/A')}, "
            f"Section {layout.get('section', 'N/A')}, "
            f"Shelf {layout.get('shelf', 'N/A')} (Zone: {layout.get('zone', 'N/A')})."
        )

class ChatSession:
    def __init__(self):
        self.last_query: Optional[Dict[str, Any]] = None
        self.preferences = {
            'price_range': None,
            'preferred_brands': [],
            'tags': []
        }

class ShoppingAssistant:
    def __init__(self, product_db: ProductDatabase):
        """Initialize the shopping assistant with a product database."""
        self.db = product_db
        self.session = ChatSession()
        from config import category_budget_thresholds
        self.budget_thresholds = category_budget_thresholds

    def _clean_query(self, query: str) -> str:
        """Fuzzy-corrects brand and product names in the query."""
        query = query.lower()
        words = query.split()
        corrected = []
        for word in words:
            cleaned_matches_source = [str(x).lower() for x in self.db.known_brands + self.db.known_products if isinstance(x, str)]
            matches = get_close_matches(word, cleaned_matches_source, n=1, cutoff=0.75)
            corrected.append(matches[0] if matches else word)
        return ' '.join(corrected)

    def process_query(self, user_query: str, max_retries=2) -> Dict[str, Any]:
        query_words = re.findall(r'\w+', user_query.lower())
        stopwords = {"is", "are", "the", "a", "an", "available", "in", "on", "at", "of", "for", "to", "with", "do", "does", "hey"}
        filtered_words = [w for w in query_words if w not in stopwords]
        matched_product = None
        for product in self.db.products:
            product_name = product.name.lower()
            if all(word in product_name for word in filtered_words):
                matched_product = product
                break

        if matched_product:
            # Update session context for follow-up queries
            self.session.last_query = {
                "category": matched_product.category,
                "intent": "search",
                "filters": {},
            }
            suggestions = [
                p for p in self.db.products
                if p.category == matched_product.category and p != matched_product
            ]
            suggestions = sorted(suggestions, key=lambda p: p.price)[:3]
            return {
                "response": f"Yes, {matched_product.name} is available! Price: ₹{matched_product.price}.",
                "products": [matched_product] + suggestions
            }
        if not user_query or not user_query.strip():
            return {
                "response": "Please enter a product or category to search for.",
                "products": []
            }
        nonsensical_patterns = [r'^[^a-zA-Z0-9]+$', r'^[a-zA-Z]$', r'^\s*$']
        for pat in nonsensical_patterns:
            if re.match(pat, user_query):
                return {
                    "response": "Sorry, I couldn't understand your request. Could you rephrase or specify a product/category?",
                    "products": []
                }
        if user_query.lower().startswith("where is"):
            product_name = user_query[8:].strip(" ?")
            location_response = self.db.get_product_location(product_name)
            return {"response": location_response, "products": []}
        for attempt in range(max_retries + 1):
            try:
                cleaned_query = self._clean_query(user_query)
                parsed = self._categorize_query(cleaned_query)
                parsed["original_query"] = user_query
                if parsed and parsed.get("category"):
                    mapped = self._map_to_known_category(parsed["category"])
                    parsed["category"] = mapped
                if "filters" in parsed and not isinstance(parsed["filters"], dict):
                    logger.error(f"[PROCESS_QUERY] Expected filters to be dict, got {type(parsed['filters'])}: {parsed['filters']}")
                    parsed["filters"] = {}
                # If only price is present, use last category from session
                if (not parsed.get("category") or parsed["category"] in ["", "general", "product", "item", "unspecified", "unknown", "none"]) and "price" in parsed.get("filters", {}):
                    last_category = self.session.last_query.get("category") if self.session.last_query else None
                    if last_category:
                        parsed["category"] = last_category
                if not parsed.get("category"):
                    return {
                        "response": "I'm not sure which category you're referring to. Could you be more specific?",
                        "products": []
                    }
                if not parsed:
                    if attempt < max_retries:
                        continue
                    return {"error": "Could not understand your request"}
                self._update_session(parsed)
                products = self._retrieve_products(parsed)
                try:
                    response = self._generate_response(parsed, products)
                    logger.info("[GENERATION] Gemini response used.")
                except Exception as e:
                    logger.error(f"Response generation failed: {str(e)}")
                    response = self._generate_fallback_response(parsed, products)
                self._log_interaction(user_query, parsed, products, response)
                return {
                    "response": response,
                    "products": products[:3]
                }
            except Exception as e:
                logger.error(f"Error processing query: {str(e)}")
                if attempt == max_retries:
                    return {"response": "I'm having trouble processing your request. Please try again later.", "products": []}
        return {"response": "An unexpected error occurred.", "products": []}

    @lru_cache(maxsize=100)
    def _categorize_query(self, query: str) -> Dict:
        """Categorize query using Gemini API and normalize filters."""
        compare_keywords = ["compare", "vs", "versus", "difference between"]
        nutrition_keywords = ["nutrition", "nutritious", "protein", "vitamin", "calorie", "healthy", "health", "organic"]
        intent = "search"
        for word in compare_keywords:
            if word in query.lower():
                intent = "compare"
                break
        prompt = {
            "contents": [{
                "parts": [{
                    "text": f"""
                    Categorize this shopping query:
                    {query}
                    Return JSON with: intent, category, filters
                    """
                }]
            }]
        }
        try:
            response = requests.post(
                API_URL,
                json=prompt,
                timeout=20
            )
            logger.debug("Raw Gemini response:", response.text)
            if response.status_code == 503:
                raise requests.exceptions.RequestException("Service Unavailable")
            parsed = self._extract_json(response.text)
            if parsed is None:
                parsed = self._local_parse_query(query)
            if "filters" in parsed and not isinstance(parsed["filters"], dict):
                logger.error(f"[CATEGORIZE] Expected filters to be dict, got {type(parsed['filters'])}: {parsed['filters']}")
                parsed["filters"] = {}
            parsed["intent"] = intent
            if any(word in query.lower() for word in nutrition_keywords):
                filters = parsed.get("filters", {})
                if not isinstance(filters, dict):
                    filters = {}
                filters["nutrition_focus"] = True
                parsed["filters"] = filters
            category = parsed.get("category", "").lower().strip()
            filters = parsed.get("filters", {})
            from config import ALLOWED_FILTER_KEYS
            normalized_filters = {}
            for key, val in filters.items():
                if key.lower() in ALLOWED_FILTER_KEYS or key == "nutrition_focus":
                    if isinstance(val, (str, int, float)):
                        normalized_filters[key.lower()] = val
                    elif isinstance(val, list) and all(isinstance(v, (str, int, float)) for v in val):
                        normalized_filters[key.lower()] = val
            if "nutrition_focus" in filters:
                normalized_filters["nutrition_focus"] = True
            parsed["filters"] = normalized_filters
            return parsed
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {str(e)}")
            return self._local_parse_query(query)

    def _local_parse_query(self, query: str) -> Dict:
        """Basic local query parsing when API fails."""
        query = query.lower()
        fallback = {
            "intent": "search",
            "category": "products",
            "filters": {}
        }
        all_categories = set(p.category.lower() for p in self.db.products)
        # Debug prints removed
        for cat in all_categories:
            if cat in query:
                fallback["category"] = cat
                break
        # Debug prints removed

        # Try to match product names if no category found (fuzzy and substring match)
        if fallback["category"] == "products":
            product_names = [p.name.lower() for p in self.db.products]
            query_words = query.split()
            found = False
            # Try all n-grams from the query (from longest to shortest)
            for n in range(len(query_words), 0, -1):
                for i in range(len(query_words) - n + 1):
                    ngram = ' '.join(query_words[i:i+n])
                    # Fuzzy match ngram to any product name
                    matches = get_close_matches(ngram, product_names, n=1, cutoff=0.6)
                    if matches:
                        matched_name = matches[0]
                        for product in self.db.products:
                            if matched_name in product.name.lower():
                                fallback["category"] = product.category.lower()
                                found = True
                                break
                    if found:
                        break
                if found:
                    break
            if not found:
                # fallback to substring match if no fuzzy match
                for product in self.db.products:
                    if any(word in product.name.lower() for word in query_words if len(word) > 2):
                        fallback["category"] = product.category.lower()
                        break

        price_match = re.search(r'under\s*(\d+)', query)
        if price_match:
            fallback["filters"]["price"] = float(price_match.group(1))
        return fallback

    def _map_to_known_category(self, raw_category: str) -> str:
        """Map Gemini's category to your known product categories using fuzzy logic and aliases."""
        from difflib import get_close_matches
        raw_category = raw_category.lower().strip()
        known_categories = set(p.category.lower() for p in self.db.products)
        from config import CATEGORY_ALIASES
        if raw_category in known_categories:
            return raw_category
        if raw_category in CATEGORY_ALIASES:
            for alias in CATEGORY_ALIASES[raw_category]:
                if alias in known_categories:
                    return alias
        match = get_close_matches(raw_category, known_categories, n=1, cutoff=0.6)
        if match:
            return match[0]
        for known in known_categories:
            if known in raw_category or raw_category in known:
                return known
        return ""

    def _retrieve_products(self, parsed_query: Dict) -> List[Product]:
        # If the query matches a specific product name, return that product first
        filters = parsed_query.get('filters', {})
        user_query = parsed_query.get('original_query', '')  # You may need to pass this in
        if user_query:
            query_words = re.findall(r'\w+', user_query.lower())
            stopwords = {"is", "are", "the", "a", "an", "available", "in", "on", "at", "of", "for", "to", "with", "do", "does"}
            filtered_words = [w for w in query_words if w not in stopwords]
            for product in self.db.products:
                product_name = product.name.lower()
                if all(word in product_name for word in filtered_words):
                    return [product]  # Return only the matched product

        # ...existing logic for category-based search...
        category = parsed_query.get("category", "").lower()
        filters = parsed_query.get('filters', {})
        if not isinstance(filters, dict):
            logger.error(f"Expected filters to be dict, got {type(filters)}: {filters}")
            filters = {}
        existing_categories = set(p.category.lower() for p in self.db.products)
        if not category:
               logger.warning("Empty category received. Skipping product search.")
               return []
        health_terms = []
        if 'health' in category or 'healthy' in category:
            health_terms.extend(['organic', 'healthy', 'natural', 'nutrition'])
        if 'healthiness' in filters:
            health_terms.append(filters['healthiness'].lower())
        if 'health_attributes' in filters and isinstance(filters['health_attributes'], list):
            health_terms.extend(tag.lower() for tag in filters['health_attributes'])
        results = []
        for product in self.db.products:
            if category and not self._map_to_known_category(product.category) == category:
                continue
            if not self._matches_filters(product, filters, parsed_query):
                continue
            if health_terms:
                product_text = f"{product.name} {product.features} {' '.join(product.tags or [])}".lower()
                if not any(term in product_text for term in health_terms):
                    continue
            results.append(product)
        return sorted(results, key=lambda p: p.price)[:5]

    def _generate_response(self, parsed_query: Dict, products: List[Product]) -> str:
        """Generate response using Gemini API."""
        if not products:
            return self._generate_fallback_response(parsed_query, products)
        prompt = self._build_prompt(parsed_query, products)
        try:
            response = requests.post(
                API_URL,
                json={"contents": [{"parts": [{"text": prompt}]}]},
                timeout=20
            )
            response.raise_for_status()
            return response.json()["candidates"][0]["content"]["parts"][0]["text"]
        except requests.exceptions.RequestException as e:
            logger.error(f"Response generation failed: {str(e)}")
            return "I couldn't generate a response. Please try again."

    def _generate_fallback_response(self, parsed_query: Dict, products: List[Product]) -> str:
        """Generate a basic response when API fails."""
        category = parsed_query.get('category', 'products')
        filters = parsed_query.get('filters', {})
        if not isinstance(filters, dict):
            logger.error(f"Expected filters to be dict, got {type(filters)}: {filters}")
            filters = {}
        price_filter = filters.get('price', '')
        nutrition_focus = filters.get('nutrition_focus', False)
        response_lines = []
        if filters:
            filter_strs = []
            for key, val in filters.items():
                if isinstance(val, list):
                    val = ', '.join(str(v) for v in val)
                filter_strs.append(f"{key}: {val}")
            response_lines.append(f"Filters applied: {', '.join(filter_strs)}")
        if price_filter:
            response_lines.append(f"I found these {category} under  {price_filter}:")
        else:
            response_lines.append(f"I found these {category}:")
        if nutrition_focus:
            response_lines.append("(Nutrition/health focus applied)")
        if products:
            for p in products[:3]:
                response_lines.append(f"- {p.name} ({p.brand}):  {p.price}")
        else:
            response_lines.append(f"Sorry, no {category} products found matching your criteria.")
        return "\n".join(response_lines)

    def _matches_filters(self, product: Product, filters: Dict, parsed_query: Dict) -> bool:
        """Check if product matches all given filters, with improved price logic and support for 'type', 'strength', and 'fat_content'."""
        for key, val in filters.items():
            if key == "brand":
                if isinstance(val, list):
                    if not any(b.lower() in product.brand.lower() for b in val):
                        return False
                elif isinstance(val, str):
                    if val.lower() not in product.brand.lower():
                        return False
            elif key == "price":
                price_val = val
                product_price = float(product.price)
                if isinstance(price_val, str):
                    if "budget" in price_val.lower() or "cheap" in price_val.lower():
                        category = parsed_query.get("category", "").lower()
                        max_price = self.budget_thresholds.get(category, 1000)
                        if product_price > max_price:
                            return False
                    elif "expensive" in price_val.lower() or "premium" in price_val.lower():
                        category = parsed_query.get("category", "").lower()
                        min_price = self.budget_thresholds.get(category, 1000)
                        if product_price < min_price:
                            return False
                    else:
                        try:
                            num = float(re.sub(r'[^0-9.]', '', price_val))
                            if product_price > num:
                                return False
                        except Exception:
                            pass
                elif isinstance(price_val, dict):
                    if "max" in price_val and product_price > float(price_val["max"]):
                        return False
                    if "min" in price_val and product_price < float(price_val["min"]):
                        return False
                elif isinstance(price_val, (float, int)):
                    if product_price > float(price_val):
                        return False
            elif key == "tags":
                query_tags = [tag.strip().lower() for tag in str(val).split(',')]
                product_tags = [t.lower() for t in (product.tags or [])]
                if not set(query_tags).intersection(product_tags):
                    return False
            elif key == "health_attributes" and isinstance(val, str):
                if val.lower() not in (product.features.lower() + " " + " ".join(product.tags or [])):
                    return False
            elif key == "nutrition_focus":
                if val and not any(word in (product.features.lower() + " " + " ".join(product.tags or [])) for word in ["protein", "vitamin", "nutritious", "nutrition", "healthy", "organic"]):
                    return False
            elif key == "type":
                if isinstance(val, list):
                    if not any(
                        v.lower() in product.name.lower() or v.lower() in product.features.lower()
                        for v in val if isinstance(v, str)
                    ):
                        return False
                elif isinstance(val, str):
                    if val.lower() not in product.name.lower() and val.lower() not in product.features.lower():
                        return False
            elif key == "strength":
                if isinstance(val, list):
                    if not any(
                        v.lower() in product.features.lower()
                        for v in val if isinstance(v, str)
                    ):
                        return False
                elif isinstance(val, str):
                    if val.lower() not in product.features.lower():
                        return False
            elif key == "fat_content":
                if isinstance(val, list):
                    if not any(
                        v.lower() in product.features.lower() or v.lower() in " ".join(product.tags or []).lower()
                        for v in val if isinstance(v, str)
                    ):
                        return False
                elif isinstance(val, str):
                    if val.lower() not in product.features.lower() and val.lower() not in " ".join(product.tags or []).lower():
                        return False
            elif key == "product type":
                continue
            elif hasattr(product, key):
                product_attr = getattr(product, key)
                if isinstance(val, list):
                    if not any(str(v).lower() in str(product_attr).lower() for v in val):
                        return False
                else:
                    if str(val).lower() not in str(product_attr).lower():
                        return False
        return True

    def _update_session(self, parsed_query: Dict):
        """Update session context based on current query."""
        if self.session.last_query is None:
            self.session.last_query = {}
        self.session.last_query["category"] = parsed_query.get("category", self.session.last_query.get("category", "products"))
        self.session.last_query["intent"] = parsed_query.get("intent", self.session.last_query.get("intent", "search"))
        self.session.last_query["filters"] = parsed_query.get("filters", self.session.last_query.get("filters", {}))
        if "price" in parsed_query.get("filters", {}):
            self.session.preferences["price_range"] = parsed_query["filters"]["price"]
        if "brand" in parsed_query.get("filters", {}):
            brand = parsed_query["filters"]["brand"]
            if brand not in self.session.preferences["preferred_brands"]:
                self.session.preferences["preferred_brands"].append(brand)
        if "tags" in parsed_query.get("filters", {}):
            self.session.preferences["tags"] = parsed_query["filters"]["tags"].split(",")

    def _build_prompt(self, parsed_query: Dict, products: List[Product]) -> str:
        """Construct a well-formatted prompt for Gemini."""
        intent = parsed_query.get("intent", "recommend").capitalize()
        category = parsed_query.get("category", "products")
        filters = parsed_query.get("filters", {})
        if not isinstance(filters, dict):
            logger.error(f"Expected filters to be dict, got {type(filters)}: {filters}")
            filters = {}
        nutrition_focus = filters.get("nutrition_focus", False)
        prompt_lines = [
            f"You are a Walmart shopping assistant. {intent} {category} for a customer.",
            "Consider these requirements:"
        ]
        for key, val in filters.items():
            if isinstance(val, list):
                flat = []
                for v in val:
                    if isinstance(v, list):
                        flat.extend(str(x) for x in v)
                    else:
                        flat.append(str(v))
                val = ', '.join(flat)
            prompt_lines.append(f"- {key}: {str(val)}")
        if nutrition_focus:
            prompt_lines.append("- Focus on nutrition and health attributes")
        filter_values_str = ' '.join(
            ', '.join(str(v) for v in val) if isinstance(val, list) else str(val)
            for val in filters.values()
        )
        if any(term in filter_values_str.lower() for term in ["healthy", "organic", "nutritious", "nutrition", "protein", "vitamin", "calorie"]):
            prompt_lines.append("- Focus on nutritional value")
        if products:
            if intent.lower() == "compare":
                prompt_lines.append("\nCompare the following products:")
            else:
                prompt_lines.append("\nRelevant products:")
            for p in products[:3]:
                prompt_lines.append(f"- {p.name} ({p.brand}): ₹{p.price} | {p.features}")
        if self.session.preferences["preferred_brands"]:
            brands = self.session.preferences["preferred_brands"]
            flat_brands = []
            for b in brands:
                if isinstance(b, list):
                    flat_brands.extend(str(x) for x in b)
                else:
                    flat_brands.append(str(b))
            prompt_lines.append(f"\nCustomer prefers brands: {', '.join(flat_brands)}")
        prompt_lines.append("\nRespond in 2-3 concise bullet points. Highlight sustainability where applicable.")
        return '\n'.join(prompt_lines)

    def _extract_json(self, text: str) -> Optional[Dict]:
        """Safely extract JSON from Gemini response."""
        try:
            text = text.strip()
            if text.startswith("```json"):
                text = text[7:]
            elif text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            try:
                data = json.loads(text)
                if isinstance(data, dict):
                    if "candidates" in data:
                        candidate_text = data["candidates"][0]["content"]["parts"][0]["text"]
                        return self._extract_json(candidate_text)
                    return data
                return None
            except json.JSONDecodeError:
                json_match = re.search(r'\{.*\}', text, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group(0))
                return None
        except Exception as e:
            logger.error(f"JSON extraction failed: {str(e)}")
            return None

    def _log_interaction(self, user_query: str, parsed_query: Dict, products: List[Product], response: str):
        """Log the interaction for analytics."""
        log_entry = {
            "timestamp": datetime.datetime.now().isoformat(),
            "query": user_query,
            "parsed_query": parsed_query,
            "products_returned": len(products),
            "response_preview": response[:100] + "..." if len(response) > 100 else response
        }
        try:
            with open("logs/interactions.jsonl", "a") as f:
                f.write(json.dumps(log_entry) + "\n")
        except IOError as e:
            logger.error(f"Failed to log interaction: {str(e)}")

    def handle_followup(self, followup_query: str) -> Dict:
        """Process follow-up queries using session context and improved context logic."""
        if not self.session.last_query:
            return {"error": "No context available for follow-up"}
        prev_query = self.session.last_query.copy()
        prev_filters = prev_query.get("filters", {}).copy() if isinstance(prev_query.get("filters", {}), dict) else {}
        followup = followup_query.lower().strip()
        if len(followup.split()) == 1:
            category = prev_query.get("category", "products")
            intent = prev_query.get("intent", "search")
            if followup in ["healthier", "nutrition", "nutritious", "protein", "healthy"]:
                prev_filters["nutrition_focus"] = True
            elif followup in ["cheaper", "budget", "cheap"]:
                prev_filters["price"] = "budget"
            prev_query["filters"] = prev_filters
            prev_query["category"] = category
            prev_query["intent"] = intent
            return self.process_query(f"{intent} {category} with {followup}")
        if "brand" in prev_filters and prev_filters["brand"] in ["other", "another"]:
            last_brand = self.session.last_query.get("filters", {}).get("brand")
            if last_brand:
                all_brands = [p.brand.lower() for p in self.db.products]
                if isinstance(last_brand, list):
                    exclude_brands = [b.lower() for b in last_brand]
                else:
                    exclude_brands = [str(last_brand).lower()]
                prev_filters["brand"] = [b for b in all_brands if b not in exclude_brands]
            else:
                prev_filters.pop("brand")
        combined_query = prev_query.get('intent', '') + ' ' + prev_query.get('category', '')
        for cat in set(p.category.lower() for p in self.db.products):
            if cat in followup:
                prev_query["category"] = cat
        prev_query["filters"] = prev_filters
        return self.process_query(followup_query)

if __name__ == "__main__":
    os.makedirs("logs", exist_ok=True)
    # Replace 'products' with your Firestore collection name
    db_instance = ProductDatabase("products")
    assistant = ShoppingAssistant(db_instance)
    print("Welcome to SmartAssistant! Type your query or 'quit' to exit.")
    while True:
        try:
            query = input("Enter your query (or 'quit' to exit): ")
            if query.lower() == 'quit':
                break
            result = assistant.process_query(query)
            print("\nResponse:", result.get("response", "Sorry, I couldn't generate a response."))
            if result.get("products"):
                print("\nSuggested Products:")
                for p in result["products"]:
                    print(f"- {p.name} ({p.brand}): ₹{p.price}")
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except Exception as e:
            print("\nAn error occurred:", str(e))
            logger.error(f"Main loop error: {str(e)}")