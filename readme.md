# LoanLens AI - Project Documentation

## Backend Workflow - Step-by-Step

### Phase 1: Case Initialization
```
1. CREATE CASE
   └─ User submits: company_name, applicant_name, sector
   └─ Backend creates case_id, stores metadata in CaseRepository
   └─ Case status: "pending_documents"
```

### Phase 2: Document Upload & Extraction
```
2. DOCUMENT INGESTION
   └─ User uploads documents (bank statements, tax returns, passport, etc.)
   └─ Files stored in `uploads/{case_id}/` folder structure
   └─ Each document type goes into its category folder
      ├─ bank-statements/
      ├─ salary-documents/
      ├─ identity-documents/
      ├─ credit-reports/
      └─ tax-documents/

3. LANDING AI ADE EXTRACTION (Agentic Data Extraction)
   └─ Triggered for each document category
   └─ Extracts structured data:
      ├─ Bank statements → Transactions, balances, account info
      ├─ Payslips → Salary, deductions, employer info
      ├─ Tax Returns (1040) → Income, deductions, tax liability
      ├─ Credit Reports → Credit score, payment history
      ├─ Identity Documents → Name, DOB, address (fraud detection via images)
      └─ Utility Bills → Address verification
   └─ Output: JSON files with extracted KPIs
```

### Phase 3: KPI Calculation (Loan Core)
```
4. LOAN METRICS EVALUATION
   └─ For each document, calculate Key Performance Indicators:
   
   Bank Statement KPI:
      ├─ Average monthly balance
      ├─ Transaction count & patterns
      ├─ Inflow/outflow ratios
      └─ Account stability score
   
   Salary KPI:
      ├─ Net monthly income
      ├─ Income stability
      ├─ YoY growth
      └─ Deduction analysis
   
   Tax Statement KPI:
      ├─ Total income
      ├─ Tax liability
      ├─ Filing status
      └─ Income consistency
   
   Credit Report KPI:
      ├─ Credit score
      ├─ Default probability
      ├─ Payment history
      ├─ Debt-to-income ratio
      └─ Credit utilization
   
   Identity Verification KPI:
      ├─ Name match across documents
      ├─ Address consistency
      └─ Document validity checks

5. AGGREGATE LOAN METRICS
   └─ Combine all KPIs with weighted scoring
   └─ Output: final_score (0-100), loan_metrics object
```

### Phase 4: Fraud Detection
```
6. TEXT-BASED FRAUD DETECTION
   └─ FraudDetectionEngine analyzes:
      ├─ Income inconsistencies across documents
      ├─ Amount discrepancies (bank vs. declared)
      ├─ Date mismatches
      ├─ Duplicate account detection
      └─ Suspicious patterns (spikes, anomalies)
   └─ Output: fraud_score, risk_flags, fraud_text_summary

7. IMAGE-BASED FRAUD DETECTION (Identity Documents)
   └─ ImageFraudEngine analyzes document images:
      ├─ Deepfake detection
      ├─ Document tampering
      ├─ Signature forgery
      ├─ OCR mismatch detection
      └─ Quality assessment
   └─ Output: image_fraud_summary, confidence scores
```

### Phase 5: Feature Engineering & Merging
```
8. BUILD FEATURE VECTORS
   └─ ModelFeatureBuilder creates stable feature vectors for ML models
   └─ Aggregates all extracted KPIs into single feature bundle:
      ├─ Income features (salary, tax income, bank deposits)
      ├─ Debt features (credit utilization, liabilities)
      ├─ Account stability features
      ├─ Risk flags (fraud scores, inconsistencies)
      └─ Behavioral features (transaction patterns)

9. MERGE FEATURES
   └─ Combine:
      ├─ Document-level KPIs
      ├─ Cross-document features
      ├─ Fraud indicators
      └─ Default fallback values for missing data
   └─ Normalize & validate feature vector
```

