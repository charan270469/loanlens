## Intelli-Credit Workflow

This document explains how the **backend** and the new **React+Vite frontend** work together to implement the three pillars of the Intelli-Credit challenge.

---

## 1. High-Level Architecture

- **Frontend**: `frontend/` – React + Vite single-page app
  - Guides the credit officer through 3 steps:
    1. **Data Ingestor** – multi-format document uploads
    2. **Research Agent** – secondary research + officer notes
    3. **Recommendation Engine & CAM** – evaluation, explainability chat, CAM generation
  - Talks only to the **FastAPI backend** (no external API keys in the browser).

- **Backend**: `backend/` – FastAPI + Python services
  - Handles:
    - Landing AI ADE document parsing & KPIs
    - Fraud detection (text and image)
    - Research agent (SerpAPI + NewsAPI)
    - ML credit models (PD / LGD / EAD + policy decision)
    - Explainability + pricing
    - CAM generation (Five Cs of Credit)

- **Models & artifacts**: `model_artifacts/`
  - `pd/` – trained PD ensemble bundle (active version `mock_from_env`)
  - `credit_risk/` – legacy PD/LGD/EAD `.sav` files

---

## 2. Backend Workflow (Conceptual)

### 2.1 Case lifecycle

1. **Create / update case**
   - Endpoint: `POST /api/case/create`
   - Body (`CaseCreateRequest`):
     - `case_id` (optional; auto-generated if blank)
     - `company_name`, `applicant_name`, `sector`
   - Persists case metadata in `CaseRepository`.

2. **Upload documents (multi-format)**
   - Endpoints (all under `/api/upload`):
     - `/bank_statement`, `/tax_statement`, `/gst_filing`
     - `/credit_report`, `/income_proof`, `/utility_bill`, `/identity_document`
     - `/annual_report`, `/legal_notice`, `/sanction_letter`, `/board_minutes`
     - `/rating_report`, `/shareholding_pattern`
   - Request:
     - `metadata`: JSON string, must include `"caseId": "<case_id>"`
     - File field (varies by endpoint; e.g. `bank_statements`, `gst_filing` etc.)
   - The helper `persist_file_in_local()`:
     - Resolves `case_id` from metadata (or generates a new one)
     - Stores files under `backend/resources/{case_id}/{document_type}/`

3. **Document parsing & KPIs**
   - For each upload:
     - Uses **Landing AI ADE** + custom logic (`src/service/main.py`, loan_core KPI modules) to:
       - Parse PDFs / images → JSON
       - Compute per-document KPIs (bank, GST, ITR, credit report, etc.)
       - Save `{doc_type}_kpis.json` under `resources/{case_id}/{doc_type}/output/`
       - Save markdown summaries for reviewer UI.

4. **Baseline evaluator (existing engine)**
   - Function: `evaluate(case_id)` in `evaluator_service/evaluator.py`
   - Combines per-document KPIs and fraud outputs into:
     - `combined_features.json` and `kpis_final.json` under `final_output/`
     - A **baseline decision** via `DecisionEngine`
     - RAG index construction for the case (`RAGAgent.ingest()`).

5. **Full model workflow (optional job runner)**
   - Coordinator: `CreditWorkflowRunner.run(request: WorkflowRunRequest)`
   - Called by: `POST /api/case/{case_id}/run`
   - Steps:
     1. Run `evaluate(case_id)` and store as `existing_evaluator` features.
     2. Integrate due-diligence notes (`NotesService`, `notes_features`).
     3. Reconcile GST vs bank ledger (circular trading) via `DatabricksIngestorService` → `databricks_features`.
     4. Run research (`ResearchAgentService`) → `research_features`.
     5. Merge features (KPIs + databricks + research + notes + combined_features).
     6. Score PD/LGD/EAD + Expected Loss (`RecommendationModelService`):
        - Uses the trained PD ensemble from `model_artifacts/pd/`.
     7. Apply policy decision rules (`policy_decision` features).
     8. Compute explainability (`ExplainabilityService`) and pricing (`PricingService`).
     9. Generate CAM (`CamService.generate`) and save decision + snapshot to `DecisionRepository`.

