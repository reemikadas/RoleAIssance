import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  FileCheck2,
  FileText,
  Github,
  Home,
  LayoutGrid,
  Link2,
  Mail,
  Menu,
  MessageSquareText,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  WandSparkles,
  X,
} from "lucide-react";
import { activity, candidateSkills, jobs as seedJobs } from "./data";
import {
  nextStatus,
  recommendation,
  scoreJob,
  type Job,
  type JobStatus,
} from "./domain";
import { getProfile, updateProfile, type ProfileData } from "./profileApi";
import { parseCommaList } from "./listInput";

type Page = "Home" | "Jobs" | "Applications" | "Documents" | "Interviews" | "Profile" | "Integrations";

const nav: { label: Page; icon: typeof Home }[] = [
  { label: "Home", icon: Home },
  { label: "Jobs", icon: Search },
  { label: "Applications", icon: BriefcaseBusiness },
  { label: "Documents", icon: FileText },
  { label: "Interviews", icon: MessageSquareText },
];

const statusTone: Record<string, string> = {
  Matched: "teal",
  Prepared: "violet",
  Approved: "blue",
  Submitted: "amber",
  Interviewing: "green",
  Offer: "green",
};

function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark"><Sparkles size={19} /></div>
      <span>Role<span>AI</span>ssance</span>
    </div>
  );
}

function SideNav({ page, setPage, open }: { page: Page; setPage: (p: Page) => void; open: boolean }) {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <Brand />
      <nav>
        <div className="nav-label">Workspace</div>
        {nav.map(({ label, icon: Icon }) => (
          <button key={label} className={page === label ? "active" : ""} onClick={() => setPage(label)}>
            <Icon size={18} /><span>{label}</span>
            {label === "Jobs" && <em>12</em>}
            {label === "Applications" && <em>4</em>}
          </button>
        ))}
        <div className="nav-label lower">Account</div>
        <button className={page === "Profile" ? "active" : ""} onClick={() => setPage("Profile")}>
          <CircleUserRound size={18} /><span>Profile</span>
        </button>
        <button className={page === "Integrations" ? "active" : ""} onClick={() => setPage("Integrations")}>
          <Link2 size={18} /><span>Integrations</span>
        </button>
      </nav>
      <div className="profile-progress">
        <div className="progress-head"><span>Profile strength</span><b>82%</b></div>
        <div className="progress"><i style={{ width: "82%" }} /></div>
        <p>Add two more achievements to improve job matching.</p>
        <button onClick={() => setPage("Profile")}>Complete profile <ChevronRight size={14} /></button>
      </div>
      <div className="sidebar-user">
        <div className="avatar">RD</div>
        <div><b>Reemika Das</b><span>Product professional</span></div>
        <ChevronDown size={15} />
      </div>
    </aside>
  );
}

function Topbar({ title, toggleMenu }: { title: string; toggleMenu: () => void }) {
  return (
    <header className="topbar">
      <button className="menu-btn" aria-label="Open navigation" onClick={toggleMenu}><Menu size={20} /></button>
      <div className="crumb"><span>Workspace</span><ChevronRight size={14} /><b>{title}</b></div>
      <div className="top-actions">
        <div className="global-search"><Search size={16} /><input aria-label="Search" placeholder="Search jobs, companies..." /><kbd>⌘ K</kbd></div>
        <button className="icon-btn" aria-label="Notifications"><Bell size={18} /><i /></button>
        <button className="icon-btn" aria-label="Settings"><Settings size={18} /></button>
      </div>
    </header>
  );
}

function ScoreRing({ score }: { score: number }) {
  return (
    <div className="score-ring" style={{ "--score": `${score * 3.6}deg` } as React.CSSProperties}>
      <div><b>{score}</b><span>match</span></div>
    </div>
  );
}

