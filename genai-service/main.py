from fastapi import FastAPI
from pydantic import BaseModel
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings, HuggingFaceEndpoint
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
import os

# Konfiguration
os.environ["HUGGINGFACEHUB_API_TOKEN"] = "add your own tocken"

# Daten vorbereiten (kann später optimiert werden mit Persistenz)
loader = PyPDFLoader("Curriculum.pdf")
pages = loader.load()
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = splitter.split_documents(pages)
embedding = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
db = FAISS.from_documents(chunks, embedding)

# LLM vorbereiten
llm = HuggingFaceEndpoint(
    repo_id="HuggingFaceH4/zephyr-7b-beta",
    task="text-generation",
    temperature=0.5,
    max_new_tokens=256
)

# RAG-Chain
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=db.as_retriever()
)

# API starten
app = FastAPI()

class FrageRequest(BaseModel):
    frage: str

@app.post("/frage")
def frage_beantworten(req: FrageRequest):
    antwort = qa_chain.run(req.frage)
    return {"antwort": antwort}