import os
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId

# Load environment variables
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(BASE_DIR, ".env")
load_dotenv(env_path)

# Flask setup
FRONTEND_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "frontend")
)

app = Flask(__name__, static_folder=FRONTEND_DIR)
CORS(app)


# ✅ Serve index.html
@app.route("/")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")


# ✅ Serve all static files (CSS, JS, images)
@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory(FRONTEND_DIR, path)


# 🔗 MongoDB Setup
mongo_uri = os.getenv("MONGO_URI")
db_name = os.getenv("DB_NAME")
collection_name = os.getenv("COLLECTION_NAME")
auth_user = os.getenv("AUTH_USER")

client = MongoClient(mongo_uri, tls=True)
db = client[db_name]
collection = db[collection_name]
user_collection = db[auth_user]


# Health Check API
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "status": "UP",
        "message": "JE Bikez API is running"
    }), 200


# 📦 BOOK SLOT API
@app.route("/api/book-slot", methods=["POST"])
def book_slot():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No data received"
            }), 400

        name = data.get("name")
        phone = data.get("phone")
        bike = data.get("bike")
        date = data.get("date")

        if not name or not phone or not bike or not date:
            return jsonify({
                "error": "All fields are required"
            }), 400

        collection.insert_one({
            "name": name,
            "phone": phone,
            "bike": bike,
            "date": date
        })

        return jsonify({
            "success": True,
            "message": "Slot booked successfully"
        }), 201

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

# 🔐 SIGNUP API
@app.route("/api/auth/signup", methods=["POST"])
def signup():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No data received"
            }), 400

        name = data.get("name")
        phone = data.get("phone")
        email = data.get("email")
        password = data.get("password")

        if not name or not phone or not email or not password:
            return jsonify({
                "error": "All fields are required"
            }), 400

        email = email.lower()

        existing_user = user_collection.find_one({
            "email": email
        })

        if existing_user:
            return jsonify({
                "error": "User already exists"
            }), 409
        
        hashed_password = generate_password_hash(password)
        
        new_user = {
            "name": name,
            "phone": phone,
            "email": email,
            "password": hashed_password,
            "profile_picture": ""
        }

        user_collection.insert_one(new_user)

        return jsonify({
            "user_id": str(new_user["_id"]),
            "success": True,
            "message": "Signup successful"
        }), 201

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# 🔐 LOGIN API
@app.route("/api/auth/login", methods=["POST"])
def login():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No data received"
            }), 400

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({
                "error": "Email and password are required"
            }), 400

        user = user_collection.find_one({
            "email": email.lower()
        })

        if not user:
            return jsonify({
                "error": "User not found"
            }), 404

        if not check_password_hash(
            user["password"],
            password
        ):
            return jsonify({
                "error": "Invalid password"
            }), 401

        return jsonify({
            "success": True,
            "message": "Login successful",
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "profile_picture": user.get(
                    "profile_picture",
                    ""
                )
            }
        }), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# Get User Profile API
@app.route("/api/user/profile/<user_id>", methods=["GET"])
def get_profile(user_id):

    try:

        user = user_collection.find_one(
            {"_id": ObjectId(user_id)},
            {"password": 0}
        )

        if not user:
            return jsonify({
                "error": "User not found"
            }), 404

        user["_id"] = str(user["_id"])

        return jsonify({
            "success": True,
            "user": user
        }), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500



# Update User Profile API
@app.route("/api/user/profile/<user_id>", methods=["PATCH"])
def update_profile(user_id):

    try:

        data = request.get_json()

        name = data.get("name")
        profile_picture = data.get("profile_picture")

        result = user_collection.update_one(
            {
                "_id": ObjectId(user_id)
            },
            {
                "$set": {
                    "name": name,
                    "profile_picture": profile_picture
                }
            }
        )

        if result.matched_count == 0:
            return jsonify({
                "error": "User not found"
            }), 404

        updated_user = user_collection.find_one(
            {"_id": ObjectId(user_id)},
            {"password": 0}
        )

        updated_user["_id"] = str(updated_user["_id"])

        return jsonify({
            "success": True,
            "message": "Profile updated successfully",
            "user": updated_user
        }), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

# 🚀 Run app
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)


