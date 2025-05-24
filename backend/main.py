
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime
import json
import os

app = FastAPI(title="UniNoter API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class TopicCreate(BaseModel):
    title: str
    description: Optional[str] = None

class Topic(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    created_at: str

class ContributionCreate(BaseModel):
    content: str

class Contribution(BaseModel):
    id: str
    topic_id: str
    content: str
    created_at: str
    contributor_email: Optional[str] = None

class Summary(BaseModel):
    topic_id: str
    content: str
    generated_at: str

class InviteUsers(BaseModel):
    emails: List[str]

# In-memory storage (replace with database in production)
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

# Load existing data on startup
load_data()

@app.get("/")
async def root():
    return {"message": "UniNoter API is running"}

@app.get("/api/topics", response_model=List[Topic])
async def get_topics():
    """Get all topics"""
    return list(topics_db.values())

@app.post("/api/topics", response_model=Topic)
async def create_topic(topic: TopicCreate):
    """Create a new topic"""
    topic_id = str(uuid.uuid4())
    new_topic = Topic(
        id=topic_id,
        title=topic.title,
        description=topic.description,
        created_at=datetime.now().isoformat()
    )
    
    topics_db[topic_id] = new_topic.dict()
    save_data()
    
    return new_topic

@app.get("/api/topics/{topic_id}", response_model=Topic)
async def get_topic(topic_id: str):
    """Get a specific topic"""
    if topic_id not in topics_db:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    return Topic(**topics_db[topic_id])

@app.get("/api/topics/{topic_id}/contributions", response_model=List[Contribution])
async def get_contributions(topic_id: str):
    """Get all contributions for a topic"""
    if topic_id not in topics_db:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    topic_contributions = [
        Contribution(**contrib) 
        for contrib in contributions_db.values() 
        if contrib["topic_id"] == topic_id
    ]
    
    # Sort by created_at in descending order (newest first)
    topic_contributions.sort(key=lambda x: x.created_at, reverse=True)
    
    return topic_contributions

@app.post("/api/topics/{topic_id}/contributions", response_model=Contribution)
async def create_contribution(topic_id: str, contribution: ContributionCreate):
    """Create a new contribution for a topic"""
    if topic_id not in topics_db:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    contribution_id = str(uuid.uuid4())
    new_contribution = Contribution(
        id=contribution_id,
        topic_id=topic_id,
        content=contribution.content,
        created_at=datetime.now().isoformat()
    )
    
    contributions_db[contribution_id] = new_contribution.dict()
    save_data()
    
    return new_contribution

@app.post("/api/topics/{topic_id}/generate-summary", response_model=Summary)
async def generate_summary(topic_id: str):
    """Generate a summary report for a topic"""
    if topic_id not in topics_db:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Get topic and contributions
    topic = topics_db[topic_id]
    topic_contributions = [
        contrib for contrib in contributions_db.values() 
        if contrib["topic_id"] == topic_id
    ]
    
    if not topic_contributions:
        raise HTTPException(status_code=400, detail="No contributions found for this topic")
    
    # Simple summary generation (replace with AI/ML service in production)
    summary_content = f"""# Summary Report for {topic['title']}

This document presents a comprehensive analysis of all contributions submitted for this topic.

## Key Insights

Based on the {len(topic_contributions)} contribution{'s' if len(topic_contributions) != 1 else ''} received, several important themes emerge:

"""
    
    for i, contrib in enumerate(topic_contributions[:3], 1):
        content_preview = contrib['content'][:200] + ('...' if len(contrib['content']) > 200 else '')
        summary_content += f"""### Insight {i}
{content_preview}

"""
    
    summary_content += """## Recommendations

1. **Continue the discussion** - The contributions show diverse perspectives that merit further exploration
2. **Action items** - Consider implementing the practical suggestions mentioned in the contributions
3. **Follow-up** - Schedule regular reviews to track progress on discussed topics

## Conclusion

The collaborative effort has produced valuable insights that can guide future decision-making and strategy development.

*Report generated on {generated_date} from {contribution_count} contributions*""".format(
        generated_date=datetime.now().strftime("%B %d, %Y"),
        contribution_count=len(topic_contributions)
    )
    
    summary = Summary(
        topic_id=topic_id,
        content=summary_content,
        generated_at=datetime.now().isoformat()
    )
    
    summaries_db[topic_id] = summary.dict()
    save_data()
    
    return summary

@app.get("/api/topics/{topic_id}/summary", response_model=Summary)
async def get_summary(topic_id: str):
    """Get the generated summary for a topic"""
    if topic_id not in topics_db:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    if topic_id not in summaries_db:
        raise HTTPException(status_code=404, detail="Summary not found")
    
    return Summary(**summaries_db[topic_id])

@app.post("/api/topics/{topic_id}/invite")
async def invite_users(topic_id: str, invite_data: InviteUsers):
    """Invite users to collaborate on a topic"""
    if topic_id not in topics_db:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # In a real implementation, you would:
    # 1. Send email invitations
    # 2. Create user accounts or invitation tokens
    # 3. Store invitation records
    
    # For now, just return success
    return {
        "message": f"Invitations sent to {len(invite_data.emails)} users",
        "invited_emails": invite_data.emails,
        "topic_id": topic_id
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
