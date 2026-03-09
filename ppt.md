## Slide 1 – Problem Statement & Context

- **Title**: LoanLens AI – Intelligent Credit Underwriting & Fraud Detection
- **Problem**: Manual underwriting is slow, inconsistent, and vulnerable to fraud.
  - 52% of processing time is spent manually collecting/verifying documents.
  - 5% of applications contain discrepancies or altered documents.
  - Up to 30% of creditworthy applicants are rejected due to poor data interpretation.
  - Lenders struggle with affordability assessment, fraud, and regulatory auditability.
- **Need**: A scalable, AI-first system that can read messy financial documents, detect fraud, and produce explainable lending decisions in minutes.
- **Visual (for later)**: High-level illustration showing a loan officer buried under paper documents on the left, and an AI-powered dashboard with instant decisions on the right (before vs after).

---

## Slide 2 – Solution Overview

- **Title**: LoanLens AI – Your Virtual Underwriter
- **One-liner**: An AI-powered underwriting assistant that turns raw financial documents into fraud-aware, explainable credit decisions in minutes.
- **Core idea**:
  - Use **Landing AI ADE/AOD** to extract structured data and visual overlays from PDFs/images.
  - Run **ML-based credit risk models** (PD/LGD/EAD) plus a **policy decision engine**.
  - Add **RAG-based explainability and research** so officers can ask “why?” in plain English.
  - Generate a **Credit Appraisal Memo (CAM)** that mirrors how real banks write memos.
- **Outcomes**:
  - Faster approvals, better fraud detection, consistent decisions, full audit trail.
- **Visual (for later)**: Simple hero diagram: “Documents → LoanLens AI → Decision + CAM + Chatbot”, with icons for documents, AI engine, and outputs.

---

## Slide 3 – End-to-End Functionality (User Journey)

- **Title**: From Documents to Decisions – User Journey
- **User**: Credit officer / underwriter.
- **Flow**:
  1. Create a case with basic borrower metadata (company, applicant, sector).
  2. Upload multi-format documents (bank statements, tax returns, credit reports, IDs, etc.).
  3. System parses docs via ADE/AOD and computes KPIs + fraud indicators.
  4. Run evaluation to get PD/LGD/EAD, expected loss, and a baseline recommendation.
  5. Generate CAM to obtain a narrative memo structured along Five Cs of Credit.
  6. Ask follow-up questions via RAG chat (“Why rejected?”, “What if income improves?”).
- **Visual (for later)**: Horizontal storyboard with 5–6 panels showing each step: “Create Case → Upload Docs → AI Analysis → Decision Dashboard → CAM → Explainability Chat”.

---

## Slide 4 – Key Features (At a Glance)

- **Title**: Key Features
- **Feature pillars**:
  - **Automated Document Ingestion**: Bank statements, income proofs, IDs, tax statements, credit reports, utility bills.
  - **Intelligent Extraction with Landing AI**: ADE/AOD gives structured JSON, bounding boxes, and unstructured text in one shot.
  - **Credit Risk & KPI Engine**: Computes DTI, income stability, account liquidity, address stability, credit profile, circular trading risk, etc.
  - **Fraud Detection (Text + Image)**: Flags name inconsistencies, salary mismatches, document tampering, passport layout anomalies.
  - **Decisioning & Pricing**: PD/LGD/EAD ensemble models plus policy rules, expected loss, and pricing recommendations.
  - **Explainability & RAG Chat**: SHAP-based feature importance, CAM, and question-answering over case data.
- **Visual (for later)**: 3×2 feature grid; each tile with an icon and 1‑line caption for the above pillars.

---

## Slide 5 – Technical Architecture (High-Level)

