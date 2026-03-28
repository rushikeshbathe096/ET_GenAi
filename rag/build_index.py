from pathlib import Path
import json
import pickle

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


BASE_DIR = Path(__file__).resolve().parent
EVENTS_JSON_PATH = BASE_DIR / "historical_events.json"
INDEX_PATH = BASE_DIR / "faiss_index.bin"
STORE_PATH = BASE_DIR / "events_store.pkl"
MODEL_NAME = "all-MiniLM-L6-v2"


def load_events():
	with open(EVENTS_JSON_PATH, "r", encoding="utf-8") as f:
		events = json.load(f)

	if not isinstance(events, list):
		raise ValueError("historical_events.json must contain a list of events")
	if len(events) != 20:
		raise ValueError("historical_events.json must contain exactly 20 events")

	required_fields = {
		"id",
		"ticker",
		"company",
		"event_description",
		"outcome_pct_30d",
	}
	for idx, event in enumerate(events):
		missing = required_fields - set(event.keys())
		if missing:
			raise ValueError(f"Event at index {idx} is missing fields: {sorted(missing)}")

	return events


def build_index():
	events = load_events()
	model = SentenceTransformer(MODEL_NAME)

	descriptions = [event["event_description"] for event in events]
	embeddings = model.encode(
		descriptions,
		convert_to_numpy=True,
		normalize_embeddings=True,
	).astype(np.float32)

	dim = embeddings.shape[1]
	index = faiss.IndexFlatIP(dim)
	index.add(embeddings)

	faiss.write_index(index, str(INDEX_PATH))

	store = {
		"model_name": MODEL_NAME,
		"events": events,
	}
	with open(STORE_PATH, "wb") as f:
		pickle.dump(store, f)

	print(f"Index built with {len(events)} events")


def _load_index_and_store():
	if not INDEX_PATH.exists() or not STORE_PATH.exists():
		raise FileNotFoundError("Index artifacts missing. Run: python rag/build_index.py")

	index = faiss.read_index(str(INDEX_PATH))
	with open(STORE_PATH, "rb") as f:
		store = pickle.load(f)

	model_name = store.get("model_name", MODEL_NAME)
	events = store["events"]
	model = SentenceTransformer(model_name)
	return model, index, events


def get_similar_events(query, k=3):
	model, index, events = _load_index_and_store()

	if not query or not isinstance(query, str):
		raise ValueError("query must be a non-empty string")

	k = max(1, min(int(k), len(events)))

	query_vec = model.encode(
		[query],
		convert_to_numpy=True,
		normalize_embeddings=True,
	).astype(np.float32)

	scores, indices = index.search(query_vec, k)

	results = []
	for rank, (event_idx, score) in enumerate(zip(indices[0], scores[0]), start=1):
		event = events[int(event_idx)]
		results.append(
			{
				"rank": rank,
				"score": float(score),
				"id": event["id"],
				"ticker": event["ticker"],
				"company": event["company"],
				"event_description": event["event_description"],
				"outcome_pct_30d": event["outcome_pct_30d"],
			}
		)

	return results


if __name__ == "__main__":
	build_index()
