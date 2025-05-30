from fastapi import FastAPI
from pydantic import BaseModel
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings, HuggingFaceEndpoint
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain_core.documents import Document
import os
import requests

os.environ["HUGGINGFACEHUB_API_TOKEN"] = "your tocken"

app = FastAPI()

class FrageRequest(BaseModel):
    frage: str

def build_rag_chain():
    # Die Kurse JETZT holen, nicht beim Start!
    response = requests.get("http://course-service:8080/courses")
    courses = response.json()
    documents = []
    for course in courses:
        text = f"{course['title']} {course['description']} Credits: {course['credits']}"
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

@app.post("/frage")
def frage_beantworten(req: FrageRequest):
    qa_chain = build_rag_chain()
    antwort = qa_chain.run(req.frage)
    return {"antwort": antwort}