- **Title**: System Architecture – Frontend, Backend, and External AI
- **Components**:
  - **Frontend (React + Vite)**:
    - Three-step SPA: Data Ingestor, Research Agent, Recommendation & CAM.
    - Talks only to FastAPI backend via a typed API client.
  - **Backend (FastAPI + Python services)**:
    - Controllers for upload, evaluate, case, research, notes, CAM, search/RAG, model management.
    - Services for document extraction, loan core (KPI, decision, fraud), ML scoring, RAG, research, pricing, CAM.
  - **External AI / Infra**:
    - Landing AI ADE/AOD for document parsing and vision fraud checks.
    - Groq / AWS Bedrock for LLMs and RAG.
    - SerpAPI + NewsAPI for secondary research.
  - **Storage**:
    - File-system-based repositories under `resources/{case_id}` for uploads, KPIs, decisions, CAM, and FAISS index.
- **Visual (for later)**: Block diagram: React SPA → FastAPI → (Doc Extractor, Loan Core, RAG Service, Research Agent, Model Service) → External services (Landing AI, Groq/Bedrock, SerpAPI/NewsAPI) + local storage.

---

## Slide 6 – Detailed Backend Workflow

- **Title**: Backend Workflow – From Upload to Policy Decision
- **Phases** (condensed):
  1. **Case Initialization** – Create case, assign `case_id`, status `pending_documents`.
  2. **Document Ingestion** – Persist files into structured folders per document type.
  3. **ADE Extraction** – Landing AI ADE processes each file → KPIs JSON + overlays.
  4. **KPI & Metrics** – Compute income, liquidity, DTI, credit utilization, delinquency, stability KPIs.
  5. **Fraud Detection** – Text engine (inconsistencies) + image engine (passport layout, tampering).
  6. **Feature Engineering** – Merge KPIs, fraud flags, research and notes into a feature vector.
  7. **Risk Scoring** – PD/LGD/EAD models produce expected loss and risk profile.
  8. **Policy Engine** – Thresholds on expected loss and fraud → Approve / Reject / Manual Review.
  9. **Explainability & Pricing** – SHAP analysis and pricing service recommend terms.
  10. **Persistence & API Response** – Save snapshots and return structured JSON to the frontend.
- **Visual (for later)**: Vertical flow diagram or swimlane showing numbered steps with arrows; highlight where ADE, ML models, and rules engine plug in.

---

## Slide 7 – CAM Generation & Explainability

- **Title**: Credit Appraisal Memo (CAM) & Explainability
- **CAM**:
  - Generated via `CamService` using model outputs, KPIs, research, notes, and policy decision.
  - Structured along **Five Cs of Credit**: Character, Capacity, Capital, Collateral, Conditions.
  - Available as markdown (and optionally Word/PDF) for easy sharing or submission.
- **Explainability**:
  - Uses SHAP/TreeExplainer to quantify which features pushed risk up or down.
  - RAG chat layer lets officers ask “why was this rejected?” and see answers grounded in documents and CAM.
- **Visual (for later)**:
  - Mockup of a CAM markdown view with sections for Five Cs and key metrics.
  - Side-by-side view: CAM on the left, Q&A chat on the right with highlighted citations.

---

## Slide 8 – Frontend Experience & Wireframes

- **Title**: Frontend – Three-Step Underwriting Console
- **Steps**:
  - **Step 1 – Data Ingestor**:
    - Case creation form (company, applicant, sector).
    - Upload grid for multiple document types with status chips (Uploading / Processed / Error) and expandable summaries.
  - **Step 2 – Research & Notes**:
    - “Run Research for Case” button; shows research features JSON.
    - Text area for officer notes, persisted and retrievable.
  - **Step 3 – Recommendation & CAM**:
    - “Evaluate Case” → shows decision, scores, and detailed JSON breakdowns.
    - “Generate CAM (Markdown)” → shows CAM preview.
    - “Explainability Chat (RAG)” → Q&A panel.
- **Visual (for later)**:
  - Three wireframes (one per step) with clear sections: header with case info, main panel for actions, right-side panel for results/logs.

---

## Slide 9 – Tools, Models & Methods Used

- **Title**: Tools, Models & Methods
- **Core technologies**:
  - **Backend**: FastAPI, Python 3.10+, Pandas, NumPy, PyMuPDF, OpenCV, `landingai-ade`.
  - **ML / Credit Risk**: scikit-learn, XGBoost, LightGBM, CatBoost (optional), SHAP, MLflow.
  - **RAG & LLMs**: LangChain, sentence-transformers, FAISS, Groq (Llama 3.3 / 3.1) or AWS Bedrock.
  - **Frontend**: React + Vite, modern component-based SPA.
