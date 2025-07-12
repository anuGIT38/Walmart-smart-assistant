import speech_recognition as sr
from typing import Dict, List, Optional
import json
import os
import sys
import datetime
from difflib import get_close_matches


class VoiceSearchError(Exception):
    """Custom error for voice search issues"""
    pass


class EnhancedVoiceSearch:
    """
    Handles voice-based product search, including location, availability, and price queries.
    Uses speech recognition to convert audio to text, detects user intent, and fetches product info.
    """
    def __init__(self, product_db: List[Dict], store_layout_db: Dict):
        """
        Initialize the voice search system with product and store layout data.
        Args:
            product_db (List[Dict]): List of product dictionaries.
            store_layout_db (Dict): Store layout mapping product IDs to locations.
        """
        self.recognizer = sr.Recognizer()
        self.products = product_db
        self.store_layout = store_layout_db
        self._configure_microphone()

    def _configure_microphone(self):
        """
        Configure microphone settings and adjust for ambient noise.
        """
        self.microphone = sr.Microphone()
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=1)

    def process_voice_command(self, audio_input: Optional[str] = None) -> Dict:
        """
        Main entry point for all voice features. Converts speech to text, detects intent, and returns result.
        Args:
            audio_input (Optional[str]): Path to audio file for testing, or None to use microphone.
        Returns:
            Dict: Result of the query (location, availability, price, or error).
        """
        try:
            text = self._speech_to_text(audio_input)
            intent = self._detect_intent(text)

            if intent == "location":
                return self._handle_location_query(text)
            elif intent == "availability":
                return self._handle_availability(text)
            elif intent == "price":
                return self._handle_price_check(text)
            else:
                return {"error": "Sorry, I couldn't understand your request."}

        except Exception as e:
            return {"error": str(e), "type": "error"}

    def _speech_to_text(self, audio_input: Optional[str] = None) -> str:
        """
        Convert voice to text with error handling. Uses Google Speech Recognition.
        Args:
            audio_input (Optional[str]): Path to audio file for testing, or None to use microphone.
        Returns:
            str: Recognized text from speech.
        Raises:
            VoiceSearchError: If speech cannot be recognized or audio fails.
        """
        try:
            if audio_input and os.path.exists(audio_input):
                with sr.AudioFile(audio_input) as source:
                    audio = self.recognizer.record(source)
            else:
                with self.microphone as source:
                    print("Listening...")  # User feedback: system is listening
                    audio = self.recognizer.listen(
                        source, timeout=5, phrase_time_limit=20)

            text = self.recognizer.recognize_google(audio)
            print(f"Recognized: {text}")  # Show recognized text for debugging
            return text

        except sr.WaitTimeoutError:
            raise VoiceSearchError("No speech detected within timeout")
        except sr.UnknownValueError:
            raise VoiceSearchError("Could not understand audio")
        except sr.RequestError as e:
            raise VoiceSearchError(f"Speech service error: {str(e)}")
        except Exception as e:
            raise VoiceSearchError(f"Audio processing failed: {str(e)}")

    def _detect_intent(self, text: str) -> str:
        """
        Simple intent detection based on keywords in the recognized text.
        Args:
            text (str): Recognized user query.
        Returns:
            str: Intent type ('location', 'availability', 'price', or 'unknown').
        """
        text = text.lower()
        location_keywords = ["where", "locate", "find", "navigation", "aisle", "section"]
        availability_keywords = ["available", "in stock", "stock"]
        price_keywords = ["price", "cost", "how much"]
        if any(word in text for word in location_keywords):
            return "location"
        elif any(word in text for word in availability_keywords):
            return "availability"
        elif any(word in text for word in price_keywords):
            return "price"
        else:
            return "unknown"

    def _extract_product_name(self, query: str) -> Optional[dict]:
        """
        Extract the product dictionary from the query using substring, fuzzy, or word match.
        Args:
            query (str): User's query string.
        Returns:
            Optional[dict]: Product dictionary if found, else None.
        """
        query = query.lower()
        # Try direct substring match
        for product in self.products:
            name = product["name"].lower()
            brand = product.get("brand", "").lower()
            if name in query or brand in query:
                return product

        # Fuzzy match fallback (for partial or misspelled names)
        names = [p["name"].lower() for p in self.products]
        matches = get_close_matches(query, names, n=1, cutoff=0.4)
        if matches:
            return next((p for p in self.products if p["name"].lower() == matches[0]), None)

        # Try to find any word in query that matches a product name
        for word in query.split():
            for product in self.products:
                if word == product["name"].lower():
                    return product

        return None

    def _handle_location_query(self, query: str) -> Dict:
        """
        Find product and return AR navigation data (aisle, section, coordinates).
        Args:
            query (str): User's query string.
        Returns:
            Dict: AR navigation info or error.
        """
        product = self._extract_product_name(query)
        if not product:
            return {"error": "Product not found"}
        
        location = self.store_layout.get(product.get("id"), {})
        return {
            "type": "ar_navigation",
            "product": product["name"],
            "location": {
                "aisle": location.get("aisle"),
                "section": location.get("section"),
                "coordinates": location.get("ar_coords")  # For AR arrows
            }
        }

    def _handle_availability(self, query: str) -> Dict:
        """
        Check product availability (mocked as always in stock).
        Args:
            query (str): User's query string.
        Returns:
            Dict: Availability info or error.
        """
        product = self._extract_product_name(query)
        
        if not product:
             return {"error": "Product not found"}
        
        return {
            "type": "availability",
            "product": product["name"],
            "in_stock": True,
            "last_checked": datetime.datetime.now().isoformat()
        }

    def _handle_price_check(self, query: str) -> Dict:
        """
        Get product price (with optional comparison in future).
        Args:
            query (str): User's query string.
        Returns:
            Dict: Price info or error.
        """
        product = self._extract_product_name(query)
        
        if not product:
             return {"error": "Product not found"}
        
        return {
            "type": "price",
            "query": query,
            "results": [{
                "name": product["name"],
                "price": product["price"],
                "unit": product.get("unit", "each"),
                "size": product.get("size", "N/A")
            } ]
        }


# Entry point for running as a script
if __name__ == "__main__":
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    try:
        # Load product data
        with open(os.path.join(BASE_DIR, "../data/walmart_products.json")) as f:
            products = json.load(f)
    except FileNotFoundError:
        print("Error: walmart_products.json not found.")  # Essential error message
        sys.exit()

    try:
        # Load store layout data
        with open(os.path.join(BASE_DIR, "../data/store_layout.json")) as f:
            layout = json.load(f)
    except FileNotFoundError:
        print("Error: store_layout.json not found.")  # Essential error message
        sys.exit()

    voice_search = EnhancedVoiceSearch(products, layout)
    result = voice_search.process_voice_command()  # Will listen to microphone
    print(json.dumps(result, indent=2))  # Output result in readable format
