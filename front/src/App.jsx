import React from 'react';

function App() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 bg-primary px-10 py-4 text-white">
          <div className="flex items-center gap-4">
            <div className="size-8 bg-emerald-accent rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-white">analytics</span>
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight tracking-tight">
                Intelli-Credit Workbench
              </h2>
              <p className="text-xs text-slate-300 font-normal">
                Next-gen corporate credit appraisal &amp; CAM generation
              </p>
            </div>
          </div>
          <div className="flex flex-1 justify-end gap-6 items-center">
            <nav className="flex items-center gap-6">
              <a className="text-sm font-medium hover:text-emerald-accent transition-colors" href="#">
                Dashboard
              </a>
              <a className="text-sm font-medium text-emerald-accent border-b-2 border-emerald-accent pb-1" href="#">
                Workbench
              </a>
              <a className="text-sm font-medium hover:text-emerald-accent transition-colors" href="#">
                Reports
              </a>
            </nav>
            <div className="flex gap-3">
              <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-white/10 hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined text-white">notifications</span>
              </button>
              <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-white/10 hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined text-white">settings</span>
              </button>
              <div className="size-10 rounded-full bg-slate-400 border-2 border-white/20 overflow-hidden">
                <img
                  alt="Profile"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbSV8MzDpTNh4s5kF8-KLsFR4wXEGOhBWpaoKR8m8CLiu_E2_RgBRWE0XqDhEojOQA5bt03uff1WEya0cKSED08LMFjIUt1I_wGf9ZgrQtQTQZlwR3CDge1bzsJm3N3TA_cbBvWGzhJ-0sKsNXfLw88SbgYwsZOYUkpoKul9MvRigdT-dgbmy9taaKEkzvqwy0qSPcE5KMwDorOdwGmWGM2KhFZE2IwZCSq71fQd22-1lojyIukLNb2iCmVXK1J-vEto-oax02u1Y"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto w-full px-10 py-8">
          <div className="mb-10">
            <div className="flex items-center justify-between max-w-4xl mx-auto relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -z-10 -translate-y-1/2" />
              <div className="flex flex-col items-center gap-2 bg-background-light dark:bg-background-dark px-4">
                <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white ring-4 ring-emerald-accent/30">
                  <span className="material-symbols-outlined">upload_file</span>
                </div>
                <span className="text-sm font-bold text-primary dark:text-white">
                  1. Data Ingestor
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 bg-background-light dark:bg-background-dark px-4">
                <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <span className="material-symbols-outlined">search_insights</span>
                </div>
                <span className="text-sm font-medium text-slate-500">2. Research Agent</span>
              </div>
              <div className="flex flex-col items-center gap-2 bg-background-light dark:bg-background-dark px-4">
                <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <span className="text-sm font-medium text-slate-500">
                  3. Recommendation &amp; CAM
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-primary dark:text-white">
                Pillar 1 - Data Ingestor
              </h1>
              <p className="text-steel-blue dark:text-slate-400 mt-1">
                Upload and process key financial documents for credit appraisal.
              </p>
            </div>
            <button className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-shadow shadow-md">
              <span className="material-symbols-outlined text-sm">save</span>
              Update Case
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-10">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-steel-blue">
                Company Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">
                  factory
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-emerald-accent focus:border-emerald-accent"
                  type="text"
                  defaultValue="Adrian Manufacturing"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-steel-blue">
                Applicant / Promoter
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">
                  person
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-emerald-accent focus:border-emerald-accent"
                  type="text"
                  defaultValue="Adrian"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-steel-blue">
                Sector
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">
                  category
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-emerald-accent focus:border-emerald-accent"
                  type="text"
                  defaultValue="Textiles"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="material-symbols-outlined text-primary">account_balance</span>
                </div>
                <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-emerald-accent/10 text-emerald-accent">
                  Processed
                </span>
              </div>
              <h3 className="font-bold text-primary dark:text-white mb-1">Bank Statement</h3>
              <p className="text-xs text-slate-500 mb-4 flex-grow">
                Analyze cash flows, primary transactions, and balances.
              </p>
              <div className="mt-auto space-y-3">
                <button className="text-xs font-bold text-emerald-accent hover:underline flex items-center gap-1">
                  View extracted summary
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                </button>
                <button className="w-full py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">
                  Re-upload
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="material-symbols-outlined text-primary">receipt_long</span>
                </div>
                <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-emerald-accent/10 text-emerald-accent">
                  Processed
                </span>
              </div>
              <h3 className="font-bold text-primary dark:text-white mb-1">GST Filing</h3>
              <p className="text-xs text-slate-500 mb-4 flex-grow">
                Verify sales and purchase data through tax filings.
              </p>
              <div className="mt-auto space-y-3">
                <button className="text-xs font-bold text-emerald-accent hover:underline flex items-center gap-1">
                  View extracted summary
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                </button>
                <button className="w-full py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300">
                  Re-upload
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full border-l-4 border-l-error-accent">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="material-symbols-outlined text-primary">history_edu</span>
                </div>
                <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-error-accent/10 text-error-accent">
                  Error
                </span>
              </div>
              <h3 className="font-bold text-primary dark:text-white mb-1">ITR / Tax Statement</h3>
              <p className="text-xs text-slate-500 mb-4 flex-grow">
                System failed to parse the uploaded PDF. Please check file quality.
              </p>
              <div className="mt-auto">
                <button className="w-full py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90">
                  Upload Again
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="material-symbols-outlined text-primary">credit_card</span>
                </div>
                <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Waiting
                </span>
              </div>
              <h3 className="font-bold text-primary dark:text-white mb-1">Credit Report</h3>
              <p className="text-xs text-slate-500 mb-4 flex-grow">
                Bureau scores and historical credit behavior data.
              </p>
              <div className="mt-auto">
                <button className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">add</span>
                  Drop file here
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="material-symbols-outlined text-primary">menu_book</span>
                </div>
                <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-emerald-accent/10 text-emerald-accent">
                  Processed
                </span>
              </div>
              <h3 className="font-bold text-primary dark:text-white mb-1">Annual Report</h3>
              <p className="text-xs text-slate-500 mb-4 flex-grow">
                Comprehensive financial and management discussion.
              </p>
              <div className="mt-auto">
                <button className="w-full py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300">
                  View File
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="material-symbols-outlined text-primary">gavel</span>
                </div>
                <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Waiting
                </span>
              </div>
              <h3 className="font-bold text-primary dark:text-white mb-1">Legal Notice</h3>
              <p className="text-xs text-slate-500 mb-4 flex-grow">
                Check for ongoing litigation or statutory warnings.
              </p>
              <div className="mt-auto">
                <button className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">add</span>
                  Upload
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="material-symbols-outlined text-primary">assignment</span>
                </div>
                <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Waiting
                </span>
              </div>
              <h3 className="font-bold text-primary dark:text-white mb-1">Sanction Letter</h3>
              <p className="text-xs text-slate-500 mb-4 flex-grow">
                Current credit facilities and agreed terms.
              </p>
              <div className="mt-auto">
                <button className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">add</span>
                  Upload
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="material-symbols-outlined text-primary">groups</span>
                </div>
                <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Waiting
                </span>
              </div>
              <h3 className="font-bold text-primary dark:text-white mb-1">Board Minutes</h3>
              <p className="text-xs text-slate-500 mb-4 flex-grow">
                Key governance decisions and director approvals.
              </p>
              <div className="mt-auto">
                <button className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">add</span>
                  Upload
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="material-symbols-outlined text-primary">star</span>
                </div>
                <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-emerald-accent/10 text-emerald-accent">
                  Processed
                </span>
              </div>
              <h3 className="font-bold text-primary dark:text-white mb-1">
                Rating Agency Report
              </h3>
              <p className="text-xs text-slate-500 mb-4 flex-grow">
                External credit ratings from CRISIL, ICRA, etc.
              </p>
              <div className="mt-auto">
                <button className="w-full py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300">
                  View File
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="material-symbols-outlined text-primary">pie_chart</span>
                </div>
                <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-emerald-accent/10 text-emerald-accent">
                  Processed
                </span>
              </div>
              <h3 className="font-bold text-primary dark:text-white mb-1">
                Shareholding Pattern
              </h3>
              <p className="text-xs text-slate-500 mb-4 flex-grow">
                Ownership distribution and promoter pledging info.
              </p>
              <div className="mt-auto">
                <button className="w-full py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300">
                  View File
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-6">
          <div className="max-w-7xl mx-auto flex justify-end gap-4">
            <button className="px-6 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors">
              Save as Draft
            </button>
            <button className="px-8 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 flex items-center gap-2">
              Proceed to Research
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;