function JobCard({ job, onSelect }: { job: Job; onSelect: (job: Job) => void }) {
  const score = scoreJob(job, candidateSkills);
  return (
    <article className="job-card" onClick={() => onSelect(job)}>
      <div className="job-logo" style={{ background: job.logoColor }}>{job.logo}</div>
      <div className="job-main">
        <div className="job-title-row">
          <div><h3>{job.role}</h3><p>{job.company} · {job.location}</p></div>
          <span className={`status ${statusTone[job.status] ?? "teal"}`}>{job.status}</span>
        </div>
        <div className="meta"><span>{job.salary}</span><i /> <span>{job.source}</span><i /> <span>{job.posted}</span></div>
        <div className="skill-row">{job.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
      </div>
      <div className="job-score"><ScoreRing score={score} /><span className={`rec ${recommendation(score).toLowerCase()}`}>{recommendation(score)}</span></div>
    </article>
  );
}

function Stat({ icon: Icon, label, value, note, tone }: { icon: typeof Home; label: string; value: string; note: string; tone: string }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={20} /></div>
      <div><span>{label}</span><b>{value}</b><small>{note}</small></div>
    </div>
  );
}

function HomePage({ setPage, selectJob }: { setPage: (p: Page) => void; selectJob: (j: Job) => void }) {
  const topJobs = seedJobs.slice(0, 3);
  return (
    <>
      <section className="welcome">
        <div>
          <span className="eyebrow"><Sparkles size={13} /> Sunday, June 28</span>
          <h1>Good morning, Reemika.</h1>
          <p>Your search is moving. You have <b>3 strong matches</b> and <b>1 interview</b> to prepare for.</p>
        </div>
        <button className="primary" onClick={() => setPage("Jobs")}><Plus size={17} /> Add a job</button>
      </section>

      <section className="stats">
        <Stat icon={Target} label="Strong matches" value="12" note="+4 this week" tone="teal" />
        <Stat icon={FileCheck2} label="Applications" value="8" note="3 awaiting review" tone="violet" />
        <Stat icon={MessageSquareText} label="Interviews" value="2" note="Next: Tue, 10:30 AM" tone="amber" />
        <Stat icon={TrendingUp} label="Response rate" value="24%" note="+6% vs. last month" tone="green" />
      </section>

      <div className="home-grid">
        <section className="panel matches-panel">
          <div className="panel-head"><div><h2>Top matches</h2><p>Ranked from your verified profile and preferences</p></div><button onClick={() => setPage("Jobs")}>View all <ChevronRight size={15} /></button></div>
          <div className="job-list">{topJobs.map((job) => <JobCard key={job.id} job={job} onSelect={selectJob} />)}</div>
        </section>
        <aside className="right-rail">
          <section className="panel next-step">
            <div className="spark"><WandSparkles size={19} /></div>
            <span>Recommended next step</span>
            <h3>Review your Notion application</h3>
            <p>Your tailored resume and cover letter are ready. AI found 7 strong evidence-backed edits.</p>
            <button className="primary full" onClick={() => selectJob(seedJobs[1])}>Review package <ChevronRight size={16} /></button>
          </section>
          <section className="panel activity">
            <div className="panel-head"><h2>Recent activity</h2><button>View all</button></div>
            {activity.map((item) => {
              const Icon = item.icon === "mail" ? Mail : item.icon === "file" ? FileText : Check;
              return <div className="activity-item" key={item.title}><div><Icon size={16} /></div><p><b>{item.title}</b><span>{item.detail}</span><small>{item.time}</small></p></div>;
            })}
          </section>
        </aside>
      </div>
    </>
  );
}

