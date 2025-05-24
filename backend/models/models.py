from pydantic import BaseModel
from typing import List, Optional


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


class UserAccount(BaseModel):
    email: str
    password: str
    name: str


class UserLogin(BaseModel):
    email: str
    password: str


class LoggedInUser(BaseModel):
    user: UserAccount
    token: str
