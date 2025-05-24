from backend.database_client import client
from backend.exceptions import AlreadyExists

db = client["uninoter"]
users_collection = db["users"]


def create_user(user):
    print(f"Creating user account", user)
    email = user.email
    if get_user(email):
        raise AlreadyExists("User already exists")
    user_dict = user.model_dump()
    user_dict["_id"] = str(user_dict["email"])
    return users_collection.insert_one(user_dict)


def get_user(email: str):
    return users_collection.find_one({"_id": email})