### Phase 6: Credit Risk Scoring (ML Models)
```
10. SCORE CASE (Model Stack)
    └─ RecommendationModelService runs multiple models:
    
    Model Stack Ensemble:
    ├─ XGBoost PD Model (Primary)
    ├─ LightGBM PD Model (Backup)
    ├─ CatBoost PD Model (Fallback)
    ├─ Logistic WoE Challenger Model (Validation)
    └─ Legacy Credit Risk Artifacts (PD/LGD/EAD .sav models)
    
    Probability of Default (PD):
       └─ Estimates: likelihood borrower won't repay
       └─ Range: 0-1 (0% to 100%)
    
    Loss Given Default (LGD):
       └─ Estimates: % loss if default occurs
       └─ Loaded from lgd_model_stage_1.sav + lgd_model_stage_2.sav
    
    Exposure at Default (EAD):
       └─ Estimates: amount at risk
       └─ Loaded from reg_ead.sav regression model
    
    Calculate Expected Loss:
       └─ Expected Loss = PD × LGD × EAD
       └─ Represents portfolio risk
```

### Phase 7: Policy Decision
```
11. POLICY DECISION ENGINE
    └─ Evaluates risk thresholds:
    
    Decision Rules:
    ├─ If Expected Loss ≥ 22% → REJECTED (auto-decline)
    ├─ If Expected Loss 18-22% → MANUAL_REVIEW (escalation)
    ├─ If Expected Loss < 10% + no fraud → APPROVED (auto-approval)
    └─ Else → CONDITIONAL_APPROVAL (needs verification)
    
    Decision Factors:
    ├─ PD estimate
    ├─ LGD estimate
    ├─ EAD factor
    ├─ Fraud indicators
    ├─ Income stability
    ├─ Credit history
    └─ Debt ratios
    
    Output:
    ├─ decision (APPROVED/REJECTED/MANUAL_REVIEW)
    ├─ risk_factors (detailed reasoning)
    ├─ decision_confidence (0-1)
    └─ status
```

### Phase 8: Explainability & CAM Generation
```
12. GENERATE EXPLAINABILITY
    └─ SHAP/TreeExplainer computes feature importance
    └─ Shows which features drove the decision
    └─ Example output:
       ├─ "Credit score reduced risk by -15%"
       ├─ "Income instability increased risk by +8%"
       └─ "Fraud flags increased risk by +20%"

13. CAM (Credit Assessment Memo)
    └─ Generates human-readable credit analysis
    └─ CamService produces:
       ├─ Executive summary
       ├─ Risk assessment narrative
       ├─ Key findings
       ├─ Regulatory compliance notes
       └─ Recommendation document
```

### Phase 9: Pricing Recommendation
```
14. PRICING ENGINE
    └─ PricingService recommends loan terms based on:
       ├─ Risk profile (PD/LGD/EAD)
       ├─ Market conditions
       ├─ Customer segment
       ├─ Competitive positioning
       └─ Regulatory constraints
    
    Output:
    ├─ Interest rate recommendation
    ├─ Loan term options
    ├─ Collateral requirements
    └─ Covenant suggestions
```

### Phase 10: Output & Storage
```
15. SAVE RESULTS
    └─ Decision Repository stores:
       ├─ policy_decision (acceptance/rejection)
       ├─ model_output (PD/LGD/EAD/expected_loss)
       ├─ explainability (feature importance)
       ├─ pricing recommendation
       └─ workflow_snapshot (audit trail)
    
    └─ Case Repository updates:
       ├─ Case status → "completed"
       ├─ Features bundle
       ├─ Job status
       └─ Timestamps

16. API RESPONSE TO FRONTEND
    └─ Returns complete analysis:
       {
         "decision": "APPROVED",
         "status": "completed",
         "model_output": {
           "pd_estimate": 0.15,
           "lgd_estimate": 0.45,
           "ead_factor": 0.80,
           "expected_loss": 0.054
         },
         "risk_factors": [...],
         "explainability": {...},
         "pricing": {...},
         "cam": {...}
       }
```

