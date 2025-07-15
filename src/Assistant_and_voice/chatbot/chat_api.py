from flask import Flask, request, jsonify
from flask_cors import CORS
from chat import ShoppingAssistant, ProductDatabase

app = Flask(__name__)
CORS(app)  # Allow requests from React

# Initialize your assistant (adjust collection name as needed)
db_instance = ProductDatabase("products")
assistant = ShoppingAssistant(db_instance)

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_query = data.get('query', '')
    result = assistant.process_query(user_query)
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
