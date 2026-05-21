"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type ApiReport = {
  id: string;
  tokenSymbol: string;
  tokenAddress: string | null;
  chain: string;
  reportType: string;
  description?: string;
  evidenceUrl?: string | null;
  createdAt: string;
};

type ApiProfile = {
  id: string;
  handle: string;
  normalized: string;
  xUrl: string;
  reportCount: number;
  tokenCount: number;
  upvoteCount: number;
  communityScore: number;
  lastActivityAt: string;
  reports: ApiReport[];
};

type Language = "en" | "zh";

const copy = {
  en: {
    langButton: "中文",
    eyebrow: "Community-submitted X accounts and tokens",
    title: "Search X accounts linked to token rugs and scam reports.",
    body:
      "ConfessWall does not verify claims. It shows which X accounts and tokens have been submitted by the community, with votes and a simple activity score.",
    searchLabel: "Search X or token",
    searchPlaceholder: "@username, $TOKEN, token address",
    search: "Search",
    submissions: "submissions",
    accounts: "reported X accounts",
    tokens: "reported tokens",
    privacy: "No account required. Anonymous submissions are rate-limited to reduce spam.",
    filters: {
      all: "All",
      trending: "Trending Risk",
      watchlisted: "Watchlisted",
      multi: "Multiple Tokens",
      new: "New Reports"
    },
    trending: "Trending X accounts",
    wallTitle: "Reported X accounts",
    submit: "Submit X Report",
    noResults: "No matching profiles",
    noResultsBody: "Try another X handle, token symbol, or token address.",
    communityScore: "SCAM RISK SCORE",
    view: "View Profile",
    vote: "I was rugged too",
    voted: "Voted",
    latestActivity: "Latest activity",
    reportType: "Report type",
    reportTypes: {
      lp: "LP pulled",
      dump: "Team dumped",
      mint: "Mint abuse",
      blacklist: "Blacklist / cannot sell",
      presale: "Presale exit"
    },
    whatHappened: "What happened?",
    submitTitle: "Add an X account and token",
    xAccount: "X account",
    token: "Token",
    tokenAddress: "Token address",
    chain: "Chain",
    description: "Description",
    evidenceUrl: "Evidence URL",
    cancel: "Cancel",
    create: "Submit Report",
    reportedTokens: "Reported Tokens",
    activityNotes: "Activity Notes",
    noteA: "Scam Risk Score is based on linked token count, rugged-too votes, and recent activity.",
    noteB: "No on-chain verification is performed.",
    noteC: "Use this as a social signal, not a factual finding.",
    rulesEyebrow: "Important context",
    rulesTitle: "Submissions are not verification.",
    ruleOneTitle: "Community submitted",
    ruleOneBody: "Anyone can submit an X account and token. Records show what users reported.",
    ruleTwoTitle: "Not proof",
    ruleTwoBody: "ConfessWall does not decide whether a claim is true. Use it as a starting point for your own checks.",
    ruleThreeTitle: "X-first profiles",
    ruleThreeBody: "Each profile groups reported tokens, votes, and activity under one X handle.",
    loading: "Loading profiles...",
    error: "Something went wrong. Try again.",
    required: "Please fill out {field}.",
    invalidUrl: "Please enter a valid URL.",
    chooseChain: "Choose chain"
  },
  zh: {
    langButton: "EN",
    eyebrow: "社区提交的 X 账号和 Token",
    title: "搜索与 Token Rug 和诈骗举报相关的 X 账号。",
    body: "ConfessWall 不验证举报真伪。这里仅展示社区提交过哪些 X 账号和 Token，并附带点赞和简单热度评分。",
    searchLabel: "搜索 X 或 Token",
    searchPlaceholder: "@username、$TOKEN、代币地址",
    search: "搜索",
    submissions: "条提交",
    accounts: "个被登记 X 账号",
    tokens: "个被登记 Token",
    privacy: "无需注册即可提交。匿名提交会进行频率限制以减少垃圾内容。",
    filters: {
      all: "全部",
      trending: "趋势风险",
      watchlisted: "观察名单",
      multi: "多个 Token",
      new: "最新提交"
    },
    trending: "热门 X 账号",
    wallTitle: "被登记的 X 账号",
    submit: "提交 X 举报",
    noResults: "没有找到匹配主页",
    noResultsBody: "换个 X 账号、Token 符号或代币地址试试。",
    communityScore: "诈骗风险分",
    view: "查看主页",
    vote: "我也被 Rug 了",
    voted: "已投票",
    latestActivity: "最近活跃",
    reportType: "举报类型",
    reportTypes: {
      lp: "抽走 LP",
      dump: "团队砸盘",
      mint: "Mint 增发",
      blacklist: "黑名单/无法卖出",
      presale: "预售跑路"
    },
    whatHappened: "发生了什么？",
    submitTitle: "添加一个 X 账号和 Token",
    xAccount: "X 账号",
    token: "Token",
    tokenAddress: "Token 地址",
    chain: "链",
    description: "描述",
    evidenceUrl: "证据链接",
    cancel: "取消",
    create: "提交举报",
    reportedTokens: "被登记 Token",
    activityNotes: "活跃说明",
    noteA: "诈骗风险分基于关联 Token 数、被 Rug 反馈人数和最近活跃度。",
    noteB: "当前不做链上验证。",
    noteC: "请把它当成社群风险信号，而不是事实认定。",
    rulesEyebrow: "重要说明",
    rulesTitle: "提交记录不等于验证结论。",
    ruleOneTitle: "社区提交",
    ruleOneBody: "任何用户都可以提交 X 账号和 Token。记录只展示用户提交了什么。",
    ruleTwoTitle: "不是定论",
    ruleTwoBody: "ConfessWall 不判断举报是否真实。请把它作为进一步核查的起点。",
    ruleThreeTitle: "以 X 账号为核心",
    ruleThreeBody: "每个主页聚合同一个 X 账号下的 Token、点赞和活跃度。",
    loading: "正在加载...",
    error: "出错了，请稍后重试。",
    required: "请填写{field}。",
    invalidUrl: "请输入有效链接。",
    chooseChain: "选择链"
  }
};

