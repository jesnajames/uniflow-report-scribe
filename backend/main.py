import uuid
from datetime import datetime
from typing import List

from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.repositories.topics_db import list_topics, create_topic, get_topic
from backend.repositories.contributions_db import list_topic_contributions, create_contribution
from backend.models.models import Topic, Contribution, Summary, TopicCreate, ContributionCreate, InviteUsers

app = FastAPI(title="UniNoter API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "UniNoter API is running"}


@app.get("/api/topics", response_model=List[Topic])
async def get_topics():
    """Get all topics"""
    topics = list_topics()
    all_topics = {}
    for topic in topics:
        all_topics[topic["_id"]] = Topic(**topic)
    return list(all_topics.values())


@app.post("/api/topics", response_model=Topic)
async def create_new_topic(topic: TopicCreate):
    """Create a new topic"""
    topic_id = str(uuid.uuid4())
    new_topic = Topic(
        id=topic_id,
        title=topic.title,
        description=topic.description,
        created_at=datetime.now().isoformat()
    )
    create_topic(new_topic.model_dump())
    return new_topic


@app.get("/api/topics/{topic_id}", response_model=Topic)
async def get_topic_by_id(topic_id: str):
    """Get a specific topic"""
    print(f"Finding topic", topic_id)
    topic = get_topic(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    return Topic(**topic)


@app.get("/api/topics/{topic_id}/contributions", response_model=List[Contribution])
async def get_contributions(topic_id: str):
    """Get all contributions for a topic"""
    # if topic_id not in topics_db:
    #     raise HTTPException(status_code=404, detail="Topic not found")

    topic_contributions = [
        Contribution(**contrib)
        for contrib in list_topic_contributions(topic_id)
    ]

    # Sort by created_at in descending order (newest first)
    topic_contributions.sort(key=lambda x: x.created_at, reverse=True)

    return topic_contributions


@app.post("/api/topics/{topic_id}/contributions", response_model=Contribution)
async def create_new_contribution(topic_id: str, contribution: ContributionCreate):
    """Create a new contribution for a topic"""
    # if topic_id not in topics_db:
    #     raise HTTPException(status_code=404, detail="Topic not found")

    contribution_id = str(uuid.uuid4())
    new_contribution = Contribution(
        id=contribution_id,
        topic_id=topic_id,
        content=contribution.content,
        created_at=datetime.now().isoformat()
    )
    create_contribution(new_contribution.model_dump())

    return new_contribution


@app.post("/api/topics/{topic_id}/generate-summary", response_model=Summary)
async def generate_summary(topic_id: str):
    """Generate a summary report for a topic"""
    print(f"Generating summary for topic", topic_id)
    topic = get_topic(topic_id)
    topic_contributions = list_topic_contributions(topic_id)
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
    # TODO save summary?
    return summary


# @app.get("/api/topics/{topic_id}/summary", response_model=Summary)
# async def get_summary(topic_id: str):
#     """Get the generated summary for a topic"""
#     return Summary(**summaries_db[topic_id])


@app.post("/api/topics/{topic_id}/invite")
async def invite_users(topic_id: str, invite_data: InviteUsers):
    """Invite users to collaborate on a topic"""
    print(f"Inviting users to collaborate on topic", topic_id, invite_data)

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
    uvicorn.run(app, host="localhost", port=8080)
