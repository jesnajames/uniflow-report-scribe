
# UniNoter FastAPI Backend

This is the FastAPI backend for the UniNoter collaborative document editor.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Topics
- `GET /api/topics` - Get all topics
- `POST /api/topics` - Create a new topic
- `GET /api/topics/{topic_id}` - Get a specific topic

### Contributions
- `GET /api/topics/{topic_id}/contributions` - Get all contributions for a topic
- `POST /api/topics/{topic_id}/contributions` - Create a new contribution

### Reports
- `POST /api/topics/{topic_id}/generate-summary` - Generate a summary report
- `GET /api/topics/{topic_id}/summary` - Get the generated summary

### User Management
- `POST /api/topics/{topic_id}/invite` - Invite users to collaborate

## Data Storage

Currently uses JSON files for data persistence:
- `topics.json` - Stores all topics
- `contributions.json` - Stores all contributions
- `summaries.json` - Stores generated summaries

In production, replace with a proper database like PostgreSQL.

## CORS Configuration

The API is configured to allow all origins for development. In production, update the CORS middleware to only allow your frontend domain.

## Next Steps

1. Replace JSON file storage with a proper database
2. Implement user authentication and authorization
3. Add email service for user invitations
4. Integrate with AI services for better summary generation
5. Add input validation and error handling
6. Implement rate limiting and security measures