### Flow Diagram
```
Case Creation
      ↓
Document Upload
      ↓
ADE Extraction (LandingAI)
      ↓
KPI Calculation (Loan Core)
      ↓
Fraud Detection (Text + Image)
      ↓
Feature Engineering
      ↓
Model Scoring (PD/LGD/EAD)
      ↓
Policy Decision Engine
      ↓
Explainability + CAM
      ↓
Pricing Recommendation
      ↓
Store Results & Return to Frontend
```

---

## 🛠️ Technologies & Stack

### Backend Stack
| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | FastAPI | Latest |
| **Server** | Uvicorn | - |
| **Language** | Python | 3.10+ |
| **Data Processing** | Pandas, NumPy, PyArrow | - |
| **Document Processing** | PyMuPDF, OpenCV | - |

### ML/AI Models
| Model | Type | Purpose | File |
|-------|------|---------|------|
| **XGBoost** | Gradient Boosting Classifier | Primary PD estimation | Loaded at runtime |
| **LightGBM** | Gradient Boosting Classifier | Backup PD estimation | Loaded at runtime |
| **CatBoost** | Gradient Boosting Classifier | Fallback PD estimation | Loaded at runtime |
| **Logistic Regression** | WoE-based Scorecard | Validation/challenger model | - |
| **Scikit-learn** | Various ML algos | Feature engineering, ensemble | - |

### Pre-trained Credit Risk Models (.sav files)
```
model_artifacts/credit_risk/
├── pd_model.sav (132 KB) - Probability of Default
├── pd_model_deployment.sav (132 KB) - Production PD model
├── lgd_model_stage_1.sav (135 KB) - Loss Given Default (Stage 1)
├── lgd_model_stage_2.sav (12.74 MB) - Loss Given Default (Stage 2)
└── reg_ead.sav (12.66 MB) - Exposure at Default regression
```

### Probability of Default (PD) Models (.pkl files)
```
model_artifacts/pd/
├── mock_from_env/
│   ├── model.pkl (929 KB) - Trained PD model
│   ├── calibrator.pkl - Probability calibration
│   ├── metrics.json - Model performance metrics
│   ├── feature_schema.json - Feature definitions
│   └── drift_report.json - Data drift detection
└── 20260301_152938/ (alternative version)
```

### Explainability & Feature Importance
- **SHAP** - TreeExplainer for feature importance visualization
- **Top 5 SHAP drivers** - Feature impact on predictions

### Embeddings & RAG
- **HuggingFace Embeddings** - Document embeddings
- **FAISS** - Vector similarity search (Langchain wrapper)
- **FAISS Index** - Stored in `backend/src/service/rag_service/faiss_index/`

### Document Extraction
- **Landing AI ADE (Agentic Data Extraction)** - Intelligent document parsing

### Frontend Stack
| Component | Technology |
|-----------|-----------|
| **Framework** | React 19.1.1 |
| **Build Tool** | Vite |
| **Routing** | React Router DOM v7 |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Markdown Rendering** | React Markdown |
| **Math Rendering** | KaTeX |

---

## 🔑 API Keys & External Services

### Primary LLM Providers

| Service | API Key | Model | Purpose |
|---------|---------|-------|---------|
| **Groq** (Primary) | `GROQ_API_KEY` | llama-3.3-70b-versatile | Main LLM for RAG chatbot & analysis |
| **Groq** | `GROQ_API_KEY` | llama-3.1-8b-instant | Lightweight model for simple tasks |
| **AWS Bedrock** (Alternative) | AWS credentials | - | Fallback LLM provider (optional) |

### Document Extraction
| Service | Key | Purpose |
|---------|-----|---------|
| **Landing AI** | `VISION_AGENT_API_KEY` | ADE/AOD document parsing & fraud detection |

