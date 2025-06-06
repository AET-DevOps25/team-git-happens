from fastapi import FastAPI
from pydantic import BaseModel
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings, HuggingFaceEndpoint
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain_core.documents import Document
import os
import requests

os.environ["HUGGINGFACEHUB_API_TOKEN"] = "ADD_Your_Token"

app = FastAPI()

class QuestionRequest(BaseModel):
    question: str

def build_rag_chain():
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
    llm = HuggingFaceEndpoint(
        repo_id="HuggingFaceH4/zephyr-7b-beta",
        task="text-generation",
        temperature=0.5,
        max_new_tokens=256
    )
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=db.as_retriever()
    )
    return qa_chain

@app.post("/question")
def answer_question(req: QuestionRequest):
    qa_chain = build_rag_chain()
    answer = qa_chain.run(req.question)
    return {"answer": answer}