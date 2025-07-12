from setuptools import setup, find_packages

setup(
    name="smartassistant",
    version="0.1",
    description="SmartAssistant: Modular chatbot and voice search for retail product discovery and recommendations.",
    long_description="""
SmartAssistant is a modular assistant system for retail environments, supporting both text-based chatbot and voice-based product search. It provides product recommendations, price checks, location, availability, and nutrition/health filtering, and is designed for easy integration with frontend and backend systems.

Data files required: data/walmart_products.json, data/store_layout.json
""",
    packages=find_packages(),
    install_requires=[
        "SpeechRecognition>=3.8.1",
        "requests",
        "python-dotenv",
        # 'dataclasses' is only needed for Python <3.7
    ],
    python_requires='>=3.7',
    include_package_data=True,
    # If you want to include data files in the package, you can use package_data or MANIFEST.in
)