### Research & Intelligence APIs
| Service | Key | Purpose | Config |
|---------|-----|---------|--------|
| **SerpAPI** | `SERPAPI_API_KEY` | Web search for company/sector research | `RESEARCH_MAX_QUERIES=4` |
| **NewsAPI** | `NEWSAPI_API_KEY` | News sentiment & risk signals | `RESEARCH_RESULTS_PER_QUERY=10` |

### Environment Variables
```env
# Core
VISION_AGENT_API_KEY="<landing_ai_key>"
LLM_PROVIDER="groq"  # or "bedrock"
GROQ_API_KEY="<groq_api_key>"
LLM_MODEL="llama-3.3-70b-versatile"
LLM_SMALL_MODEL="llama-3.1-8b-instant"

# Research
SERPAPI_API_KEY="<serpapi_key>"
NEWSAPI_API_KEY="<newsapi_key>"
RESEARCH_MAX_QUERIES="4"
RESEARCH_RESULTS_PER_QUERY="10"
RESEARCH_HTTP_TIMEOUT_SEC="18"

# Model Configuration
PD_MODEL_MODE="synthetic|shadow|real" (default: synthetic)
PD_SHADOW_ENABLED="true"
PD_ACTIVE_VERSION=""
PD_MODEL_DIR=""
PD_TRAIN_DATA_PATH=""
PD_OOT_DAYS="0"

# AWS (Optional)
# AWS_ACCESS_KEY="<key>"
# AWS_SECRET_KEY="<secret>"
# AWS_REGION="us-east-1"
```

---

## 💾 Data Storage

| Type | Location | Format |
|------|----------|--------|
| **Case Metadata** | `resources/cases/{case_id}/` | JSON |
| **Document Uploads** | `resources/uploads/{case_id}/` | Original files |
| **Extracted KPIs** | `resources/cases/{case_id}/kpi_results.json` | JSON |
| **Decisions & Scores** | `resources/cases/{case_id}/decision.json` | JSON |
| **Feature Vectors** | `resources/cases/{case_id}/features.json` | JSON |
| **RAG Index** | `backend/src/service/rag_service/faiss_index/` | FAISS binary |
| **Mock Training Data** | `data/mock_training/` | CSV/Parquet |

**⚠️ Note**: All data stored **locally in file system** (no database). Scale considerations needed for production.

---

## ⚠️ Important Notes & Limitations

### Critical Things to Know

1. **No Database Backend**
   - Uses JSON file-based storage in `resources/` folder
   - Not suitable for high-concurrency production
   - Consider migrating to PostgreSQL/MongoDB for scale

2. **API Key Security**
   - **.env file contains exposed keys** ⚠️
   - These are test/mock keys - rotate before production
   - Never commit `.env` to git (should be in `.gitignore`)

3. **Landing AI ADE (Vision Agent API)**
   - Requires active API connection for document extraction
   - Supports: Bank statements, Tax returns, Credit reports, ID verification
   - Includes built-in fraud detection for documents

4. **LLM Models**
   - **Groq**: Free tier has rate limits (~30 req/min)
   - **Fallback to Bedrock**: If Groq fails, uses AWS Bedrock
   - Both support streaming and structured outputs

5. **PD Model Modes**
   - **synthetic**: Uses mock training data (current default)
   - **shadow**: Runs both synthetic & real models in parallel for validation
   - **real**: Uses production real-label data (requires `PD_TRAIN_DATA_PATH`)

6. **Model Training**
   - PD models can be retrained via `/train-pd` endpoint
   - Requires training data in CSV/Parquet format
   - Out-of-time (OOT) testing supported via `PD_OOT_DAYS`

7. **FAISS Vector Store**
   - Pickled index stored locally
   - Not distributed/replicated - single point of failure
   - Consider Redis/Milvus for production

8. **Research APIs**
   - SerpAPI & NewsAPI are rate-limited
   - Timeout set to 18 seconds (`RESEARCH_HTTP_TIMEOUT_SEC`)
   - Max 4 research queries per case

