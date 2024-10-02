from datetime import datetime
import os
import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from haystack.components.embedders import SentenceTransformersTextEmbedder, SentenceTransformersDocumentEmbedder
from haystack import Document, Pipeline
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.components.retrievers.in_memory import InMemoryBM25Retriever, InMemoryEmbeddingRetriever
from haystack.components.rankers import TransformersSimilarityRanker
from haystack.components.joiners import DocumentJoiner

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_documents_from_folder(folder_path):
    documents = []
    # cnt_file = 0
    for root, dirs, files in os.walk(folder_path):
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        for file_name in files:
            if file_name.endswith(".md"):
                # cnt_file += 1
                file_path = os.path.join(root, file_name)  
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                documents.append(Document(content=content, meta={"name": file_path})) 
    # print(cnt_file) 
    return documents


def setup_pipeline(documents):
    doc_embedder = SentenceTransformersDocumentEmbedder(model="BAAI/bge-small-en-v1.5")
    doc_embedder.warm_up()
    docs_with_embeddings = doc_embedder.run(documents)["documents"]

    document_store = InMemoryDocumentStore()
    document_store.write_documents(docs_with_embeddings)
    
    text_embedder = SentenceTransformersTextEmbedder(model="BAAI/bge-small-en-v1.5")
    embedding_retriever = InMemoryEmbeddingRetriever(document_store)
    bm25_retriever = InMemoryBM25Retriever(document_store)
    
    ranker = TransformersSimilarityRanker(model="BAAI/bge-reranker-base")
    document_joiner = DocumentJoiner()
    
    retrieval_pipeline = Pipeline()
    retrieval_pipeline.add_component("text_embedder", text_embedder)
    retrieval_pipeline.add_component("embedding_retriever", embedding_retriever)
    retrieval_pipeline.add_component("bm25_retriever", bm25_retriever)
    retrieval_pipeline.add_component("document_joiner", document_joiner)
    retrieval_pipeline.add_component("ranker", ranker)
    
    retrieval_pipeline.connect("text_embedder", "embedding_retriever")
    retrieval_pipeline.connect("bm25_retriever", "document_joiner")
    retrieval_pipeline.connect("embedding_retriever", "document_joiner")
    retrieval_pipeline.connect("document_joiner", "ranker")
    
    return retrieval_pipeline


def run_query(pipeline, query):
    result = pipeline.run(
        {"text_embedder": {"text": query}, "bm25_retriever": {"query": query}, "ranker": {"query": query}}
    )
    return result


def pretty_results(prediction, vault_path):
    doc_names = []
    for doc in prediction["documents"]:

        doc_name = os.path.relpath(doc.meta["name"], vault_path)
        doc_names.append(os.path.splitext(doc_name)[0])
    return doc_names


def main(query):
    with open("data.json") as file:
        data = json.load(file)

    vault_path = data["vaultPath"]
    # model_name = data["setModel"]

    documents = load_documents_from_folder(vault_path)
    pipeline = setup_pipeline(documents)
    result = run_query(pipeline, query)

    return result


@app.get("/search")
def search(query: str):
    names = main(query)
    return names