- **Design methods**:
  - Multi-agent, modular service architecture (document extraction, loan core, RAG, research, CAM, pricing).
  - Explainable AI via SHAP and CAM narrative.
  - Production-ready model lifecycle with registries, metrics, and promotion gates.
- **Visual (for later)**: Tech stack diagram / layered pyramid: Infrastructure → Data/ML → Services → Frontend UX.

---

## Slide 10 – Real-World Relevance & Scalability

- **Title**: Real-World Applicability & Scaling Path
- **Use cases**:
  - Retail and SME loan underwriting for banks/NBFCs.
  - Digital-only lenders and fintechs automating KYC + risk.
  - Portfolio risk teams running “what-if” and re-underwriting existing books.
- **Scalability story**:
  - **Today**: File-system based storage, single-instance API – perfect for PoC / hackathon.
  - **Tomorrow**:
    - Swap local storage for object store + database (S3 + Postgres/MongoDB).
    - Containerize and deploy behind load balancers.
    - Replace local FAISS with distributed vector DB (e.g., Redis/Milvus).
    - Integrate with LOS/LMS via REST APIs and webhooks.
- **Regulatory & audit angle**:
  - Full decision trails (JSON + markdown CAM + overlays).
  - Easy to expose to auditors and compliance teams.
- **Visual (for later)**: Two-tier diagram: “Current PoC Deployment” vs “Target Production Architecture” with extra boxes for DB, message queues, and vector DB.

---

## Slide 11 – Differentiators vs Existing Solutions

- **Title**: Why LoanLens AI is Different
- **Key differentiators**:
  - **End-to-end**, not just document OCR – goes from ingestion to PD/LGD/EAD and policy decisions.
  - **Vision+Text Fraud Detection** – geometric passport analysis plus text consistency checks.
  - **RAG-first Explainability** – conversational UI grounded in actual case documents.
  - **Credit-native Models** – PD ensemble, LGD/EAD artifacts, and pricing logic aligned with real underwriting practice.
  - **Hackathon-friendly Implementation** – Local-only storage, minimal setup, and ready-made scripts & docs.
- **Visual (for later)**: Comparison table vs 2–3 well-known competitors with checkmarks highlighting features unique to LoanLens AI.

---

## Slide 12 – Demo Flow (For Pitch)

- **Title**: Live Demo Script (3–5 Minutes)
- **Suggested sequence**:
  1. **Open frontend**: Show three-step UI and briefly mention technologies (React + Vite).
  2. **Create case & upload docs**: Emphasize multi-format support and status chips.
  3. **Run evaluation**: Show decision status, PD/LGD/EAD style metrics, and KPI breakdown.
  4. **Generate CAM**: Scroll through the Five Cs narrative; highlight explainability.
  5. **Ask a question in RAG chat**: e.g., “Why is this case flagged for manual review?” and show grounded answer.
  6. **Close on metrics**: Quote time savings, fraud detection uplift, and scalability path.
- **Visual (for later)**: Simple numbered timeline / storyboard showing each demo step with a small thumbnail of the corresponding screen.

---

## Slide 13 – Closing & Call to Action

- **Title**: Impact, Next Steps & Vision
- **Impact recap**:
  - Reduce underwriting time from days to minutes.
  - Improve fraud detection and reduce default risk using PD/LGD/EAD models.
  - Give lenders a transparent, explainable AI copilot instead of a black box.
- **Next steps**:
  - Plug into a real LOS/LMS and live API keys for Landing AI and LLMs.
  - Move storage and RAG index to cloud-native components.
  - Expand to more document types and regional regulatory templates.
- **Closing line**: “LoanLens AI transforms fragmented, manual underwriting into an AI-native, explainable credit engine that lenders can trust and scale.”
- **Visual (for later)**: Clean closing slide with logo, tagline, and contact/QR (GitHub repo, demo link).

