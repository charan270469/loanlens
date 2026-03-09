# LoanLens AI – Technologies, APIs & Models Checklist

## ✅ What You Have (Present in Repo)

### 1. Model artifacts
| Location | Contents | Used by |
|----------|----------|---------|
| `model_artifacts/credit_risk/` | `pd_model.sav`, `pd_model_deployment.sav`, `lgd_model_stage_1.sav`, `lgd_model_stage_2.sav`, `reg_ead.sav` | PD/LGD/EAD scoring in `model_service/service.py` |
| `model_artifacts/pd/mock_from_env/` | `model.pkl`, `calibrator.pkl`, `feature_schema.json`, `metrics.json`, etc. | PD ensemble when `PD_MODEL_MODE=synthetic` |
| `model_artifacts/pd/20260301_152938/` | Same structure (alternate PD version) | PD registry / versioning |
| `model_artifacts/pd/active_version.txt` | Points to active PD version | Runtime model selection |

All paths are resolved from **project root** (`iiith_proj/`), so `model_artifacts/` at repo root is correct.

### 2. Python dependencies in `backend/requirements.txt`
- **Core:** pandas, numpy, pyarrow, fastapi, uvicorn, python-dotenv, requests  
- **Document:** pymupdf, PyMuPDF, Pillow, opencv-python, **landingai-ade**  
- **ML/credit:** scikit-learn, xgboost, lightgbm, shap, mlflow, pyspark, delta-spark  
- **RAG/LLM:** sentence_transformers, langchain-huggingface, langchain-community, langchain-aws, langchain-groq, langchain-text-splitters  
- **Other:** beautifulsoup4, python-docx, reportlab, transformers, matplotlib  

### 3. Backend code
- FastAPI app, all controllers (upload, evaluate, search, case, research, notes, cam, model)  
- Document extraction (Landing AI ADE) in `main.py` + `doc_extractor`  
- Loan core (fraud, decision, metrics), RAG (FAISS + Groq/Bedrock), model scoring, research agent  

---

## ⚠️ Gaps / Recommended Additions

### 1. **faiss-cpu** (recommended)
- **Used by:** `rag_service/embedding_store.py` → `langchain_community.vectorstores.FAISS`
- **Status:** Not in `requirements.txt`. LangChain’s FAISS integration expects `faiss-cpu` (or `faiss-gpu`) to be installed.
- **Action:** Add to `backend/requirements.txt`:
  ```text
  faiss-cpu
  ```

### 2. **catboost** (optional)
- **Used by:** `model_service/service.py` (CatBoost PD step), `model_service/training/train_pd.py` (optional backend)
- **Status:** Not in `requirements.txt`; import is inside try/except, so the app runs without it but CatBoost path is skipped.
- **Action:** If you want CatBoost as part of the PD ensemble, add:
  ```text
  catboost
  ```

### 3. **langchain-core**
- **Used by:** `langchain_core.prompts`, `langchain_core.output_parsers`, `langchain_core.documents`
- **Status:** Usually pulled in by langchain-groq / langchain-community; if you see import errors, add:
  ```text
  langchain-core
  ```

---

## 🔑 API keys & environment variables

### Required for core flow (document extraction + RAG)

| Variable | Purpose | Required? |
|----------|---------|-----------|
| **VISION_AGENT_API_KEY** | Landing AI ADE (document extraction, identity/passport analysis) | **Yes** – document extraction and image fraud will fail without it |
| **GROQ_API_KEY** | RAG chatbot, summarization (when `LLM_PROVIDER=groq`) | **Yes** if you use RAG/summaries and keep default `LLM_PROVIDER=groq` |
| **LLM_PROVIDER** | `groq` or `bedrock` | Optional; default `groq` |
| **LLM_MODEL** | e.g. `llama-3.3-70b-versatile` | Optional; has default |
| **LLM_SMALL_MODEL** | e.g. `llama-3.1-8b-instant` | Optional; has default |

### Optional – AWS Bedrock (alternative LLM)
| Variable | Purpose |
|----------|---------|
| AWS_ACCESS_KEY | When `LLM_PROVIDER=bedrock` |
| AWS_SECRET_KEY | When `LLM_PROVIDER=bedrock` |
| AWS_REGION | e.g. `us-east-1` |

### Optional – secondary research
| Variable | Purpose |
|----------|---------|
| SERPAPI_API_KEY | Web search (research agent) |
| NEWSAPI_API_KEY | News/sentiment (research agent) |
| RESEARCH_MAX_QUERIES, RESEARCH_RESULTS_PER_QUERY, RESEARCH_HTTP_TIMEOUT_SEC | Tuning; have defaults |

### Optional – PD model and Databricks
| Variable | Purpose |
|----------|---------|
| PD_MODEL_MODE | `synthetic` \| `shadow` \| `production` (default `synthetic`) |
| PD_ACTIVE_VERSION, PD_MODEL_DIR, PD_TRAIN_DATA_PATH, PD_OOT_DAYS | Real-label PD training / deployment |
| DATABRICKS_* | Only if using Databricks ingestor |

**Where to set:** Copy `backend/.env.example` to `backend/.env` and fill in the keys you use.

---

## Summary

| Category | Status |
|----------|--------|
| **Model artifacts** | ✅ Present (`credit_risk` .sav, `pd/` pkl + metadata) |
| **Core Python deps** | ✅ In `requirements.txt` |
| **Landing AI ADE** | ✅ In requirements; needs **VISION_AGENT_API_KEY** in `.env` |
| **RAG (FAISS + LLM)** | ⚠️ Add **faiss-cpu**; set **GROQ_API_KEY** (or Bedrock keys) |
| **CatBoost** | Optional; add **catboost** if you want that PD path |
| **Research (SerpAPI / NewsAPI)** | Optional; set keys if you use research agent |
| **Frontend** | ❌ Not in repo (docs only) |

**Minimum to run backend + document flow + RAG:**  
1. `backend/.env` with **VISION_AGENT_API_KEY** and **GROQ_API_KEY**  
2. `pip install -r requirements.txt` and add **faiss-cpu** (and optionally **catboost**)

After that, you have all technologies, APIs, and models required for the current backend design; only API keys and the optional/extra packages above need to be provided or added.
