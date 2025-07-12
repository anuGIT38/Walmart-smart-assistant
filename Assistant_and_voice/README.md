# SmartAssistant

## Overview
SmartAssistant is a modular assistant system for retail environments, supporting both text-based chatbot and voice-based product search. It provides product recommendations, price checks, location, availability, and nutrition/health filtering, and is designed for easy integration with frontend and backend systems.

---

## Features
- **Chatbot**: Text-based conversational assistant for product search, comparison, price checks, health/nutrition queries, and contextual follow-ups.
- **Voice Search**: Voice-based product search using speech recognition, supporting location, availability, and price queries.
- Robust error handling and context management.
- Modular design for integration with other systems.

---

## Chatbot Usage
The chatbot is implemented in `chatbot/chat.py`.

### How to Run
```bash
python chatbot/chat.py
```
- The script will prompt for your query and display product suggestions and responses.
- Type `quit` to exit.

### Features
- Product search and recommendations
- Price, brand, and nutrition/health filtering
- Contextual follow-up (e.g., "another brand", "cheaper", "healthier")
- Handles vague, empty, or nonsensical queries gracefully
- Logs all interactions to `logs/interactions.jsonl`

### Data Files
- Expects product data at `data/walmart_products.json`
- Expects store layout at `data/store_layout.json` (for location queries)

---

## Voice Search Usage
The voice search module is implemented in `voice_search/voice.py`.

### How to Run
```bash
python voice_search/voice.py
```
- The script will listen for your voice input and print the recognized text and result.

### Features
- Voice-to-text product search
- Returns product location (aisle, section, AR coordinates)
- Checks product availability
- Provides product price information

### Data Files
- Expects product data at `data/walmart_products.json`
- Expects store layout at `data/store_layout.json`

---

## Setup & Installation
1. Clone the repository and navigate to the project root.
2. Install dependencies:
   ```bash
   pip install -e .
   ```
   or
   ```bash
   pip install -r requirements.txt
   ```
3. Ensure your system has a working microphone (for voice search) and the required data files in the `data/` directory.

---

## Dependencies
- `SpeechRecognition` (for voice search)
- `requests`, `python-dotenv`, `dataclasses` (for chatbot)
- Standard Python libraries: `json`, `os`, `sys`, `datetime`, `difflib`, `logging`, `re`

---

## Integration
- Both modules can be run standalone or imported as Python modules.
- The chatbot and voice search share the same product and store layout data files for consistency.
- All logs are written to `logs/interactions.jsonl` for analytics and debugging.

---

## Contributors
- Chatbot & Voice Search: [Your Name]
- Frontend: [Teammate Name]
- Backend: [Teammate Name]

---
For any issues or questions, please contact the project maintainers. 