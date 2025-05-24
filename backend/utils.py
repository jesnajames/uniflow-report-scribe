import json
import os

topics_db = {}
contributions_db = {}
summaries_db = {}


# Helper functions
def load_data():
    """Load data from JSON files if they exist"""
    global topics_db, contributions_db, summaries_db

    if os.path.exists("topics.json"):
        with open("topics.json", "r") as f:
            topics_db = json.load(f)

    if os.path.exists("contributions.json"):
        with open("contributions.json", "r") as f:
            contributions_db = json.load(f)

    if os.path.exists("summaries.json"):
        with open("summaries.json", "r") as f:
            summaries_db = json.load(f)


def save_data():
    """Save data to JSON files"""
    with open("topics.json", "w") as f:
        json.dump(topics_db, f)

    with open("contributions.json", "w") as f:
        json.dump(contributions_db, f)

    with open("summaries.json", "w") as f:
        json.dump(summaries_db, f)
