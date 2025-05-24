from backend.database_client import client
db = client["uninoter"]
topics_collection = db["topics"]


def list_topics():
    return topics_collection.find({}) or {}


def create_topic(topic):
    return topics_collection.insert_one(topic)


def get_topic(topic_id):
    return topics_collection.find_one({"id": topic_id})


def update_topic(topic_id, topic):
    topics_collection.update_one({"topic_id": topic_id}, {"$set": topic})