6. **CAM access**
   - Endpoints:
     - `POST /api/cam/generate` – gene on-demand CAMration when model features exist.
     - `GET /api/cam/{case_id}` – returns CAM JSON and markdown.
   - CAM content is structured around **Five Cs of Credit** and uses model output, research, notes, and policy decision.

---

## 3. Frontend Workflow (React SPA)

The frontend lives in `frontend/` and is powered by **Vite + React 18**.

### 3.1 Configuration

- Backend base URL is taken from:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

If not set, it defaults to `http://127.0.0.1:8000`.

All external API keys (Landing AI, Groq, SerpAPI, NewsAPI) stay **only in `backend/.env`**.

### 3.2 Application shell

- Entry: `frontend/src/main.jsx`
  - Renders `<App />` with global styles in `styles.css`.
- Layout: `frontend/src/components/Layout.jsx`
  - Header with product name
  - Footer attribution
- Stepper: `frontend/src/components/Stepper.jsx`
  - Three steps: Data Ingestor, Research Agent, Recommendation & CAM

### 3.3 API client layer

- File: `frontend/src/api/client.js`
  - `API_BASE` derived from `VITE_API_BASE_URL`.
  - Functions:
    - `createCase(payload)` → `POST /api/case/create`
    - `uploadDocument({ endpoint, fileField, file, caseId })` → `POST /api/upload/*`
    - `runResearch(payload)` → `POST /api/research/run`
    - `upsertNotes(caseId, notes)` / `getNotes(caseId)` → `/api/notes/*`
    - `evaluateCase(caseId)` → `GET /api/evaluate/evaluate-doc`
    - `generateCam(caseId)` / `getCam(caseId)` → `/api/cam/*`
    - `askRag(caseId, query)` → `POST /api/search/ask`

The client returns the `data` envelope from the backend’s `Response` model and throws on errors, so UI code can stay clean.

---

## 4. Frontend UI Flow (mapped to pillars)

The main UI is in `frontend/src/App.jsx`. It tracks:

- `caseId`, `companyName`, `applicantName`, `sector`
- Which step is active (`activeStep` 1–3)
- Upload status per document type
- Research summary, notes, evaluation result, CAM markdown, and RAG Q&A

### Step 1 – Data Ingestor

**Goal:** Ingest multi-format data (structured and unstructured).

1. **Case creation form**
   - Fields:
     - Company Name (required)
     - Applicant / Promoter (optional)
     - Sector (optional)
   - Action:
     - Calls `createCase` (→ `/api/case/create`).
     - Stores `caseId` from the response and case `status`.

2. **Document upload grid**
   - Each tile corresponds to one upload endpoint:
     - Bank Statement, GST Filing, ITR / Tax Statement
     - Credit Report, Income Proof, Utility Bill, Identity Document
     - Annual Report, Legal Notice, Sanction Letter, Board Minutes
     - Rating Agency Report, Shareholding Pattern
   - For each upload:
     - Builds `FormData` with:
       - `metadata`: `{"caseId": "<caseId>"}`
       - `fileField`: e.g. `bank_statements` for `/bank_statement`
     - Calls `uploadDocument()` with the right endpoint and file field.
     - Shows chip status:
       - **Processed / Uploading / Error**
     - When the backend returns markdown/JSON summaries, shows them under a collapsible “View extracted summary” panel.

**Backend link:** This step feeds the ADE pipeline, KPI engines and fraud detection so that later steps have structured credit signals.

---

### Step 2 – Research Agent & Primary Insights

**Goal:** Enrich the case with secondary research and qualitative due-diligence notes.

The UI displays two side-by-side panels:

1. **Secondary Research**
   - Button: “Run Research for Case”
   - Calls `runResearch({ case_id, company_name, sector, ... })`.
   - Shows returned `research_features` payload (e.g. news hits, sentiment, litigation signals) in an expandable JSON viewer.
   - This maps directly to the problem statement’s **web-scale secondary research** requirement.

