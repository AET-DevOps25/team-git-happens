from fastapi import FastAPI
from pydantic import BaseModel
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from ChatWebUI import ChatWebUI
import requests

app = FastAPI()

class QuestionRequest(BaseModel):
    question: str

llm = ChatWebUI(
    api_url="AddURL",
    api_key="ADDAPIKey",
    model="llama3.3:latest"
)

def build_rag_context(question: str) -> str:
    response_courses = requests.get("http://course-service:8080/courses")
    courses = response_courses.json()

    response_reviews = requests.get("http://review-service:8080/reviews")
    reviews = response_reviews.json()

    documents = []
    for course in courses:
        course_reviews = [r for r in reviews if r["courseId"] == course["id"]]
        review_texts = " ".join([r["reviewText"] for r in course_reviews])
        text = f"{course['title']} {course['description']} Credits: {course['credits']} Reviews: {review_texts}"
        documents.append(Document(page_content=text, metadata={"id": course["id"]}))

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_documents(documents)

    embedding = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    db = FAISS.from_documents(chunks, embedding)

    relevant_docs = db.similarity_search(question, k=4)
    context = "\n\n".join([doc.page_content for doc in relevant_docs])
    return context

@app.post("/question")
def answer_question(req: QuestionRequest):
    context = build_rag_context(req.question)

    prompt = f"""Du bist ein KI-System, das bei Kursauswahl hilft.

Nutze diesen Kontext:

{context}

Frage:
{req.question}

Antwort:"""

    answer = llm.run(prompt)
    return {"answer": answer}
