from backend.database_client import client
db = client["uninoter"]
contributions_collection = db["contributions"]


def create_contribution(contribution):
    contributions_collection.insert_one(contribution)


def list_topic_contributions(topic_id):
    return list(contributions_collection.find({"topic_id": topic_id}))
