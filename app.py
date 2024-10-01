from datetime import datetime
import os
import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from haystack import Document
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.components.retrievers.in_memory import InMemoryBM25Retriever
from haystack import Pipeline


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

with open("data.json") as file:
    data = json.load(file)

vault_path = data["vaultPath"]
model_name = data["setModel"]

documents = []
for filename in os.listdir(vault_path):
    if filename.endswith(".md"):
        file_path = os.path.join(vault_path, filename)

        with open(file_path, "r", encoding="utf-8") as file:
            content = file.read()
        
        doc = Document(content=content, meta={"name": filename})
        documents.append(doc)


document_store = InMemoryDocumentStore(bm25_algorithm="BM25Plus")
document_store.write_documents(documents=documents)

pipeline = Pipeline()
pipeline.add_component(instance=InMemoryBM25Retriever(document_store=document_store), name="retriever")


@app.get("/search")
def search(query: str):
    result = pipeline.run(data={"retriever": {"query": query}})
    return result
