const API_BASE =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  'http://127.0.0.1:8000';

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  const data = await res.json();
  if (data.status && data.status !== 200) {
    throw new Error(data.errors || data.message || 'API error');
  }
  return data.data;
}

export async function createCase(payload) {
  const res = await fetch(`${API_BASE}/api/case/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function uploadDocument({ endpoint, fileField, file, caseId }) {
  const form = new FormData();
  const metadata = JSON.stringify({ caseId });
  form.append('metadata', metadata);
  form.append(fileField, file);

  const res = await fetch(`${API_BASE}/api/upload/${endpoint}`, {
    method: 'POST',
    body: form,
  });
  return handleResponse(res);
}

export async function runResearch(payload) {
  const res = await fetch(`${API_BASE}/api/research/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function upsertNotes(caseId, notes) {
  const res = await fetch(`${API_BASE}/api/notes/upsert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ case_id: caseId, notes }),
  });
  return handleResponse(res);
}

export async function getNotes(caseId) {
  const res = await fetch(`${API_BASE}/api/notes/${encodeURIComponent(caseId)}`);
  return handleResponse(res);
}

export async function evaluateCase(caseId) {
  const url = `${API_BASE}/api/evaluate/evaluate-doc?uuid=${encodeURIComponent(
    caseId,
  )}`;
  const res = await fetch(url);
  return handleResponse(res);
}

export async function generateCam(caseId, { generateDocuments = false } = {}) {
  const res = await fetch(`${API_BASE}/api/cam/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      case_id: caseId,
      regenerate: true,
      generate_documents: generateDocuments,
    }),
  });
  return handleResponse(res);
}

export async function getCam(caseId) {
  const res = await fetch(`${API_BASE}/api/cam/${encodeURIComponent(caseId)}`);
  return handleResponse(res);
}

export async function askRag(caseId, query) {
  const res = await fetch(`${API_BASE}/api/search/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ case_id: caseId, query }),
  });
  return handleResponse(res);
}

export async function runCaseWorkflow(caseId, payload = {}) {
  const res = await fetch(
    `${API_BASE}/api/case/${encodeURIComponent(caseId)}/run`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, case_id: caseId }),
    },
  );
  return handleResponse(res);
}

export async function getJob(jobId) {
  const res = await fetch(
    `${API_BASE}/api/case/job/${encodeURIComponent(jobId)}`,
  );
  return handleResponse(res);
}

export { API_BASE };