2. **Primary Insights (Officer Notes)**
   - Textarea for free-form notes, e.g. site visit findings, management interview impressions.
   - On save:
     - Builds a list of `OfficerNote` objects and calls `upsertNotes(caseId, notes)`.
     - Fetches persisted notes via `getNotes(caseId)` and keeps the latest visible in the UI.
   - These notes are later consumed on the backend side to adjust risk.

**Backend link:** The research controller and notes service feed `research_features` and `notes_features`, which are used by the model and CAM logic (either via the workflow runner or via downstream services).

---

### Step 3 – Recommendation Engine & CAM

**Goal:** Produce a transparent recommendation (approve / reject / review) and a CAM that explains the decision.

This section has three panels:

1. **Run Evaluation**
   - Button “Evaluate Case” calls `evaluateCase(caseId)` → `/api/evaluate/evaluate-doc`.
   - Displays:
     - Overall evaluation `status` (e.g. `approved`, `rejected`, `manual_review`).
     - Detailed `decision` dictionary (risk flags, reasons).
     - Score breakdown (`scores`), including aggregated KPIs, PD-like metrics, and fraud summaries.

   This surfaces a quick baseline recommendation using existing KPIs and rule engines.

2. **Generate CAM**
   - Button “Generate CAM (Markdown)” calls:
     1. `generateCam(caseId, { generateDocuments: false })`
     2. `getCam(caseId)` to retrieve JSON + markdown.
   - Displays the **CAM markdown** preview in a scrollable box.
   - The backend’s `CamService` structures the content along the Five Cs of Credit:
     - Character, Capacity, Capital, Collateral, Conditions
   - In a full run (when underlying features exist), it also produces Word/PDF documents on the backend (paths included in CAM result).

3. **Explainability Chat (RAG)**
   - Textarea: user enters a question, e.g.:
     - “Why did we reject despite strong GST flows?”
   - Button: calls `askRag(caseId, query)` → `/api/search/ask`.
   - Displays the response, which is backed by:
     - RAG index built over extracted documents and CAM summaries.
     - LLM (Groq or Bedrock) configured on the backend.
   - This directly addresses the **Explainability** evaluation criterion by letting the AI “walk the judge through” its logic in natural language.

**Backend link:** Evaluation uses `evaluator_service`, CAM uses `cam_service`, and RAG uses the `rag_service` FAISS index + Groq LLM. All of these rely on the earlier uploads, research outputs, and notes.

---

## 5. Running the System (Developer POV)

### 5.1 Start the backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # on Windows
pip install --upgrade pip
pip install -r requirements.txt

uvicorn src.controller.main_controller:app --host 0.0.0.0 --port 8000 --reload
```

Make sure `backend/.env` is populated with:

- `VISION_AGENT_API_KEY`
- `GROQ_API_KEY`
- `SERPAPI_API_KEY`, `NEWSAPI_API_KEY` (optional but recommended)

### 5.2 Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Optionally create `frontend/.env`:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Then open `http://localhost:5173` in your browser.

---

## 6. How This Aligns With the Intelli-Credit Problem Statement

- **Data Ingestor (Multi-Format)**
  - Upload flows cover: GST filings, ITRs, bank statements, credit reports, annual reports, legal notices, sanction letters, board minutes, rating reports, shareholding patterns, identity docs, utility bills.
  - Backend ADE + KPIs provide the cross-leverage between GST and bank statements for circular trading / revenue inflation detection.

- **Research Agent (Digital Credit Manager)**
  - Research controller integrates external news / litigation / sector risk via SerpAPI + NewsAPI.
  - Primary insights UI and notes service ensure human due diligence feeds into the risk picture.

- **Recommendation Engine + CAM**
  - Trained PD ensemble and LGD/EAD artifacts provide ML-based expected loss.
  - Policy decision engine converts that into approve / reject / manual review with thresholds.
  - CAM generator explains Five Cs and reasons for the recommendation.
  - RAG chat gives deep case-by-case explainability across all ingested evidence.

Together, this pipeline turns the backend you already have into a **clean, sleek, and hackathon-ready Intelli-Credit workbench** with a modern frontend and a clear story for judges about **data ingestion, research depth, explainability, and India-specific credit context**.