function JobsPage({ selectJob }: { selectJob: (j: Job) => void }) {
  const [query, setQuery] = useState("");
  const filtered = seedJobs.filter((job) => `${job.company} ${job.role}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <section className="page-heading">
        <div><span className="eyebrow">Opportunity inbox</span><h1>Discover your next role</h1><p>AI-ranked jobs based on your skills, goals, and non-negotiables.</p></div>
        <button className="primary"><Sparkles size={16} /> Run discovery</button>
      </section>
      <div className="filter-bar"><div><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search roles or companies" /></div><button>All sources <ChevronDown size={14} /></button><button>80%+ match <ChevronDown size={14} /></button><button>Remote & hybrid <ChevronDown size={14} /></button></div>
      <section className="panel jobs-panel">
        <div className="panel-head"><div><h2>{filtered.length} recommended roles</h2><p>Updated 12 minutes ago</p></div><span className="safe-label"><ShieldCheck size={14} /> Verified sources</span></div>
        <div className="job-list roomy">{filtered.map((job) => <JobCard key={job.id} job={job} onSelect={selectJob} />)}</div>
      </section>
    </>
  );
}

function ApplicationsPage({ selectJob }: { selectJob: (j: Job) => void }) {
  const columns: { title: JobStatus; hint: string }[] = [
    { title: "Prepared", hint: "Ready for review" },
    { title: "Submitted", hint: "Waiting for response" },
    { title: "Interviewing", hint: "In conversation" },
  ];
  return (
    <>
      <section className="page-heading"><div><span className="eyebrow">Application tracker</span><h1>Your active pipeline</h1><p>Every application, document, and next step in one place.</p></div><button className="primary"><Plus size={16} /> Add application</button></section>
      <section className="kanban">
        {columns.map((col) => (
          <div className="kanban-col" key={col.title}>
            <header><div><h3>{col.title}</h3><p>{col.hint}</p></div><span>{seedJobs.filter(j => j.status === col.title).length}</span></header>
            {seedJobs.filter(j => j.status === col.title).map(job => {
              const score = scoreJob(job, candidateSkills);
              return <article key={job.id} onClick={() => selectJob(job)}><div className="kanban-company"><div className="job-logo small" style={{ background: job.logoColor }}>{job.logo}</div><div><b>{job.company}</b><span>{job.role}</span></div></div><div className="kanban-meta"><span>{score}% match</span><span>{job.posted}</span></div><div className="mini-progress"><i style={{ width: `${score}%` }} /></div></article>;
            })}
            <button className="add-card"><Plus size={14} /> Add item</button>
          </div>
        ))}
      </section>
    </>
  );
}

function DocumentsPage() {
  const docs = [
    ["Stripe", "Senior Product Manager, Growth", "Resume", "Today, 9:42 AM"],
    ["Notion", "Product Manager, AI", "Application package", "Yesterday"],
    ["Airbnb", "Technical Product Manager", "Resume", "Jun 26"],
    ["Linear", "Product Lead", "Interview guide", "Jun 24"],
  ];
  return (
    <>
      <section className="page-heading"><div><span className="eyebrow">Document library</span><h1>Application files</h1><p>Professionally named, evidence-backed, and organized by company.</p></div><button className="primary"><Plus size={16} /> Generate document</button></section>
      <section className="panel document-panel">
        <div className="panel-head"><div><h2>Recent files</h2><p>All documents are private by default</p></div><div className="view-toggle"><button className="active"><LayoutGrid size={16} /></button><button><Menu size={16} /></button></div></div>
        <div className="doc-grid">{docs.map(([company, role, type, date]) => <article key={company}><div className="doc-icon"><FileText size={25} /></div><span>{type}</span><h3>{company}</h3><p>{role}</p><small>{date}</small><button>Open folder <ChevronRight size={14} /></button></article>)}</div>
      </section>
    </>
  );
}

function InterviewsPage() {
  return (
    <>
      <section className="page-heading"><div><span className="eyebrow">Interview workspace</span><h1>Prepare with confidence</h1><p>Company context and practice grounded in your real experience.</p></div><button className="primary"><MessageSquareText size={16} /> Start mock interview</button></section>
      <div className="interview-grid">
        <section className="panel interview-feature">
          <span className="status green">Upcoming · Tuesday</span>
          <div className="interview-brand"><div className="job-logo" style={{ background: "#5e6ad2" }}>L</div><div><h2>Linear · Product Lead</h2><p>Product sense interview · 10:30 AM</p></div></div>
          <div className="prep-progress"><div><span>Preparation progress</span><b>68%</b></div><div className="progress"><i style={{ width: "68%" }} /></div></div>
          <div className="prep-list">
            <div className="done"><Check size={15} /><span>Company and product brief</span><b>Complete</b></div>
            <div className="done"><Check size={15} /><span>Your relevant STAR stories</span><b>5 stories</b></div>
            <div><CalendarDays size={15} /><span>Product-sense practice</span><b>2 remaining</b></div>
            <div><MessageSquareText size={15} /><span>Questions for the interviewer</span><b>8 drafted</b></div>
          </div>
          <button className="primary">Continue preparation <ChevronRight size={15} /></button>
        </section>
        <section className="panel prep-card"><div className="spark"><Sparkles size={20} /></div><h2>Your AI prep guide</h2><p>Built from Linear’s role, product, recent updates, and your verified experience.</p><div className="guide-stat"><b>24</b><span>likely questions</span></div><div className="guide-stat"><b>5</b><span>matched STAR stories</span></div><button className="secondary">Open full guide</button></section>
      </div>
    </>
  );
}

function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [draft, setDraft] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [targetRolesText, setTargetRolesText] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "saving" | "saved" | "error">("loading");

  useEffect(() => {
    getProfile()
      .then(({ profile: loaded }) => {
        setProfile(loaded);
        setDraft(loaded);
        setTargetRolesText(loaded.targetRoles.join(", "));
        setSkillsText(loaded.skills.join(", "));
        setState("ready");
      })
      .catch(() => setState("error"));
  }, []);

  const setField = <K extends keyof ProfileData>(field: K, value: ProfileData[K]) => {
    setDraft((current) => current ? { ...current, [field]: value } : current);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft) return;
    setState("saving");
    try {
      const { profile: saved } = await updateProfile({
        ...draft,
        targetRoles: parseCommaList(targetRolesText),
        skills: parseCommaList(skillsText),
      });
      setProfile(saved);
      setDraft(saved);
      setTargetRolesText(saved.targetRoles.join(", "));
      setSkillsText(saved.skills.join(", "));
      setEditing(false);
      setState("saved");
      window.setTimeout(() => setState("ready"), 1800);
    } catch {
      setState("error");
    }
  };

  if (state === "loading") {
    return <section className="panel profile-loading"><Sparkles size={22} /><h2>Loading your verified profile...</h2></section>;
  }
  if (!profile || !draft) {
    return <section className="panel profile-loading error"><ShieldCheck size={22} /><h2>Profile API is unavailable</h2><p>Make sure both the web app and API are running with <code>npm run dev</code>.</p></section>;
  }

  return (
    <>
      <section className="page-heading"><div><span className="eyebrow">Verified candidate profile</span><h1>Your career source of truth</h1><p>AI only uses facts you have reviewed and approved.</p></div><button className={editing ? "secondary" : "primary"} onClick={() => { setDraft(profile); setTargetRolesText(profile.targetRoles.join(", ")); setSkillsText(profile.skills.join(", ")); setEditing(!editing); }}>{editing ? <><X size={16} /> Cancel editing</> : <><Plus size={16} /> Update details</>}</button></section>
      {state === "saved" && <div className="save-banner"><Check size={16} /> Profile saved. Matching will use your updated details.</div>}
      {state === "error" && <div className="save-banner error"><X size={16} /> We couldn't save those changes. Check the highlighted information and try again.</div>}
      <div className="profile-grid">
        <section className="panel profile-card"><div className="large-avatar">{profile.fullName.split(" ").map(name => name[0]).join("").slice(0, 2).toUpperCase()}</div><h2>{profile.fullName}</h2><p>{profile.headline} · {profile.location}</p><div className="verified"><ShieldCheck size={15} /> Profile verified</div><div className="progress-head"><span>Profile strength</span><b>82%</b></div><div className="progress"><i style={{ width: "82%" }} /></div><div className="profile-summary"><span>{profile.remotePreference}</span><span>{profile.targetRoles.length} target roles</span><span>{profile.skills.length} verified skills</span></div></section>
        {editing ? (
          <form className="panel profile-form" onSubmit={save}>
            <div className="panel-head"><div><h2>Edit profile</h2><p>These details are stored locally and become your matching source of truth.</p></div></div>
            <div className="form-grid">
              <label>Full name<input required minLength={2} value={draft.fullName} onChange={e => setField("fullName", e.target.value)} /></label>
              <label>Professional headline<input required minLength={2} value={draft.headline} onChange={e => setField("headline", e.target.value)} /></label>
              <label>Email<input required type="email" value={draft.email} onChange={e => setField("email", e.target.value)} /></label>
              <label>Location<input required minLength={2} value={draft.location} onChange={e => setField("location", e.target.value)} /></label>
              <label>Work authorization<input required minLength={2} value={draft.workAuthorization} onChange={e => setField("workAuthorization", e.target.value)} /></label>
              <label>Work preference<select value={draft.remotePreference} onChange={e => setField("remotePreference", e.target.value as ProfileData["remotePreference"])}><option>Flexible</option><option>Remote</option><option>Hybrid</option><option>On-site</option></select></label>
              <label>GitHub URL<input type="url" value={draft.githubUrl} onChange={e => setField("githubUrl", e.target.value)} placeholder="https://github.com/username" /></label>
              <label>LinkedIn URL<input type="url" value={draft.linkedinUrl} onChange={e => setField("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/username" /></label>
              <label>Portfolio URL<input type="url" value={draft.portfolioUrl} onChange={e => setField("portfolioUrl", e.target.value)} placeholder="https://yourportfolio.com" /></label>
              <label className="wide">Target roles <small>Separate roles with commas</small><input value={targetRolesText} onChange={e => setTargetRolesText(e.target.value)} /></label>
              <label className="wide">Skills <small>Separate skills with commas</small><textarea required value={skillsText} onChange={e => setSkillsText(e.target.value)} /></label>
            </div>
            <div className="form-actions"><button type="button" className="secondary" onClick={() => { setDraft(profile); setTargetRolesText(profile.targetRoles.join(", ")); setSkillsText(profile.skills.join(", ")); setEditing(false); }}>Cancel</button><button type="submit" className="primary" disabled={state === "saving"}>{state === "saving" ? "Saving..." : "Save verified profile"}</button></div>
          </form>
        ) : (
          <section className="panel profile-details"><div className="panel-head"><div><h2>Skills and evidence</h2><p>Used for matching and grounded document generation</p></div><button onClick={() => setEditing(true)}>Edit</button></div><div className="evidence-list">{profile.skills.map((skill, i) => <div key={skill}><span><Check size={13} /></span><p><b>{skill}</b><small>{i % 2 ? "Verified from resume" : "Verified from project evidence"}</small></p><em>{i % 3 + 1} sources</em></div>)}</div></section>
        )}
      </div>
    </>
  );
}

function IntegrationsPage() {
  const [connected, setConnected] = useState<Record<string, boolean>>({ Gmail: true, GitHub: true });
  const integrations = [
    ["Gmail", Mail, "Read job-related messages and draft replies. Never sends without approval."],
    ["GitHub", Github, "Use selected public projects as evidence for skills and interview prep."],
    ["Google Calendar", CalendarDays, "Suggest interview events and reminders without changing your calendar."],
    ["Portfolio", Link2, "Import public projects, case studies, and work samples from your website."],
  ] as const;
  return (
    <>
      <section className="page-heading"><div><span className="eyebrow">Connections and permissions</span><h1>Your integrations</h1><p>Every connection is scope-limited, revocable, and controlled by you.</p></div></section>
      <section className="integration-grid">{integrations.map(([name, Icon, description]) => {
        const isConnected = Boolean(connected[name]);
        return <article className="panel integration-card" key={name}><div className="integration-icon"><Icon size={23} /></div><div><h3>{name}</h3><p>{description}</p></div><span className={`connection ${isConnected ? "on" : ""}`}>{isConnected ? "Connected" : "Not connected"}</span><button className={isConnected ? "secondary" : "primary"} onClick={() => setConnected((c) => ({ ...c, [name]: !isConnected }))}>{isConnected ? "Manage" : "Connect"}</button></article>;
      })}</section>
      <div className="privacy-note"><ShieldCheck size={22} /><div><b>You stay in control</b><p>RoleAIssance never stores account passwords or uses connected data to train public AI models.</p></div></div>
    </>
  );
}

function JobDrawer({ job, close }: { job: Job; close: () => void }) {
  const [status, setStatus] = useState(job.status);
  const score = scoreJob(job, candidateSkills);
  return (
    <div className="drawer-wrap" onMouseDown={close}>
      <aside className="drawer" onMouseDown={(e) => e.stopPropagation()}>
        <button className="drawer-close" aria-label="Close job details" onClick={close}><X size={20} /></button>
        <div className="drawer-company"><div className="job-logo big" style={{ background: job.logoColor }}>{job.logo}</div><div><span>{job.company}</span><h2>{job.role}</h2><p>{job.location} · {job.salary}</p></div></div>
        <div className="drawer-score"><ScoreRing score={score} /><div><b>{recommendation(score)} recommended</b><p>Strong alignment with your verified skills and preferences.</p></div></div>
        <section><h3>Why this matches</h3><div className="match-bars"><div><span>Required skills</span><b>94%</b><i><em style={{ width: "94%" }} /></i></div><div><span>Seniority</span><b>{job.seniorityMatch}%</b><i><em style={{ width: `${job.seniorityMatch}%` }} /></i></div><div><span>Preferences</span><b>{job.preferenceMatch}%</b><i><em style={{ width: `${job.preferenceMatch}%` }} /></i></div></div></section>
        <section><h3>Role summary</h3><p>{job.summary}</p><div className="skill-row">{job.skills.map(s => <span key={s}>{s}</span>)}</div></section>
        <section><h3>AI application package</h3><div className="package-item"><FileText size={18} /><div><b>Tailored resume</b><span>7 evidence-backed improvements</span></div><span className="status green">Ready</span></div><div className="package-item"><Mail size={18} /><div><b>Cover letter</b><span>Company-specific draft</span></div><span className="status green">Ready</span></div></section>
        <div className="drawer-actions"><button className="secondary" onClick={close}>Save for later</button><button className="primary" onClick={() => setStatus(nextStatus(status))}>{status === "Matched" ? "Prepare application" : `Move to ${nextStatus(status)}`} <ChevronRight size={15} /></button></div>
      </aside>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("Home");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const title = useMemo(() => page === "Home" ? "Overview" : page, [page]);

  const go = (next: Page) => { setPage(next); setMenuOpen(false); };
  return (
    <div className="app">
      <SideNav page={page} setPage={go} open={menuOpen} />
      {menuOpen && <div className="mobile-scrim" onClick={() => setMenuOpen(false)} />}
      <div className="main-shell">
        <Topbar title={title} toggleMenu={() => setMenuOpen(!menuOpen)} />
        <main>
          {page === "Home" && <HomePage setPage={go} selectJob={setSelectedJob} />}
          {page === "Jobs" && <JobsPage selectJob={setSelectedJob} />}
          {page === "Applications" && <ApplicationsPage selectJob={setSelectedJob} />}
          {page === "Documents" && <DocumentsPage />}
          {page === "Interviews" && <InterviewsPage />}
          {page === "Profile" && <ProfilePage />}
          {page === "Integrations" && <IntegrationsPage />}
        </main>
      </div>
      {selectedJob && <JobDrawer job={selectedJob} close={() => setSelectedJob(null)} />}
    </div>
  );
}
