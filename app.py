from datetime import datetime
import os
import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from haystack import Document
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.components.retrievers.in_memory import InMemoryBM25Retriever
from haystack.components.embedders import SentenceTransformersTextEmbedder
from haystack import Pipeline
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

import spacy


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

def load_document(vault_path, translate='zh2en'):

    documents = []
    for filename in os.listdir(vault_path):
        if filename.endswith(".md"):
            file_path = os.path.join(vault_path, filename)

            with open(file_path, "r", encoding="utf-8") as file:
                content = file.read()
                if translate == 'zh2en':
                    content_en = _translate_zh2en(content)
            
            doc = Document(content=content_en, meta={"name": filename})     # TODO: meta .md
            documents.append(doc)


    document_store = InMemoryDocumentStore(bm25_algorithm="BM25Plus")
    document_store.write_documents(documents=documents)

    return document_store


def _translate_zh2en(src_text):
    tokenizer = AutoTokenizer.from_pretrained("Helsinki-NLP/opus-mt-zh-en")
    model = AutoModelForSeq2SeqLM.from_pretrained("Helsinki-NLP/opus-mt-zh-en")

    sentences = _split_into_sentences(src_text)
    # sentences = src_text
    translations = ''

    for sentence in sentences:
        translated = tokenizer.prepare_seq2seq_batch([sentence], return_tensors="pt")
        output = model.generate(**translated)
        translation = tokenizer.batch_decode(output, skip_special_tokens=True)[0]
        translations += translation

    return translations


def _split_into_sentences(text):
    nlp = spacy.load("zh_core_web_sm")
    doc = nlp(text)
    return [sent.text.strip() for sent in doc.sents]



document_store = load_document(vault_path, translate='zh2en')
pipeline = Pipeline()
# pipeline.add_component(instance=text_embedder, name="text_embedder")
pipeline.add_component(instance=InMemoryBM25Retriever(document_store=document_store), name="retriever")

# pipeline.connect("text_embedder", "retriever")

@app.get("/search")
def search(query: str):
    result = pipeline.run(data={"retriever": {"query": query}})
    return result
