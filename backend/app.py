import os
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId
import cloudinary
import cloudinary.uploader
import cloudinary.api
import time
from threading import Thread
from datetime import datetime, UTC



# Load environment variables
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(BASE_DIR, ".env")
load_dotenv(env_path)

# Flask setup
FRONTEND_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "frontend")
)
ADMIN_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "admin")
)

app = Flask(__name__, static_folder=FRONTEND_DIR)
app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("MAX_UPLOAD_SIZE"))
CORS(app)

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

print(cloudinary.api.ping())

# ✅ Admin Panel routes (isolated admin app)
@app.route("/admin")
@app.route("/admin/")
def admin_home():
    return send_from_directory(ADMIN_DIR, "index.html")

@app.route("/admin/<path:path>", methods=["GET"])
def admin_static(path):
    return send_from_directory(ADMIN_DIR, path)

# ✅ Serve public frontend index.html
@app.route("/")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")




# 🔗 MongoDB Setup
mongo_uri = os.getenv("MONGO_URI")
db_name = os.getenv("DB_NAME")
collection_name = os.getenv("COLLECTION_NAME")
user = os.getenv("USER")
modification=os.getenv("MODIFICATION")
book_sales = os.getenv("BOOK_SALES") or os.getenv("BOOK_SALE") or "book-sales"
# service_reviews = os.getenv("SERVICE_REVIEWS")
service_reviews = os.getenv("SERVICE_REVIEWS") or os.getenv("SERVICE_REVIEW") or "service-reviews"


client = MongoClient(mongo_uri, tls=True)
db = client[db_name]
collection = db[collection_name]
user_collection = db[user]
modification_collection = db[modification]
book_sales_collection = db[book_sales]
builds_collection = db["builds"]
sales_collection = db["sales"]
service_booking_collection = db["service-booking"]
reviews_collection = db[service_reviews]


# Health Check API
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "status": "UP",
        "message": "JE Bikez API is running"
    }), 200

# CONFIG API
@app.route("/api/config", methods=["GET"])
def get_config():
    try:
        theme = os.getenv("THEME", "light").strip().lower()

        return jsonify({
            "success": True,
            "theme": theme
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Failed to load configuration",
            "error": str(e)
        }), 500


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