const filterKeys = ["all", "trending", "watchlisted", "multi", "new"] as const;
const chainOptions = ["Ethereum", "Solana", "BSC", "Base"];
const reportTypeOptions = [
  { value: "LP pulled", key: "lp" },
  { value: "Team dumped", key: "dump" },
  { value: "Mint abuse", key: "mint" },
  { value: "Blacklist / cannot sell", key: "blacklist" },
  { value: "Presale exit", key: "presale" }
] as const;

function getAnonymousUserId() {
  const key = "confesswall-anonymous-id";
  let value = localStorage.getItem(key);

  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(key, value);
  }

  return value;
}

function levelFor(score: number, language: Language) {
  if (language === "zh") {
    if (score >= 80) return "严重风险";
    if (score >= 60) return "高风险";
    if (score >= 30) return "已标记";
    return "低信号";
  }

  if (score >= 80) return "Severe Risk";
  if (score >= 60) return "High Risk";
  if (score >= 30) return "Flagged";
  return "Low Signal";
}

function shortAge(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.max(1, Math.floor(diff / 3_600_000));

  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function xProfileHref(profile: Pick<ApiProfile, "normalized">) {
  return `https://x.com/${profile.normalized}`;
}

function ruggedTooLabel(count: number, language: Language) {
  if (language === "zh") return `${count} 人也被 Rug`;
  return count === 1 ? "1 was rugged too" : `${count} were rugged too`;
}

function reportTypeLabel(reportType: string, language: Language) {
  const option = reportTypeOptions.find((item) => item.value === reportType);
  if (!option) return reportType;

  return copy[language].reportTypes[option.key];
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [profiles, setProfiles] = useState<ApiProfile[]>([]);
  const [selected, setSelected] = useState<ApiProfile | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filterKeys)[number]>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [chain, setChain] = useState("Solana");
  const [chainOpen, setChainOpen] = useState(false);
  const [votedProfiles, setVotedProfiles] = useState<string[]>([]);
  const [profileCache, setProfileCache] = useState<Record<string, ApiProfile>>({});
  const text = copy[language];

  const totals = useMemo(() => {
    const reports = profiles.reduce((sum, profile) => sum + profile.reportCount, 0);
    const tokens = profiles.reduce((sum, profile) => sum + profile.tokenCount, 0);
    return { profiles: profiles.length, reports, tokens };
  }, [profiles]);

  const suggestions = useMemo(() => {
    const needle = query.trim().toLowerCase().replace(/^@/, "");
    if (!needle) return [];

    const options = new Map<string, string>();
    profiles.forEach((profile) => {
      if (profile.handle.toLowerCase().includes(needle) || profile.normalized.includes(needle)) {
        options.set(profile.handle, profile.handle);
      }

      profile.reports.forEach((report) => {
        if (report.tokenSymbol.toLowerCase().includes(needle)) {
          options.set(report.tokenSymbol, `${report.tokenSymbol} / ${profile.handle}`);
        }
        if (report.tokenAddress?.toLowerCase().includes(needle)) {
          options.set(report.tokenAddress, `${report.tokenAddress} / ${profile.handle}`);
        }
      });
    });

    return Array.from(options.entries()).slice(0, 6).map(([value, label]) => ({ value, label }));
  }, [profiles, query]);

  async function loadProfiles(nextQuery = query, nextFilter = filter) {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (nextQuery) params.set("q", nextQuery);
      if (nextFilter !== "all") params.set("filter", nextFilter);

      const response = await fetch(`/api/profiles?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to load profiles");
      const data = await response.json();
      setProfiles(data.items);
    } catch {
      setError(text.error);
    } finally {
      setLoading(false);
    }
  }

  async function loadProfile(handle: string, fallback?: ApiProfile) {
    const normalized = handle.replace(/^@/, "").toLowerCase();
    const cached = profileCache[normalized];

    if (cached) {
      setSelected(cached);
      return cached;
    }

    if (fallback) {
      setSelected(fallback);
    }

    const response = await fetch(`/api/profiles/${encodeURIComponent(normalized)}`);
    if (!response.ok) throw new Error("Failed to load profile");
    const profile = await response.json();
    setProfileCache((current) => ({ ...current, [profile.normalized]: profile }));
    setSelected(profile);
    return profile;
  }

  useEffect(() => {
    const storedVotes = localStorage.getItem("confesswall-voted-profiles");
    if (storedVotes) setVotedProfiles(JSON.parse(storedVotes));
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function rememberVote(normalized: string) {
    setVotedProfiles((current) => {
      const next = Array.from(new Set([...current, normalized]));
      localStorage.setItem("confesswall-voted-profiles", JSON.stringify(next));
      return next;
    });
  }

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    await loadProfiles(query, filter);
  }

  async function handleFilter(nextFilter: typeof filter) {
    setFilter(nextFilter);
    await loadProfiles(query, nextFilter);
  }

  async function openProfile(profile: ApiProfile) {
    await loadProfile(profile.normalized, profile);
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const xHandle = String(form.get("xHandle") || "").trim();
    const tokenSymbol = String(form.get("tokenSymbol") || "").trim();
    const reportType = String(form.get("reportType") || "").trim();
    const description = String(form.get("description") || "").trim();
    const evidenceUrl = String(form.get("evidenceUrl") || "").trim();
    const missing = [
      { value: xHandle, label: text.xAccount },
      { value: tokenSymbol, label: text.token },
      { value: chain, label: text.chain },
      { value: reportType, label: text.reportType }
    ].find((field) => !field.value);

    if (missing) {
      setFormError(text.required.replace("{field}", missing.label));
      setSubmitting(false);
      return;
    }

    if (evidenceUrl) {
      try {
        new URL(evidenceUrl);
      } catch {
        setFormError(text.invalidUrl);
        setSubmitting(false);
        return;
      }
    }

    setFormError("");

    const payload = {
      xHandle,
      tokenSymbol,
      tokenAddress: String(form.get("tokenAddress") || "") || null,
      chain,
      reportType,
      description,
      evidenceUrl: evidenceUrl || null,
      anonymousUserId: getAnonymousUserId()
    };

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Submit failed");

      setShowForm(false);
      await loadProfiles(query, filter);
      await loadProfile(data.profile.handle, data.profile);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : text.error);
    } finally {
      setSubmitting(false);
    }
  }

  async function vote(profile: ApiProfile) {
    if (votedProfiles.includes(profile.normalized)) return;

    try {
      const response = await fetch(`/api/profile-votes/${encodeURIComponent(profile.normalized)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anonymousUserId: getAnonymousUserId() })
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          rememberVote(profile.normalized);
          return;
        }
        throw new Error(data.error || "Vote failed");
      }

      rememberVote(profile.normalized);
      setProfileCache((current) => {
        const { [profile.normalized]: _removed, ...rest } = current;
        return rest;
      });
      await loadProfiles(query, filter);
      if (selected?.id === profile.id) await loadProfile(profile.normalized);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : text.error);
    }
  }

  return (
    <>
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" role="img">
              <path d="M16 5 27 25H5L16 5Z" />
              <circle cx="16" cy="18" r="5" />
              <circle cx="16" cy="18" r="2" />
            </svg>
          </span>
          <span>
            <strong>ConfessWall</strong>
            <small>X community report wall</small>
          </span>
        </a>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#wall">Wall</a>
          <a href="#rules">Rules</a>
        </nav>
        <div className="top-actions">
          <button className="language-toggle" type="button" onClick={() => setLanguage(language === "en" ? "zh" : "en")}>
            {text.langButton}
          </button>
        </div>
      </header>

      <main>
        <section className="hero" aria-labelledby="page-title">
          <div className="hero-copy">
            <p className="eyebrow">{text.eyebrow}</p>
            <h1 id="page-title">{text.title}</h1>
            <p className="hero-text">{text.body}</p>
          </div>

          <form className="search-panel" role="search" onSubmit={handleSearch}>
            <label htmlFor="searchInput">{text.searchLabel}</label>
            <div className="search-row">
              <input
                id="searchInput"
                type="search"
                placeholder={text.searchPlaceholder}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button type="submit">{text.search}</button>
            </div>
            {suggestions.length ? (
              <div className="search-suggestions">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.value}
                    type="button"
                    onClick={() => {
                      setQuery(suggestion.value);
                      loadProfiles(suggestion.value, filter);
                    }}
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="quick-stats" aria-label="Platform stats">
              <span><strong>{totals.reports}</strong> {text.submissions}</span>
              <span><strong>{totals.profiles}</strong> {text.accounts}</span>
              <span><strong>{totals.tokens}</strong> {text.tokens}</span>
            </div>
            <p className="privacy-note">{text.privacy}</p>
          </form>
        </section>

        <section className="filters" aria-label="Filters">
          {filterKeys.map((key) => (
            <button
              className={`filter-chip ${filter === key ? "active" : ""}`}
              key={key}
              type="button"
              onClick={() => handleFilter(key)}
            >
              {text.filters[key]}
            </button>
          ))}
        </section>

        {error ? <div className="alert">{error}</div> : null}

        <section className="workspace" id="wall">
          <aside className="summary-panel" aria-label="Risk ranking">
            <div className="panel-heading">
              <span>{text.trending}</span>
              <strong>Top 5</strong>
            </div>
            <ol className="ranking-list">
              {profiles.slice(0, 5).map((profile) => (
                <li key={profile.id}>
                  <span>{profile.handle}</span>
                  <strong>{profile.communityScore}</strong>
                </li>
              ))}
            </ol>

            <div className="watch-card">
              <span>{text.submissions}</span>
              <strong>{totals.reports}</strong>
              <p>{text.privacy}</p>
            </div>
          </aside>

          <section className="wall-list" aria-label="Report list">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Confess Wall</p>
                <h2>{text.wallTitle}</h2>
              </div>
              <button className="primary-button" type="button" onClick={() => setShowForm(true)}>
                {text.submit}
              </button>
            </div>

            {loading ? <article className="rug-card"><h3>{text.loading}</h3></article> : null}
            {!loading && profiles.length === 0 ? (
              <article className="rug-card">
                <h3>{text.noResults}</h3>
                <p className="meta-line">{text.noResultsBody}</p>
              </article>
            ) : null}
            <div className="cards">
              {profiles.map((profile) => {
                const alreadyVoted = votedProfiles.includes(profile.normalized);
                return (
                  <article className="rug-card" key={profile.id}>
                    <div className="card-header">
                      <div className="entity-title">
                        <h3>
                          <a href={xProfileHref(profile)} target="_blank" rel="noreferrer">
                            {profile.handle}
                          </a>
                        </h3>
                        <p className="meta-line">
                          {profile.reportCount} {text.submissions} / {profile.tokenCount} {text.tokens} / {ruggedTooLabel(profile.upvoteCount, language)}
                        </p>
                      </div>
                      <span className="chain-pill">{levelFor(profile.communityScore, language)}</span>
                    </div>

                    <div className="score-row">
                      <div>
                        <div className="tags">
                          {profile.reports.slice(0, 3).map((report) => (
                            <span className="tag" key={report.id}>{report.tokenSymbol}</span>
                          ))}
                        </div>
                      </div>
                      <div className="score-box" aria-label={`Scam Risk Score ${profile.communityScore}`}>
                        <strong>{profile.communityScore}</strong>
                        <span>{text.communityScore}</span>
                      </div>
                    </div>

                    <div className="identity-list">
                      <div className="identity-row"><span>{text.latestActivity}</span><span>{shortAge(profile.lastActivityAt)}</span></div>
                    </div>

                    <div className="action-row">
                      <button type="button" onClick={() => openProfile(profile)}>{text.view}</button>
                      <button
                        type="button"
                        className={alreadyVoted ? "is-voted" : ""}
                        disabled={alreadyVoted}
                        onClick={() => vote(profile)}
                      >
                        {alreadyVoted ? text.voted : text.vote}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </section>

        <section className="rules" id="rules">
          <div>
            <p className="eyebrow">{text.rulesEyebrow}</p>
            <h2>{text.rulesTitle}</h2>
          </div>
          <div className="rule-grid">
            <article><strong>{text.ruleOneTitle}</strong><p>{text.ruleOneBody}</p></article>
            <article><strong>{text.ruleTwoTitle}</strong><p>{text.ruleTwoBody}</p></article>
            <article><strong>{text.ruleThreeTitle}</strong><p>{text.ruleThreeBody}</p></article>
          </div>
        </section>
      </main>

      {selected ? (
        <aside className="drawer open" aria-label="Report details">
          <div className="drawer-backdrop" onClick={() => setSelected(null)} />
          <article className="drawer-panel">
            <button className="icon-button close-button" type="button" onClick={() => setSelected(null)} aria-label="Close details">X</button>
            <p className="eyebrow">{levelFor(selected.communityScore, language)}</p>
            <h2>{selected.handle}</h2>
            <div className="drawer-score">
              <div><strong>{selected.communityScore}</strong><span>{text.communityScore}</span></div>
              <div><strong>{selected.reportCount}</strong><span>{text.submissions}</span></div>
              <div><strong>{selected.tokenCount}</strong><span>{text.tokens}</span></div>
            </div>
            <div className="identity-list">
              <div className="identity-row"><span>{text.vote}</span><span>{selected.upvoteCount}</span></div>
              <div className="identity-row"><span>{text.latestActivity}</span><span>{shortAge(selected.lastActivityAt)}</span></div>
            </div>

            <h3>{text.reportedTokens}</h3>
            <div className="evidence-list">
              {selected.reports.map((report) => (
                <div className="evidence-item" key={report.id}>
                  <strong>{report.tokenSymbol}</strong> / {report.chain} / {reportTypeLabel(report.reportType, language)}
                  <br />
                  <span>{report.tokenAddress || "-"}</span>
                  {report.description ? <p>{report.description}</p> : null}
                  {report.evidenceUrl ? (
                    <a href={report.evidenceUrl} target="_blank" rel="noreferrer">
                      {report.evidenceUrl}
                    </a>
                  ) : null}
                </div>
              ))}
            </div>

            <h3>{text.activityNotes}</h3>
            <div className="evidence-list">
              <div className="evidence-item">{text.noteA}</div>
              <div className="evidence-item">{text.noteB}</div>
              <div className="evidence-item">{text.noteC}</div>
            </div>

          </article>
        </aside>
      ) : null}

      {showForm ? (
        <dialog className="report-dialog" open>
          <form className="report-form" onSubmit={submitReport} noValidate>
            <div className="dialog-heading">
              <div>
                <p className="eyebrow">{text.submit}</p>
                <h2>{text.submitTitle}</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setShowForm(false)} aria-label="Close">X</button>
            </div>
            {formError ? <div className="form-error">{formError}</div> : null}
            <label><span>{text.xAccount}</span><input name="xHandle" placeholder="@username" /></label>
            <label><span>{text.token}</span><input name="tokenSymbol" placeholder="$TOKEN" /></label>
            <div className="form-grid">
              <label><span>{text.tokenAddress}</span><input name="tokenAddress" placeholder="optional" /></label>
              <div className="field-group">
                <span>{text.chain}</span>
                <div className={`custom-select ${chainOpen ? "open" : ""}`}>
                  <button
                    type="button"
                    className="custom-select-trigger"
                    aria-haspopup="listbox"
                    aria-expanded={chainOpen}
                    onClick={() => setChainOpen((open) => !open)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") setChainOpen(false);
                    }}
                  >
                    <span>{chain || text.chooseChain}</span>
                    <span className="select-chevron">v</span>
                  </button>
                  {chainOpen ? (
                    <div className="custom-select-menu" role="listbox">
                      {chainOptions.map((option) => (
                        <button
                          type="button"
                          role="option"
                          aria-selected={chain === option}
                          className={chain === option ? "selected" : ""}
                          key={option}
                          onClick={() => {
                            setChain(option);
                            setChainOpen(false);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <label>
              <span>{text.reportType}</span>
              <select name="reportType" required>
                {reportTypeOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {text.reportTypes[option.key]}
                  </option>
                ))}
              </select>
            </label>
            <label><span>{text.description}</span><textarea name="description" placeholder={text.whatHappened} /></label>
            <label><span>{text.evidenceUrl}</span><input name="evidenceUrl" type="url" placeholder="https://..." /></label>
            <div className="form-actions">
              <button className="ghost-button" type="button" onClick={() => setShowForm(false)}>{text.cancel}</button>
              <button className="primary-button" type="submit" disabled={submitting}>{submitting ? "..." : text.create}</button>
            </div>
          </form>
        </dialog>
      ) : null}
    </>
  );
}
