from backend.database_client import client
db = client["uninoter"]
users_collection = db["users"]


def create_user(user):
    return users_collection.insert_one(user.model_dump())


def get_user(email: str):
    return users_collection.find_one({"email": email})