9. **Image Fraud Detection**
   - Uses OpenCV + custom deepfake detection algorithms
   - Analyzes identity documents for tampering/forgery
   - Output: confidence scores + fraud flags

10. **Frontend Constraints**
    - Requires backend at `localhost:8000` (hardcoded in some places)
    - No authentication/authorization implemented
    - Suitable for demo/POC only

### Scaling Considerations
- ✅ Single-instance deployment works fine
- ⚠️ Multi-instance needs shared file storage (NFS/S3)
- ❌ Concurrent uploads to same case can cause conflicts
- 💡 Consider: Celery/Airflow for async job management

---

## 📊 Model Performance Metrics

Pre-trained models include performance metrics:
```json
model_artifacts/pd/mock_from_env/metrics.json
├── accuracy
├── precision
├── recall
├── f1_score
├── auc_roc
└── calibration_curves
```

---

## 🔗 Key Dependencies Summary

### Core Framework & Web
- **fastapi** - Modern async web framework
- **uvicorn** - ASGI server
- **python-multipart** - Multipart file upload handling

### Data Processing & ML
- **pandas** - Data manipulation and analysis
- **numpy** - Numerical computing
- **pyarrow** - Apache Arrow for columnar data
- **scikit-learn** - ML utilities (GradientBoostingClassifier, LogisticRegression)
- **xgboost** - Gradient boosting for PD estimation
- **lightgbm** - Lightweight gradient boosting
- **catboost** - Categorical gradient boosting (optional)
- **shap** - Model explainability (SHAP values)
- **mlflow** - Model tracking and versioning
- **pyspark** - Distributed computing
- **delta-spark** - Delta Lake integration

### Document & Image Processing
- **pymupdf** / **PyMuPDF** - PDF extraction
- **pillow** - Image processing
- **opencv-python** - Computer vision (fraud detection, image analysis)
- **matplotlib** - Visualization
- **beautifulsoup4** - HTML/XML parsing
- **python-docx** - Word document generation
- **reportlab** - PDF generation

### LLM & RAG
- **langchain-groq** - Groq LLM integration
- **langchain-aws** - AWS Bedrock integration
- **langchain-community** - Community integrations
- **langchain-huggingface** - HuggingFace embeddings
- **langchain-text-splitters** - Document chunking
- **sentence-transformers** - Pre-trained embedding models
- **transformers** - Hugging Face transformers

### AI/ML Extraction
- **landingai-ade** - Landing AI Agentic Data Extraction API

### Vector Search & Embeddings
- **faiss-cpu** - Facebook AI Similarity Search (local version)
- **langchain** (core) - Vector store abstractions

### Configuration & Environment
- **python-dotenv** - Environment variable management
- **pydantic** - Data validation

### HTTP & API
- **requests** - HTTP library
- **httpx** - Async HTTP client (implicit via langchain)

### Type Hints
- **typing** - Type hints
- **typing-extensions** - Extended type hints for older Python

---

## 📝 Key Files & Entry Points

| File | Purpose |
|------|---------|
| `backend/src/controller/main_controller.py` | FastAPI app entry point |
| `backend/src/service/evaluator_service/workflow_runner.py` | Credit workflow orchestration |
| `backend/src/service/model_service/service.py` | ML model scoring & decision logic |
| `backend/src/service/loan_core/decision.py` | Credit decision rules |
| `backend/src/service/loan_core/fraud_engine.py` | Text-based fraud detection |
| `backend/src/service/loan_core/image_fraud_engine.py` | Image-based fraud detection |
| `backend/src/service/rag_service/` | RAG chatbot implementation |
| `frontend/src/pages/LandingPage.jsx` | Main dashboard UI |
| `model_artifacts/credit_risk/` | Pre-trained risk models |
| `model_artifacts/pd/` | Probability of Default models |

---

## 🚀 Quick Start

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.controller.main_controller:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

**Last Updated**: March 2026
