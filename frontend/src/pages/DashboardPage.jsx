import React, { useRef, useState } from "react";

const ACCEPTED = ".pdf,.txt";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

function FileDropZone({ file, onFile }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const pick = (f) => {
    if (!f) return;
    if (f.size > MAX_BYTES) { alert("File exceeds 5 MB limit."); return; }
    onFile(f);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files[0]); }}
      className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
        dragging
          ? "border-slate-400 bg-slate-50"
          : file
          ? "border-[color:var(--mint)] bg-white"
          : "border-slate-300 bg-white hover:border-slate-400"
      }`}
    >
      {file ? (
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-800">{file.name}</p>
          <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB · click to replace</p>
        </div>
      ) : (
        <div className="space-y-1">
          <p className="text-sm text-slate-500">Drop your resume here or <span className="font-medium text-slate-700">click to browse</span></p>
          <p className="text-xs text-slate-400">PDF or TXT · max 5 MB</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => pick(e.target.files[0])}
      />
    </div>
  );
}

export default function DashboardPage({ email, apiFetch, onLogout }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [jobUrl, setJobUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null); // { type: "success"|"error", text }
  const [latest, setLatest] = useState(null);

  const setMsg = (type, text) => setStatus({ type, text });

  const handleUpload = async () => {
    if (!resumeFile) { setMsg("error", "Select a resume file first."); return; }
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", resumeFile);
      const data = await apiFetch("/resume/upload", { method: "POST", body: form });
      setMsg("success", `Resume saved (${data.resume_id.slice(0, 8)}…)`);
      setResumeUploaded(true);
    } catch (err) {
      setMsg("error", `Upload failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const handleAnalyse = async () => {
    if (!jobUrl) { setMsg("error", "Enter a job URL first."); return; }
    setBusy(true);
    setStatus(null);
    try {
      const data = await apiFetch("/jobs/analyse", {
        method: "POST",
        body: JSON.stringify({ url: jobUrl }),
        timeoutMs: 120000,
      });
      setLatest(data.result);
      setMsg("success", `Analysis complete · run ${data.job_run_id.slice(0, 8)}…`);
    } catch (err) {
      setMsg("error", `Analyse failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const subject = latest?.outreach_email?.subject ?? "Your outreach subject will appear here.";
  const body = latest?.outreach_email?.body ?? "Your personalised cold email body will appear here after analysis.";
  const fitScore = latest?.fit_result?.fit_score ?? "—";
  const topSkill = latest?.fit_result?.matched_skills?.[0] ?? "—";
  const gapAnalysis = latest?.fit_result?.gap_analysis ?? null;

  return (
    <div className="min-h-screen scouter-bg">
      {/* Nav */}
      <nav className="border-b border-slate-200/60 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <p className="text-sm font-semibold tracking-[0.2em] text-slate-700 uppercase">Scouter</p>
          <div className="flex items-center gap-4">
            <p className="hidden text-sm text-slate-500 sm:block">{email}</p>
            <button
              onClick={onLogout}
              className="rounded-lg border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 reveal">
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            Job intelligence, ready to send.
          </h1>
          <p className="mt-2 text-slate-500">
            Upload your resume once, drop a job URL, and get a grounded outreach email in under 2 minutes.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left panel */}
          <div className="space-y-6 reveal">
            {/* Resume upload */}
            <div className="float-card rounded-3xl bg-white/90 p-7 backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-900">Resume</h2>
              <p className="mt-1 text-sm text-slate-500">Upload once — reused across all analyses.</p>
              <div className="mt-4">
                <FileDropZone file={resumeFile} onFile={setResumeFile} />
              </div>
              <button
                disabled={busy || !resumeFile}
                onClick={handleUpload}
                className="mt-4 w-full rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 transition-opacity disabled:opacity-50 hover:bg-slate-50"
              >
                {busy && !latest ? "Uploading…" : resumeUploaded ? "Re-upload resume" : "Upload resume"}
              </button>
            </div>

            {/* Job analysis */}
            <div className="float-card rounded-3xl bg-white/90 p-7 backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-900">Analyse a job</h2>
              <p className="mt-1 text-sm text-slate-500">Paste any public job listing URL.</p>
              <div className="mt-4 space-y-3">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                  placeholder="https://company.com/jobs/role"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                />
                <button
                  disabled={busy}
                  onClick={handleAnalyse}
                  className="w-full rounded-xl bg-[color:var(--accent)] py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                >
                  {busy ? "Analysing…" : "Analyse job"}
                </button>
              </div>
            </div>

            {/* Status */}
            {status && (
              <div
                className={`rounded-2xl px-5 py-4 text-sm reveal ${
                  status.type === "error"
                    ? "border border-red-200 bg-red-50 text-red-700"
                    : "border border-emerald-200 bg-emerald-50 text-emerald-800"
                }`}
              >
                {status.text}
              </div>
            )}
          </div>

          {/* Right panel — output */}
          <div className="float-card rounded-3xl bg-white/90 p-7 backdrop-blur reveal reveal-delay">
            <h2 className="text-lg font-semibold text-slate-900">Latest output</h2>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-slate-900 px-5 py-4 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Subject</p>
                <p className="mt-2 text-sm leading-relaxed">{subject}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Email body</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{body}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[color:var(--sun)] px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-600">Fit score</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{fitScore}{typeof fitScore === "number" ? "%" : ""}</p>
                </div>
                <div className="rounded-2xl bg-[color:var(--mint)] px-5 py-4 text-slate-900">
                  <p className="text-xs uppercase tracking-[0.2em]">Top skill match</p>
                  <p className="mt-2 text-base font-semibold">{topSkill}</p>
                </div>
              </div>

              {gapAnalysis && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Gap analysis</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{gapAnalysis}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