# 📦 MODIFICATION SLOT API
@app.route("/api/modification-slot", methods=["POST"])
def modification_slot():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data received"}), 400
            
        name = data.get("name")
        phone = data.get("phone")
        email = data.get("email")
        bike = data.get("bike")
        
        if not name or not bike:
            return jsonify({"error": "Name and Bike details are required"}), 400
            
        if not phone and not email:
            return jsonify({"error": "Either Phone or Email is required"}), 400
            
        modification_collection.insert_one({
            "name": name,
            "phone": phone,
            "email": email,
            "bike": bike,
            "type": "modification_slot",
            "date": datetime.now(UTC)
        })
        
        return jsonify({"success": True, "message": "Slot booked successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
            "profile_picture": "",
            "profile_picture_id": "",
            "created_at": datetime.now(UTC),
            "updated_at": datetime.now(UTC)
        }

        result = user_collection.insert_one(new_user)

        return jsonify({
            "user_id": str(result.inserted_id),
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

        # Update updated_at after successful login
        user_collection.update_one(
            {
                "_id": user["_id"]
            },
            {
                "$set": {
                    "updated_at": datetime.now(UTC)
                }
            }
        )

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
@app.route("/api/user/<user_id>", methods=["GET"])
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

#User path the user data from database to frontend
@app.route("/api/user/<user_id>", methods=["PATCH"])
def update_profile(user_id):

    try:

        user = user_collection.find_one({
            "_id": ObjectId(user_id)
        })

        if not user:
            return jsonify({
                "error": "User not found"
            }), 404

        # Initialize update_data with updated_at
        update_data = {
            "updated_at": datetime.now(UTC)
        }

        # Name update
        name = request.form.get("name")

        if name:
            update_data["name"] = name

        # Profile image update
        if "image" in request.files:

            image = request.files["image"]

            old_public_id = user.get(
                "profile_picture_id"
            )

            if old_public_id:
                cloudinary.uploader.destroy(
                    old_public_id
                )

            result = cloudinary.uploader.upload(
                image,
                folder=os.getenv("CLOUDINARY_FOLDER")
            )

            update_data["profile_picture"] = (
                result["secure_url"]
            )

            update_data["profile_picture_id"] = (
                result["public_id"]
            )

        # Update MongoDB
        user_collection.update_one(
            {
                "_id": ObjectId(user_id)
            },
            {
                "$set": update_data
            }
        )

        updated_user = user_collection.find_one(
            {
                "_id": ObjectId(user_id)
            },
            {
                "password": 0
            }
        )

        updated_user["_id"] = str(
            updated_user["_id"]
        )

        return jsonify({
            "success": True,
            "message": "Profile updated successfully",
            "user": updated_user
        }), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


def delete_user_after_delay(user_id):
    try:
        # Wait for 2 minutes
        time.sleep(120)

        # Find user whose account is marked for deletion
        user = user_collection.find_one({
            "_id": ObjectId(user_id),
            "deleted_account": True
        })

        if not user:
            print("User not found or deletion cancelled.")
            return

        # Delete profile image from Cloudinary
        public_id = user.get("profile_picture_id")

        if public_id:
            result = cloudinary.uploader.destroy(public_id)

            # Proceed only if image is deleted or doesn't exist
            if result.get("result") not in ["ok", "not found"]:
                print("Failed to delete Cloudinary image.")
                return

        # Delete user from MongoDB
        user_collection.delete_one({
            "_id": ObjectId(user_id)
        })

        print(f"User {user_id} deleted successfully.")

    except Exception as e:
        print(f"Delete Error: {e}")


@app.route("/api/user/<user_id>", methods=["DELETE"])
def delete_account(user_id):
    try:
        # Check if user exists
        user = user_collection.find_one({
            "_id": ObjectId(user_id)
        })

        if not user:
            return jsonify({
                "success": False,
                "message": "User not found."
            }), 404

        # Mark account as deleted
        user_collection.update_one(
            {
                "_id": ObjectId(user_id)
            },
            {
                "$set": {
                    "deleted_account": True,
                    "deleted_at": datetime.utcnow()
                }
            }
        )

        # Start background deletion
        Thread(
            target=delete_user_after_delay,
            args=(user_id,),
            daemon=True
        ).start()

        return jsonify({
            "success": True,
            "message": "Your account has been scheduled for deletion. It will be permanently deleted in 2 minutes."
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# 📦 SERVICE HISTORY API
@app.route("/api/service-history/<user_id>", methods=["GET"])
def get_service_history(user_id):
    try:
        collection = db["service-booking"]
        query_conditions = [{"user_id": user_id}, {"user_id": str(user_id)}]
        if ObjectId.is_valid(user_id):
            query_conditions.append({"user_id": ObjectId(user_id)})

        bookings = list(collection.find({"$or": query_conditions}).sort("_id", -1))

        history = []
        for doc in bookings:
            bike = doc.get("bike") if isinstance(doc.get("bike"), dict) else {}
            date_val = doc.get("date")
            if isinstance(date_val, datetime):
                date_val = date_val.isoformat()

            created_at = doc.get("created_at")
            if isinstance(created_at, datetime):
                created_at = created_at.isoformat()

            updated_at = doc.get("updated_at")
            if isinstance(updated_at, datetime):
                updated_at = updated_at.isoformat()

            history.append({
                "booking_id": str(doc.get("_id")),
                "_id": str(doc.get("_id")),
                "user_id": str(doc.get("user_id")),
                "manufacturer": doc.get("manufacturer") or bike.get("manufacturer", ""),
                "model": doc.get("model") or bike.get("model", ""),
                "variant": doc.get("variant") or bike.get("variant", ""),
                "year": doc.get("year") or bike.get("year", ""),
                "cc": doc.get("cc") or bike.get("cc", ""),
                "serviceType": doc.get("serviceType") or doc.get("service_type", ""),
                "date": date_val or "",
                "status": doc.get("status", "Pending"),
                "register_number": doc.get("register_number", ""),
                "odo_km": doc.get("odo_km") or doc.get("odoKm") or "",
                "bike_image_url": doc.get("bike_image_url", ""),
                "bike": bike,
                "created_at": created_at,
                "updated_at": updated_at
            })

        return jsonify({"success": True, "history": history}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# 📦 BOOK SERVICE API
# @app.route("/api/book-service", methods=["POST"])
# def book_service():
#     try:
#         data = request.get_json() or {}
#         data["created_at"] = datetime.now(UTC)
#         data.setdefault("user_id", "demo-user")
#         data.setdefault("status", "Pending")
#         db["service_history"].insert_one(data)
#         return jsonify({"success": True, "message": "Service booked successfully"}), 201
#     except Exception as e:
#         return jsonify({"success": False, "error": str(e)}), 500

# ============================================================
# 📦 SERVICE BOOKING API
# ============================================================

@app.route("/api/book-service", methods=["POST"])
def book_service():

    try:

        # --------------------------------------------------------
        # SUPPORT BOTH multipart/form-data AND application/json
        # --------------------------------------------------------

        if request.content_type and "multipart/form-data" in request.content_type:
            data = request.form.to_dict()
        else:
            data = request.get_json(silent=True)

        if not data:

            return jsonify({
                "success": False,
                "error": "Request body must contain JSON data."
            }), 400


        # --------------------------------------------------------
        # REQUIRED FIELDS
        # --------------------------------------------------------

        required_fields = [
            "user_id",
            "manufacturer",
            "model",
            "variant",
            "year",
            "cc",
            "serviceType",
            "date"
        ]


        # --------------------------------------------------------
        # CHECK REQUIRED FIELDS
        # --------------------------------------------------------

        missing_fields = [
            field
            for field in required_fields
            if data.get(field) is None
            or str(data.get(field)).strip() == ""
        ]


        if missing_fields:

            return jsonify({
                "success": False,
                "error": "Required booking information is missing.",
                "fields": missing_fields
            }), 400


        # --------------------------------------------------------
        # CLEAN VALUES
        # --------------------------------------------------------

        user_id = str(
            data["user_id"]
        ).strip()

        manufacturer = str(
            data["manufacturer"]
        ).strip()

        model = str(
            data["model"]
        ).strip()

        variant = str(
            data["variant"]
        ).strip()

        year = str(
            data["year"]
        ).strip()

        cc = str(
            data["cc"]
        ).strip()

        service_type = str(
            data["serviceType"]
        ).strip()

        booking_date = str(
            data["date"]
        ).strip()


        # --------------------------------------------------------
        # CREATE BOOKING DOCUMENT
        # --------------------------------------------------------

        booking_data = {

            "user_id": user_id,

            "bike": {

                "manufacturer": manufacturer,

                "model": model,

                "variant": variant,

                "year": year,

                "cc": cc
            },

            "serviceType": service_type,

            "date": booking_date,

            "status": "Pending",

            "created_at": datetime.now(UTC),

            "updated_at": datetime.now(UTC)
        }

        # --------------------------------------------------------
        # OPTIONAL: REGISTER NUMBER & ODOMETER (KM)
        # --------------------------------------------------------

        register_number = str(data.get("register_number") or data.get("registerNumber") or "").strip().upper()
        if register_number:
            booking_data["register_number"] = register_number

        odo_km = str(data.get("odo_km") or data.get("odoKm") or data.get("km") or "").strip()
        if odo_km:
            booking_data["odo_km"] = odo_km

        # --------------------------------------------------------
        # OPTIONAL: BIKE IMAGE (URL already uploaded by frontend)
        # OR file sent directly as multipart
        # --------------------------------------------------------

        bike_image_url = str(data.get("bike_image_url") or "").strip()

        if not bike_image_url and "bike_image" in request.files:
            img_file = request.files["bike_image"]
            if img_file and img_file.filename:
                service_folder = os.getenv(
                    "CLOUDINARY_SERVICE", "je-bikez/book-service"
                )
                upload_result = cloudinary.uploader.upload(
                    img_file,
                    folder=service_folder,
                    resource_type="image"
                )
                bike_image_url = upload_result.get("secure_url", "")

        if bike_image_url:
            booking_data["bike_image_url"] = bike_image_url


        # --------------------------------------------------------
        # INSERT INTO MONGODB
        # --------------------------------------------------------

        collection = db["service-booking"]

        result = collection.insert_one(
            booking_data
        )


        # --------------------------------------------------------
        # SUCCESS RESPONSE
        # --------------------------------------------------------

        return jsonify({

            "success": True,

            "message": "Service booked successfully.",

            "booking": {

                "booking_id":
                    str(result.inserted_id),

                "user_id":
                    user_id,

                "manufacturer":
                    manufacturer,

                "model":
                    model,

                "variant":
                    variant,

                "year":
                    year,

                "cc":
                    cc,

                "serviceType":
                    service_type,

                "date":
                    booking_date,

                "status":
                    "Pending"
            }

        }), 201


    # ------------------------------------------------------------
    # GENERAL ERROR
    # ------------------------------------------------------------

    except Exception as e:

        print(
            "❌ BOOK SERVICE ERROR:",
            str(e)
        )


        return jsonify({

            "success": False,

            "error":
                "Unable to book service.",

            "details":
                str(e)

        }), 500






# ============================================================
# 📦 SALES BIKE BOOKING REQUEST API
# ============================================================

@app.route("/api/book-sale", methods=["POST"])
def book_sale():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({
                "success": False,
                "error": "Request body must contain JSON data."
            }), 400

        name = data.get("name")
        phone = data.get("phone")
        location = data.get("location")
        bike_name = data.get("bike_name")

        if not name or not phone or not location:
            return jsonify({
                "success": False,
                "error": "Name, mobile number, and location are required."
            }), 400

        sale_booking_data = {
            "user_id": str(data.get("user_id", "guest")),
            "name": str(name).strip(),
            "phone": str(phone).strip(),
            "location": str(location).strip(),
            "bike_name": str(bike_name or "Custom Sale Bike").strip(),
            "price": str(data.get("price", "N/A")).strip(),
            "date": str(data.get("date", datetime.now(UTC).strftime("%Y-%m-%d"))).strip(),
            "status": "Pending",
            "created_at": datetime.now(UTC),
            "updated_at": datetime.now(UTC)
        }

        result = book_sales_collection.insert_one(sale_booking_data)

        return jsonify({
            "success": True,
            "message": "Booking request submitted successfully! Our sales team will contact you shortly.",
            "booking_id": str(result.inserted_id)
        }), 201

    except Exception as e:
        print("❌ BOOK SALE ERROR:", str(e))
        return jsonify({
            "success": False,
            "error": "Unable to submit booking request.",
            "details": str(e)
        }), 500


# ============================================================
# 🛠️ HELPER FOR JSON SERIALIZATION
# ============================================================
def serialize_doc(doc):
    if not doc:
        return doc
    doc["_id"] = str(doc["_id"])
    if "id" not in doc:
        doc["id"] = doc["_id"]
    for k, v in list(doc.items()):
        if isinstance(v, datetime):
            doc[k] = v.isoformat()
    return doc


# ============================================================
# 📸 ADMIN CLOUDINARY IMAGE UPLOAD API
# ============================================================
@app.route("/api/admin/upload", methods=["POST"], strict_slashes=False)
def admin_upload_image():
    try:
        files = request.files.getlist("files")
        if not files or len(files) == 0:
            single_list = request.files.getlist("file")
            if single_list:
                files = single_list
            else:
                single = request.files.get("file") or request.files.get("image")
                if single:
                    files = [single]

        valid_files = [f for f in files if f and f.filename]
        if not valid_files:
            return jsonify({"success": False, "error": "No image file provided"}), 400

        upload_type = (request.form.get("type") or request.args.get("type", "build")).lower().strip()
        if "sale" in upload_type:
            folder = os.getenv("CLOUDINARY_SALES", "je-bikez/sales")
        elif "service" in upload_type:
            folder = os.getenv("CLOUDINARY_SERVICE", "je-bikez/book-service")
        else:
            folder = os.getenv("CLOUDINARY_BUILD", "je-bikez/build")

        uploaded = []
        for f in valid_files:
            res = cloudinary.uploader.upload(
                f,
                folder=folder,
                resource_type="image"
            )
            uploaded.append({
                "url": res.get("secure_url"),
                "public_id": res.get("public_id")
            })

        return jsonify({
            "success": True,
            "url": uploaded[0]["url"],
            "urls": [u["url"] for u in uploaded],
            "images": uploaded,
            "count": len(uploaded),
            "folder": folder
        }), 200
    except Exception as e:
        print("❌ UPLOAD ERROR:", str(e))
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
# 🏍️ BUILDS API (LIST, CREATE, UPDATE, DELETE)
# ============================================================
@app.route("/api/builds", methods=["GET"], strict_slashes=False)
@app.route("/api/build", methods=["GET"], strict_slashes=False)
@app.route("/builds", methods=["GET"], strict_slashes=False)
@app.route("/build", methods=["GET"], strict_slashes=False)
def get_builds():
    try:
        builds = list(builds_collection.find().sort("_id", -1))
        serialized = [serialize_doc(b) for b in builds]
        return jsonify({"success": True, "builds": serialized, "data": serialized}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e), "builds": [], "data": []}), 500


@app.route("/api/builds", methods=["POST"], strict_slashes=False)
def create_build():
    try:
        data = request.get_json(silent=True) or {}
        if not data.get("title"):
            return jsonify({"success": False, "error": "Title is required"}), 400

        data["videoUrl"] = str(data.get("videoUrl") or data.get("video_url") or data.get("videoLink") or "").strip()
        data["created_at"] = datetime.now(UTC)
        data["updated_at"] = datetime.now(UTC)
        result = builds_collection.insert_one(data)
        data["_id"] = str(result.inserted_id)
        data["id"] = str(result.inserted_id)
        return jsonify({"success": True, "message": "Build project created", "build": serialize_doc(data)}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/builds/<build_id>", methods=["PUT"], strict_slashes=False)
def update_build(build_id):
    try:
        data = request.get_json(silent=True) or {}
        data.pop("_id", None)
        if "videoUrl" in data or "video_url" in data or "videoLink" in data:
            data["videoUrl"] = str(data.get("videoUrl") or data.get("video_url") or data.get("videoLink") or "").strip()
        data["updated_at"] = datetime.now(UTC)

        query = {"$or": [{"_id": ObjectId(build_id)} if ObjectId.is_valid(build_id) else None, {"id": build_id}]}
        query["$or"] = [q for q in query["$or"] if q]

        res = builds_collection.update_one(query, {"$set": data})
        if res.matched_count == 0:
            return jsonify({"success": False, "error": "Build not found"}), 404

        updated = builds_collection.find_one(query)
        return jsonify({"success": True, "message": "Build updated successfully", "build": serialize_doc(updated)}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/builds/<build_id>", methods=["DELETE"], strict_slashes=False)
def delete_build(build_id):
    try:
        query = {"$or": [{"_id": ObjectId(build_id)} if ObjectId.is_valid(build_id) else None, {"id": build_id}]}
        query["$or"] = [q for q in query["$or"] if q]
        res = builds_collection.delete_one(query)
        if res.deleted_count == 0:
            return jsonify({"success": False, "error": "Build not found"}), 404
        return jsonify({"success": True, "message": "Build deleted successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
# 🏷️ SALES BIKES API (LIST, CREATE, UPDATE, DELETE)
# ============================================================
@app.route("/api/sales", methods=["GET"], strict_slashes=False)
@app.route("/api/sale", methods=["GET"], strict_slashes=False)
@app.route("/sales", methods=["GET"], strict_slashes=False)
@app.route("/sale", methods=["GET"], strict_slashes=False)
def get_sales():
    try:
        sales = list(sales_collection.find().sort("_id", -1))
        serialized = [serialize_doc(s) for s in sales]
        return jsonify({"success": True, "sales": serialized, "data": serialized}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e), "sales": [], "data": []}), 500


@app.route("/api/sales", methods=["POST"], strict_slashes=False)
def create_sale():
    try:
        data = request.get_json(silent=True) or {}
        if not data.get("name"):
            return jsonify({"success": False, "error": "Bike name is required"}), 400

        data["created_at"] = datetime.now(UTC)
        data["updated_at"] = datetime.now(UTC)
        result = sales_collection.insert_one(data)
        data["_id"] = str(result.inserted_id)
        data["id"] = str(result.inserted_id)
        return jsonify({"success": True, "message": "Sale bike created", "sale": serialize_doc(data)}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/sales/<sale_id>", methods=["PUT"], strict_slashes=False)
def update_sale(sale_id):
    try:
        data = request.get_json(silent=True) or {}
        data.pop("_id", None)
        data["updated_at"] = datetime.now(UTC)

        query = {"$or": [{"_id": ObjectId(sale_id)} if ObjectId.is_valid(sale_id) else None, {"id": sale_id}]}
        query["$or"] = [q for q in query["$or"] if q]

        res = sales_collection.update_one(query, {"$set": data})
        if res.matched_count == 0:
            return jsonify({"success": False, "error": "Sale bike not found"}), 404

        updated = sales_collection.find_one(query)
        return jsonify({"success": True, "message": "Sale bike updated successfully", "sale": serialize_doc(updated)}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/sales/<sale_id>", methods=["DELETE"], strict_slashes=False)
def delete_sale(sale_id):
    try:
        query = {"$or": [{"_id": ObjectId(sale_id)} if ObjectId.is_valid(sale_id) else None, {"id": sale_id}]}
        query["$or"] = [q for q in query["$or"] if q]
        res = sales_collection.delete_one(query)
        if res.deleted_count == 0:
            return jsonify({"success": False, "error": "Sale bike not found"}), 404
        return jsonify({"success": True, "message": "Sale bike deleted successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
# 📊 ADMIN DASHBOARD APIs (USERS & BOOKINGS WITH EDITABLE STATUS)
# ============================================================
@app.route("/api/admin/users", methods=["GET"], strict_slashes=False)
def admin_get_users():
    try:
        users = list(user_collection.find({}, {"password": 0}).sort("_id", -1))
        return jsonify({"success": True, "users": [serialize_doc(u) for u in users]}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/admin/services", methods=["GET"], strict_slashes=False)
def admin_get_services():
    try:
        bookings = list(service_booking_collection.find().sort("_id", -1))
        formatted = []
        for doc in bookings:
            bike = doc.get("bike") if isinstance(doc.get("bike"), dict) else {}
            date_val = doc.get("date")
            if isinstance(date_val, datetime):
                date_val = date_val.isoformat()

            created_at = doc.get("created_at")
            if isinstance(created_at, datetime):
                created_at = created_at.isoformat()

            updated_at = doc.get("updated_at")
            if isinstance(updated_at, datetime):
                updated_at = updated_at.isoformat()

            formatted.append({
                "booking_id": str(doc.get("_id")),
                "_id": str(doc.get("_id")),
                "user_id": str(doc.get("user_id")),
                "manufacturer": doc.get("manufacturer") or bike.get("manufacturer", ""),
                "model": doc.get("model") or bike.get("model", ""),
                "variant": doc.get("variant") or bike.get("variant", ""),
                "year": doc.get("year") or bike.get("year", ""),
                "cc": doc.get("cc") or bike.get("cc", ""),
                "serviceType": doc.get("serviceType") or doc.get("service_type", ""),
                "date": date_val or "",
                "status": doc.get("status", "Pending"),
                "register_number": doc.get("register_number", ""),
                "odo_km": doc.get("odo_km") or doc.get("odoKm") or "",
                "bike": bike,
                "created_at": created_at,
                "updated_at": updated_at
            })
        return jsonify({"success": True, "services": formatted}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/admin/services/<service_id>/status", methods=["PUT"], strict_slashes=False)
def admin_update_service_status(service_id):
    try:
        data = request.get_json(silent=True) or {}
        new_status = data.get("status")
        if not new_status:
            return jsonify({"success": False, "error": "Status is required"}), 400

        query = {"$or": [{"_id": ObjectId(service_id)} if ObjectId.is_valid(service_id) else None, {"booking_id": service_id}]}
        query["$or"] = [q for q in query["$or"] if q]

        res = service_booking_collection.update_one(query, {"$set": {"status": new_status, "updated_at": datetime.now(UTC)}})
        if res.matched_count == 0:
            return jsonify({"success": False, "error": "Service booking not found"}), 404

        return jsonify({"success": True, "message": "Service status updated successfully", "status": new_status}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/admin/sales-bookings", methods=["GET"], strict_slashes=False)
def admin_get_sales_bookings():
    try:
        sales_bookings = list(book_sales_collection.find().sort("_id", -1))
        return jsonify({"success": True, "sales_bookings": [serialize_doc(sb) for sb in sales_bookings]}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/admin/sales-bookings/<booking_id>/status", methods=["PUT"], strict_slashes=False)
def admin_update_sale_booking_status(booking_id):
    try:
        data = request.get_json(silent=True) or {}
        new_status = data.get("status")
        if not new_status:
            return jsonify({"success": False, "error": "Status is required"}), 400

        query = {"$or": [{"_id": ObjectId(booking_id)} if ObjectId.is_valid(booking_id) else None, {"booking_id": booking_id}]}
        query["$or"] = [q for q in query["$or"] if q]

        res = book_sales_collection.update_one(query, {"$set": {"status": new_status, "updated_at": datetime.now(UTC)}})
        if res.matched_count == 0:
            return jsonify({"success": False, "error": "Booking request not found"}), 404

        return jsonify({"success": True, "message": "Booking status updated successfully", "status": new_status}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
# 📋 RECENT ENQUIRIES API (PUBLIC - for landing page)
# ============================================================
@app.route("/api/recent-enquiries", methods=["GET", "OPTIONS"], strict_slashes=False)
@app.route("/recent-enquiries", methods=["GET", "OPTIONS"], strict_slashes=False)
def recent_enquiries():
    if request.method == "OPTIONS":
        return "", 204
    try:
        bookings = list(service_booking_collection.find().sort("_id", -1))
        result = []
        for doc in bookings:
            bike = doc.get("bike") if isinstance(doc.get("bike"), dict) else {}
            manufacturer = doc.get("manufacturer") or bike.get("manufacturer", "")
            model = doc.get("model") or bike.get("model", "")
            service_type = doc.get("serviceType") or doc.get("service_type", "Service Enquiry")
            date_val = doc.get("date", "")
            created_at = doc.get("created_at")
            if isinstance(created_at, datetime):
                created_at = created_at.isoformat()
            bike_image_url = doc.get("bike_image_url", "")
            status = doc.get("status", "Pending")
            result.append({
                "booking_id": str(doc.get("_id")),
                "serviceType": service_type,
                "manufacturer": manufacturer,
                "model": model,
                "bike_image_url": bike_image_url,
                "date": str(date_val),
                "status": status,
                "created_at": created_at
            })
        return jsonify({"success": True, "enquiries": result, "total": len(result)}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e), "enquiries": []}), 500


# ============================================================
# ⭐ SERVICE REVIEWS API (SUBMIT, LIST, CHECK PENDING)
# ============================================================

# 1. POST /api/reviews - Submit review after service is completed
@app.route("/api/reviews", methods=["POST", "OPTIONS"], strict_slashes=False)
@app.route("/api/service-review", methods=["POST", "OPTIONS"], strict_slashes=False)
def create_review():
    if request.method == "OPTIONS":
        return "", 204
    try:
        data = request.get_json(silent=True) or {}
        booking_id = str(data.get("booking_id") or "").strip()
        rating = data.get("rating")
        description = str(data.get("description") or data.get("comment") or "").strip()
        user_id = str(data.get("user_id") or "").strip()

        if not booking_id:
            return jsonify({"success": False, "error": "Booking ID is required"}), 400

        if rating is None or rating == "":
            return jsonify({"success": False, "error": "Star rating is required"}), 400

        try:
            rating_num = int(rating)
            if rating_num < 1 or rating_num > 5:
                return jsonify({"success": False, "error": "Rating must be between 1 and 5 stars"}), 400
        except (ValueError, TypeError):
            return jsonify({"success": False, "error": "Invalid rating format"}), 400

        if not description:
            return jsonify({"success": False, "error": "Review description is required"}), 400

        # Check if already reviewed
        existing_review = reviews_collection.find_one({"booking_id": booking_id})
        if existing_review:
            return jsonify({
                "success": False,
                "error": "Review has already been submitted for this service.",
                "already_reviewed": True
            }), 409

        # Look up booking details to enrich review
        booking_query = {"$or": [{"_id": ObjectId(booking_id)} if ObjectId.is_valid(booking_id) else None, {"booking_id": booking_id}]}
        booking_query["$or"] = [q for q in booking_query["$or"] if q]
        booking_doc = service_booking_collection.find_one(booking_query)

        bike_name = data.get("bike") or ""
        service_type = data.get("serviceType") or data.get("service_type") or ""
        user_name = data.get("name") or data.get("user_name") or ""
        user_avatar = data.get("user_avatar") or data.get("profile_picture") or ""

        if booking_doc:
            if not user_id:
                user_id = str(booking_doc.get("user_id") or "")
            if not bike_name:
                bike = booking_doc.get("bike") if isinstance(booking_doc.get("bike"), dict) else {}
                mfg = booking_doc.get("manufacturer") or bike.get("manufacturer", "")
                mdl = booking_doc.get("model") or bike.get("model", "")
                var = booking_doc.get("variant") or bike.get("variant", "")
                parts = [p for p in [mfg, mdl] if p]
                bike_name = " ".join(parts).strip()
                if var:
                    bike_name += f" ({var})"
            if not service_type:
                service_type = booking_doc.get("serviceType") or booking_doc.get("service_type") or "General Service"

        # Lookup user name and avatar if missing
        if user_id and (not user_name or not user_avatar):
            user_query = {"$or": [{"_id": ObjectId(user_id)} if ObjectId.is_valid(user_id) else None, {"email": user_id}]}
            user_query["$or"] = [q for q in user_query["$or"] if q]
            u_doc = user_collection.find_one(user_query)
            if u_doc:
                if not user_name:
                    user_name = u_doc.get("name", "Rider")
                if not user_avatar:
                    user_avatar = u_doc.get("profile_picture", "")

        review_doc = {
            "booking_id": booking_id,
            "user_id": user_id,
            "user_name": user_name or "Rider",
            "user_avatar": user_avatar or "",
            "bike": bike_name or "Motorcycle Service",
            "service_type": service_type or "General Service",
            "rating": rating_num,
            "description": description,
            "comment": description,
            "created_at": datetime.now(UTC),
            "updated_at": datetime.now(UTC)
        }

        res = reviews_collection.insert_one(review_doc)

        # Mark service booking as reviewed in database
        if booking_doc:
            service_booking_collection.update_one(
                booking_query,
                {"$set": {"reviewed": True, "rating": rating_num, "review_id": str(res.inserted_id), "updated_at": datetime.now(UTC)}}
            )

        review_doc["_id"] = str(res.inserted_id)
        review_doc["id"] = str(res.inserted_id)
        if isinstance(review_doc.get("created_at"), datetime):
            review_doc["created_at"] = review_doc["created_at"].isoformat()
        if isinstance(review_doc.get("updated_at"), datetime):
            review_doc["updated_at"] = review_doc["updated_at"].isoformat()

        return jsonify({
            "success": True,
            "message": "Thank you! Your review has been submitted successfully.",
            "review": review_doc
        }), 201

    except Exception as e:
        print("❌ SUBMIT REVIEW ERROR:", str(e))
        return jsonify({"success": False, "error": str(e)}), 500


# 2. GET /api/reviews - List all user reviews for landing page
@app.route("/api/reviews", methods=["GET", "OPTIONS"], strict_slashes=False)
@app.route("/api/service-reviews", methods=["GET", "OPTIONS"], strict_slashes=False)
def get_reviews():
    if request.method == "OPTIONS":
        return "", 204
    try:
        reviews = list(reviews_collection.find().sort("_id", -1))
        serialized = []
        for r in reviews:
            serialized.append(serialize_doc(r))

        # Initial fallback seed reviews if collection is completely fresh
        if not serialized:
            serialized = [
                {
                    "_id": "seed-1",
                    "id": "seed-1",
                    "user_name": "Arun Karthik",
                    "user_avatar": "",
                    "bike": "Yamaha R15 V4",
                    "service_type": "Performance Tuning",
                    "rating": 5,
                    "description": "Amazing service and perfect modification! My bike feels brand new. Highly recommended!",
                    "created_at": datetime.now(UTC).isoformat()
                },
                {
                    "_id": "seed-2",
                    "id": "seed-2",
                    "user_name": "Vignesh Kumar",
                    "user_avatar": "",
                    "bike": "Royal Enfield Classic 350",
                    "service_type": "Full General Service",
                    "rating": 5,
                    "description": "Super clean workshop and genuine parts used. The throttle response and engine smoothness are top tier.",
                    "created_at": datetime.now(UTC).isoformat()
                },
                {
                    "_id": "seed-3",
                    "id": "seed-3",
                    "user_name": "Rahul Sharma",
                    "user_avatar": "",
                    "bike": "KTM Duke 390",
                    "service_type": "Brake & Suspension Overhaul",
                    "rating": 5,
                    "description": "Expert mechanics who truly understand performance machines. Fast turnaround and transparent pricing!",
                    "created_at": datetime.now(UTC).isoformat()
                }
            ]

        return jsonify({
            "success": True,
            "reviews": serialized,
            "total": len(serialized)
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e), "reviews": []}), 500


# 3. GET /api/reviews/pending/<user_id> - Check if user has an unreviewed completed service
@app.route("/api/reviews/pending/<user_id>", methods=["GET", "OPTIONS"], strict_slashes=False)
@app.route("/api/service-reviews/pending/<user_id>", methods=["GET", "OPTIONS"], strict_slashes=False)
def check_pending_review(user_id):
    if request.method == "OPTIONS":
        return "", 204
    try:
        user_id = str(user_id).strip()
        query_conditions = [{"user_id": user_id}, {"user_id": str(user_id)}]
        if ObjectId.is_valid(user_id):
            query_conditions.append({"user_id": ObjectId(user_id)})

        # Find completed bookings for this user
        bookings = list(service_booking_collection.find({
            "$and": [
                {"$or": query_conditions},
                {"status": {"$regex": "^completed$", "$options": "i"}}
            ]
        }).sort("_id", -1))

        for b in bookings:
            booking_id = str(b.get("_id"))
            # If already marked reviewed
            if b.get("reviewed") is True:
                continue

            # Check reviews collection directly
            existing = reviews_collection.find_one({"booking_id": booking_id})
            if existing:
                service_booking_collection.update_one({"_id": b["_id"]}, {"$set": {"reviewed": True}})
                continue

            # Found an unreviewed completed booking!
            bike = b.get("bike") if isinstance(b.get("bike"), dict) else {}
            mfg = b.get("manufacturer") or bike.get("manufacturer", "")
            mdl = b.get("model") or bike.get("model", "")
            var = b.get("variant") or bike.get("variant", "")
            parts = [p for p in [mfg, mdl] if p]
            bike_name = " ".join(parts).strip()
            if var:
                bike_name += f" ({var})"

            date_val = b.get("date", "")
            if isinstance(date_val, datetime):
                date_val = date_val.isoformat()

            return jsonify({
                "success": True,
                "has_pending": True,
                "booking": {
                    "booking_id": booking_id,
                    "bike": bike_name or "Your Bike",
                    "serviceType": b.get("serviceType") or b.get("service_type") or "General Service",
                    "date": str(date_val),
                    "status": b.get("status", "Completed")
                }
            }), 200

        return jsonify({
            "success": True,
            "has_pending": False
        }), 200

    except Exception as e:
        print("❌ CHECK PENDING REVIEW ERROR:", str(e))
        return jsonify({"success": False, "error": str(e), "has_pending": False}), 500


# ============================================================
# 📁 SERVE FRONTEND STATIC FILES (FALLBACK)
# ============================================================
@app.route("/<path:path>", methods=["GET"])
def serve_static(path):
    if path.startswith("api/"):
        return jsonify({"success": False, "error": f"Endpoint /{path} not found"}), 404
    file_path = os.path.join(FRONTEND_DIR, path)
    if os.path.isfile(file_path):
        return send_from_directory(FRONTEND_DIR, path)
    from flask import abort
    abort(404)


# 🚀 Run app
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=True)




