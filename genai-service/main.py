from fastapi import FastAPI, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from ChatWebUI import ChatWebUI
import requests
from dotenv import load_dotenv
import os
import logging
from typing import Dict
from typing import List, Optional


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("genai-service")

# Load environment variables
load_dotenv()

# Define FastAPI app with metadata
app = FastAPI(
    title="GenAI Service",
    description="API for GenAI applications",
    version="1.0.0"
)

class QuestionRequest(BaseModel):
    question: str


def detect_course_id(question: str, course_ids: List[str]) -> Optional[str]:
    for cid in course_ids:
        if cid.lower() in question.lower():
            return cid
    return None

# Initialize LLM client
try:
    llm = ChatWebUI(
        api_url=os.getenv("API_URL"),
        api_key=os.getenv("API_KEY"),
        model=os.getenv("MODEL")
    )
except Exception as e:
    logger.error(f"Failed to initialize LLM client: {str(e)}")
    raise

@app.get("/health", status_code=status.HTTP_200_OK)
@app.head("/health", status_code=status.HTTP_200_OK)
def health_check():
    """Health check endpoint for container monitoring"""
    return {"status": "healthy", "service": "genai-service"}

def build_rag_context(question: str) -> str:
    response_courses = requests.get("http://course-service:8080/courses")
    courses = response_courses.json()

    response_reviews = requests.get("http://review-service:8080/reviews")
    reviews = response_reviews.json()

    documents = []
    for course in courses:
        course_reviews = [r for r in reviews if r["courseId"] == course["id"]]
        
        long_reviews = [r["reviewText"] for r in course_reviews if len(r["reviewText"]) > 30]
        
        top_reviews = long_reviews[:5]
        review_block = "\n".join([f"- {review}" for review in top_reviews]) or "No reviews available."

        text = (
            f"Course ID: {course['id']}\n"
            f"Title: {course['title']}\n"
            f"Description: {course['description']}\n"
            f"Credits: {course['credits']}\n"
            f"Student Reviews:\n{review_block}"
        )

        documents.append(Document(page_content=text, metadata={"id": course["id"]}))
    all_course_ids = [course["id"] for course in courses]
    target_course_id = detect_course_id(question, all_course_ids)

    if target_course_id:
        documents = [doc for doc in documents if doc.metadata["id"] == target_course_id]
        logger.info(f"Targeted search for course: {target_course_id}")

    splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=100, separators=["\n\n", "\n", ".", " "])
    chunks = splitter.split_documents(documents)

    embedding = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    db = FAISS.from_documents(chunks, embedding)

    relevant_docs = db.max_marginal_relevance_search(question, k=4, fetch_k=10)

    context = "\n\n".join([doc.page_content for doc in relevant_docs])
    return context

@app.post("/question")
def answer_question(req: QuestionRequest):
    context = build_rag_context(req.question)

    prompt = f"""You are an AI system that helps students choose the most suitable university course.

Use the following context to answer the question:

{context}

Question:
{req.question}

Answer:"""


    answer = llm.run(prompt)
    return {"answer": answer}
