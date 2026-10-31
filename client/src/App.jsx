import React, { useEffect, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Clapperboard,
  Languages,
  Menu,
  ShieldCheck,
  Film,
  ArrowRight,
  Sparkles,
  Users,
  Trophy,
  MessageSquare,
  LogOut,
  LockKeyhole,
  CheckCircle2,
  Eye,
  EyeOff
} from "lucide-react"; import i18n from "./i18n";
import { api, saveSession, getUser, clearSession } from "./api";

function Header({ user, onLogout }) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const changeLanguage = async (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem("actverse-language", language);
    if (getUser()) api("/auth/language", { method: "PATCH", body: JSON.stringify({ language }) }).catch(() => { });
  };
  return <header className="site-header"><Link to="/" className="brand"><span className="brand-mark"><Clapperboard size={21} /></span><span>ActVerse</span></Link>
    <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu"><Menu /></button>
    <nav className={menuOpen ? "nav-links open" : "nav-links"}>
      <NavLink to="/">{t("home")}</NavLink><NavLink to="/rules">{t("rules")}</NavLink><NavLink to="/portfolio">{t("portfolio")}</NavLink>
      <NavLink to="/game">{t("dashboard")}</NavLink>
    </nav>
    <div className="header-actions"><div className="lang-switch"><Languages size={15} /><button className={i18n.language === "en" ? "selected" : ""} onClick={() => changeLanguage("en")}>EN</button><span>/</span><button className={i18n.language === "ta" ? "selected" : ""} onClick={() => changeLanguage("ta")}>தமிழ்</button></div>
      {user ? <button className="button button-ghost button-small" onClick={onLogout}><LogOut size={15} />{t("logout")}</button> : <><Link className="button button-ghost button-small" to="/login">{t("login")}</Link><Link className="button button-primary button-small" to="/register">{t("register")}</Link></>}
    </div>
  </header>;
}

function Footer() { return <footer className="footer"><span>© {new Date().getFullYear()} ActVerse</span><span>Your Dialogue. My Performance. Your Verdict.</span><Link to="/rules">Rules & Privacy</Link></footer>; }

function Home() {
  const { t } = useTranslation();
  return <><section className="hero"><div className="hero-copy"><div className="eyebrow"><Sparkles size={15} /> FAN-POWERED ACTING CHALLENGES</div><h1>{t("tagline1")}<br /><span>{t("tagline2")}</span><br />{t("tagline3")}</h1><p>{t("heroCopy")}</p><div className="hero-actions"><Link className="button button-primary" to="/rules">{t("getStarted")} <ArrowRight size={17} /></Link><Link className="button button-ghost" to="/portfolio"><Film size={17} />{t("portfolio")}</Link></div><div className="hero-trust"><span><CheckCircle2 size={15} /> Fan-powered</span><span><ShieldCheck size={15} /> Secure access</span><span><Languages size={15} /> English + தமிழ்</span></div></div><div className="hero-art"><div className="spotlight"></div><div className="film-card"><Clapperboard size={62} /><span>ACT</span><span>CREATE</span><span>JUDGE</span></div><div className="hero-caption"><span className="live-dot"></span>YOUR NEXT SCENE STARTS HERE</div></div></section>
    <section className="section"><div className="section-heading"><span className="eyebrow">HOW IT WORKS</span><h2>From fan dialogue to final verdict.</h2><p>Simple steps. Your words. A creator's performance.</p></div><div className="steps-grid"><article className="step-card"><span className="step-number">01</span><MessageSquare /><h3>Submit a dialogue</h3><p>Share a line and choose a private emotion.</p></article><article className="step-card"><span className="step-number">02</span><Film /><h3>Watch the performance</h3><p>Watch the creator's public Instagram performance.</p></article><article className="step-card"><span className="step-number">03</span><Trophy /><h3>Give your verdict</h3><p>Vote PASS or FAIL and build your score.</p></article></div></section>
    <section className="cta-panel"><div><span className="eyebrow">YOUR TURN</span><h2>Got a dialogue in mind?</h2><p>Join the community and help create the next scene.</p></div><Link to="/register" className="button button-primary">Join ActVerse <ArrowRight size={17} /></Link></section></>;
}

function Rules() {
  const { t } = useTranslation();
  const sections = [
    ["01", "Platform overview", "ActVerse is a fan-powered acting challenge platform. Fans submit dialogue, the creator performs it, and fans submit a final verdict."],
    ["02", "Dialogue submissions", "Submit original or permitted dialogue. Choose a secret emotion and create a private reveal password. Share that password with the influencer separately so it can be shared with viewers."],
    ["03", "Public challenges", "Submitted dialogues appear publicly. No task access password or admin approval is required. The creator adds the Instagram performance link when the task is complete."],
    ["04", "Emotion reveal & voting", "Any visitor, fan or influencer can enter the password shared by the influencer to reveal the secret emotion. A successful reveal is required before voting. Each browser identity can submit one final PASS or FAIL vote per challenge. Feedback must be respectful."],
    ["05", "Scoring", "Points are awarded for eligible dialogue submissions, creator-completed challenges and valid participation. Repeated events must not award duplicate points."],
    ["06", "Five-day expiry", "Five days after activation, the challenge expires and is no longer available for public voting. Accounts and cumulative score summaries remain."],
    ["07", "Privacy and safety", "Submitting a dialogue requires registration and current rules acceptance. Public visitors can browse challenges and watch available performances. The private emotion is only revealed after the correct reveal password is entered."],
    ["08", "Fair play", "Do not spam, harass, submit illegal content or attempt to bypass access controls. Admins may remove abusive submissions or restrict accounts."]
  ];
  return <div className="page-wrap"><div className="page-heading"><span className="eyebrow"><ShieldCheck size={15} /> PLAY FAIR</span><h1>{t("rulesTitle")}</h1><p>{t("rulesIntro")}</p></div><div className="rules-layout"><aside className="rules-aside"><div className="rules-icon"><ShieldCheck size={27} /></div><h3>Before you join</h3><p>Take a moment to understand how ActVerse works and how your data is handled.</p><div className="rules-meta"><span>Rules version</span><strong>1.0</strong></div><div className="rules-meta"><span>Challenge duration</span><strong>5 days</strong></div></aside><div className="rules-list">{sections.map(([n, title, body]) => <article className="rule-item" key={n}><span className="rule-number">{n}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}</div></div><p className="fine-print">This page is a product starter's rules draft, not legal advice. Review the final Terms and Privacy Policy before public launch.</p></div>;
}

function Portfolio() {
  const { t } = useTranslation();
  return <div className="page-wrap portfolio-page"><section className="portfolio-hero"><div className="portfolio-avatar"><img src="/vijay-surya.png" alt="Vijay Surya" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} /></div><div><span className="eyebrow">CREATOR • ACTOR • STORYTELLER</span><h1>Vijay Surya</h1><p>{t("bio")}</p><p className="muted">{t("portfolioIntro")}</p><div className="hero-actions"><a className="button button-primary" href="https://www.instagram.com/vijaysuryaoffl/" target="_blank" rel="noreferrer">Instagram <ArrowRight size={16} /></a><a className="button button-ghost" href="https://youtube.com/@middleclassvijay" target="_blank" rel="noreferrer">YouTube</a><a className="button button-ghost" href="https://www.facebook.com/share/1CpLHJK19a/" target="_blank" rel="noreferrer">Facebook</a></div></div></section><div className="section-heading left-heading"><span className="eyebrow">{t("featured")}</span><h2>Performances worth replaying.</h2><p>Follow Vijay Surya on his official social channels. Featured videos can be added later.</p></div><div className="portfolio-grid">{["Emotional scene", "Comedy dialogue", "Mass scene"].map((name, i) => <article className="portfolio-card" key={name}><div className={`portfolio-thumb thumb-${i + 1}`}><Film size={34} /><span>FEATURED TAKE 0{i + 1}</span></div><div className="portfolio-card-body"><h3>{name}</h3><p>More performances coming soon</p></div></article>)}</div></div>;
}


function AuthPage({ mode, onAuth }) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "fan"
  });

  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState("credentials");
  const [error, setError] = useState("");
  const [infoMessage] = useState(location.state?.message || "");
  const [busy, setBusy] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (
      mode === "register" &&
      form.password !== form.confirmPassword
    ) {
      return setError("Passwords do not match.");
    }

    setBusy(true);

    try {
      const result = await api(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(form)
      });

      // LOGIN: Direct login without OTP
      if (mode === "login") {
        saveSession(result);
        onAuth(result.user);

        nav(
          result.user.acceptedRulesVersion
            ? "/game"
            : "/rules/accept"
        );

        return;
      }

      // REGISTER: Email OTP verification required
      setStage("otp");

    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function verify(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const result = await api("/auth/register/verify", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          otp
        })
      });

      saveSession(result);
      onAuth(result.user);

      nav(
        result.user.acceptedRulesVersion
          ? "/game"
          : "/rules/accept"
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">

        <div className="auth-mark">
          <Clapperboard size={30} />
        </div>

        <span className="eyebrow">WELCOME TO ACTVERSE</span>

        <h1>
          {stage === "otp"
            ? "Verify your email"
            : mode === "login"
              ? t("loginTitle")
              : t("registerTitle")}
        </h1>

        {infoMessage && <div className="notice global-message">{infoMessage}</div>}

        <p>
          {stage === "otp"
            ? `We sent a 6-digit code to ${form.email}.`
            : mode === "login"
              ? "Continue your journey."
              : "Join the community and take the challenge."}
        </p>

        {stage === "credentials" ? (

          <form onSubmit={submit} className="form-stack">

            {mode === "register" && (
              <label>
                Account type
                <select
                  value={form.accountType}
                  onChange={e => setForm({ ...form, accountType: e.target.value })}
                >
                  <option value="fan">Fan</option>
                  <option value="influencer">Influencer</option>
                </select>
                <small>Influencer accounts require admin approval before challenge access.</small>
              </label>
            )}

            {mode === "register" && (
              <label>
                {t("username")}

                <input
                  required
                  minLength="2"
                  maxLength="30"
                  value={form.username}
                  onChange={e =>
                    setForm({
                      ...form,
                      username: e.target.value
                    })
                  }
                />
              </label>
            )}

            <label>
              {t("email")}

              <input
                type="email"
                required
                value={form.email}
                onChange={e =>
                  setForm({
                    ...form,
                    email: e.target.value
                  })
                }
              />
            </label>

            <label>
              {t("password")}

              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  minLength="8"
                  required
                  value={form.password}
                  onChange={e =>
                    setForm({
                      ...form,
                      password: e.target.value
                    })
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  title={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword
                    ? <EyeOff size={20} />
                    : <Eye size={20} />}
                </button>
              </div>
            </label>

            {mode === "register" && (
              <label>
                {t("confirmPassword")}

                <div className="password-field">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    minLength="8"
                    required
                    value={form.confirmPassword}
                    onChange={e =>
                      setForm({
                        ...form,
                        confirmPassword: e.target.value
                      })
                    }
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    title={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword
                      ? <EyeOff size={20} />
                      : <Eye size={20} />}
                  </button>
                </div>
              </label>
            )}

            {error && (
              <div className="error-message">{error}</div>
            )}

            <button
              disabled={busy}
              className="button button-primary button-full"
            >
              {busy
                ? "Please wait…"
                : mode === "login"
                  ? "Continue"
                  : "Create account"}
            </button>

          </form>

        ) : (

          <form onSubmit={verify} className="form-stack">

            <label>
              6-digit OTP

              <input
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength="6"
                required
                value={otp}
                onChange={e =>
                  setOtp(
                    e.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
              />
            </label>

            {error && (
              <div className="error-message">{error}</div>
            )}

            <button
              disabled={busy || otp.length !== 6}
              className="button button-primary button-full"
            >
              {busy ? "Verifying…" : "Verify & continue"}
            </button>

            <button
              type="button"
              className="button button-ghost button-full"
              onClick={() => {
                setStage("credentials");
                setOtp("");
                setError("");
              }}
            >
              Back
            </button>

          </form>
        )}

        <p className="auth-switch">
          {mode === "login"
            ? "New to ActVerse?"
            : "Already have an account?"}

          {" "}

          <Link to={mode === "login" ? "/register" : "/login"}>
            {mode === "login" ? t("register") : t("login")}
          </Link>
        </p>

      </div>
    </div>
  );
}


function AcceptRules({ user, onUserUpdate }) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  async function accept() {
    if (!accepted) return;
    try { const result = await api("/auth/accept-rules", { method: "POST", body: "{}" }); localStorage.setItem("actverse-user", JSON.stringify(result.user)); onUserUpdate(result.user); nav("/game"); }
    catch (e) { setError(e.message); }
  }
  return <div className="auth-wrap"><div className="auth-card"><div className="auth-mark"><ShieldCheck size={30} /></div><h1>Accept Rules & Regulations</h1><p>Read the current rules before entering protected game features.</p><Link className="inline-link" to="/rules">Read the complete rules</Link><label className="checkbox-line"><input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} /><span>{t("acceptRules")} <strong>(Version 1.0)</strong></span></label>{error && <div className="error-message">{error}</div>}<button disabled={!accepted} onClick={accept} className="button button-primary button-full">{t("continue")}</button></div></div>;
}

function Game({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState("active");
  const [challenges, setChallenges] = useState([]);
  const [mine, setMine] = useState([]);
  const [dialogue, setDialogue] = useState("");
  const [emotion, setEmotion] = useState("happy");
  const [privateEmotionPassword, setPrivateEmotionPassword] = useState("");
  const [confirmEmotionPassword, setConfirmEmotionPassword] = useState("");
  const [showEmotionPassword, setShowEmotionPassword] = useState(false);
  const [showConfirmEmotionPassword, setShowConfirmEmotionPassword] = useState(false);
  const [votes, setVotes] = useState({});
  const [feedback, setFeedback] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [overview, setOverview] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [adminQueue, setAdminQueue] = useState([]);
  const [pendingInfluencers, setPendingInfluencers] = useState([]);
  const [influencerChallenges, setInfluencerChallenges] = useState([]);
  const [publish, setPublish] = useState({});
  const [revealPasswords, setRevealPasswords] = useState({});
  const [revealedEmotions, setRevealedEmotions] = useState({});
  const [revealTokens, setRevealTokens] = useState({});
  const [votedChallenges, setVotedChallenges] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("actverse-voted-challenges") || "{}");
    } catch {
      return {};
    }
  });
  const [stats, setStats] = useState(null);
  const isAdmin = user?.role === "admin";
  const isInfluencer = user?.role === "influencer" && user?.influencerStatus === "approved";
  async function load() {
    setError("");
    try {
      const result = await api("/challenges");
      setChallenges(result.challenges || []);
      if (user) { const mineResult = await api("/challenges/mine"); setMine(mineResult.challenges || []); }
      const lb = await api("/challenges/leaderboard");
      setLeaderboard(lb.leaderboard || []);
      if (isAdmin) {
        const o = await api("/challenges/admin/overview");
        setOverview(o);
        const q = await api("/challenges/admin/all");
        setAdminQueue(q.challenges || []);
        const applications = await api("/auth/admin/influencers/pending");
        setPendingInfluencers(applications.applications || []);
      }
      if (isInfluencer) {
        const available = await api("/challenges/influencer/available");
        setInfluencerChallenges(available.challenges || []);
      }
    } catch (e) { setError(e.message); }
  }
  useEffect(() => { load(); }, []);
  async function submitDialogue(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (privateEmotionPassword.length < 4) {
      setError("Reveal password must contain at least 4 characters.");
      return;
    }

    if (privateEmotionPassword !== confirmEmotionPassword) {
      setError("Reveal passwords do not match.");
      return;
    }

    try {
      await api("/challenges", {
        method: "POST",
        body: JSON.stringify({
          dialogue,
          privateEmotion: emotion,
          privateEmotionPassword
        })
      });

      setDialogue("");
      setEmotion("happy");
      setPrivateEmotionPassword("");
      setConfirmEmotionPassword("");

      setMessage("Dialogue submitted and published successfully!");
      await load();
    } catch (e) {
      setError(e.message);
    }
  }
  function getVoterId() {
    let voterId = localStorage.getItem("actverse-voter-id");

    if (!voterId) {
      voterId = (
        window.crypto?.randomUUID
          ? window.crypto.randomUUID()
          : `${Date.now()}${Math.random()}${Math.random()}`
      ).replace(/-/g, "");

      localStorage.setItem("actverse-voter-id", voterId);
    }

    return voterId;
  }

  async function vote(id) {
    setMessage("");
    setError("");

    if (!revealedEmotions[id] || !revealTokens[id]) {
      setError("Reveal the fan's emotion with the shared password before voting.");
      return;
    }

    if (!votes[id]) {
      setError("Please choose PASS or FAIL.");
      return;
    }

    try {
      const voterId = getVoterId();

      await api(`/challenges/${id}/vote`, {
        method: "POST",
        body: JSON.stringify({
          verdict: votes[id],
          feedback: feedback[id] || "",
          voterId,
          revealToken: revealTokens[id]
        })
      });

      const updatedVoted = {
        ...votedChallenges,
        [id]: {
          verdict: votes[id],
          votedAt: new Date().toISOString()
        }
      };
      setVotedChallenges(updatedVoted);
      localStorage.setItem(
        "actverse-voted-challenges",
        JSON.stringify(updatedVoted)
      );

      setMessage("Your vote has been recorded successfully.");
      setVotes(previous => ({ ...previous, [id]: "" }));
      setFeedback(previous => ({ ...previous, [id]: "" }));
      await load();
    } catch (e) {
      setError(e.message);
    }
  }
  async function publishChallenge(id) {
    try { await api(`/challenges/${id}/publish`, { method: "POST", body: JSON.stringify(publish[id] || {}) }); setMessage("Instagram link saved."); await load(); }
    catch (e) { setError(e.message); }
  }
  async function acceptChallenge(id) {
    setError("");
    setMessage("");
    try {
      await api(`/challenges/${id}/accept`, {
        method: "POST",
        body: "{}"
      });
      setMessage("Challenge accepted! You can now perform it and publish your Instagram link.");
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function reviewInfluencer(id, action) {
    setError("");
    setMessage("");
    try {
      const result = await api(`/auth/admin/influencers/${id}/${action}`, {
        method: "POST",
        body: "{}"
      });
      setMessage(result.message || `Influencer application ${action}d.`);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function revealEmotion(id) {
    setMessage("");
    setError("");

    if (!String(revealPasswords[id] || "").trim()) {
      setError("Enter the private emotion password shared by the influencer.");
      return;
    }

    try {
      const voterId = getVoterId();

      const result = await api(`/challenges/${id}/reveal-emotion`, {
        method: "POST",
        body: JSON.stringify({
          password: revealPasswords[id],
          voterId
        })
      });

      setRevealedEmotions(previous => ({
        ...previous,
        [id]: result.emotion
      }));

      setRevealTokens(previous => ({
        ...previous,
        [id]: result.revealToken
      }));

      setMessage("Fan's emotion revealed successfully! You can now vote.");
    } catch (e) {
      setError(e.message);
    }
  }
  function handleTabChange(nextTab) {
    setError("");
    setMessage("");

    if (nextTab === "submit" && !user) {
      navigate("/login", {
        state: {
          message: "Please log in or register to submit a dialogue challenge."
        }
      });
      return;
    }

    setTab(nextTab);
  }
  return <div className="page-wrap game-page"><div className="dashboard-heading"><div><span className="eyebrow">ACTVERSE COMMUNITY</span><h1>{isAdmin ? t("adminDashboard") : user ? `${t("welcome")}, ${user.username}!` : "Explore Challenges"}</h1><p>Give dialogues, watch performances and show your support.</p></div><div className="user-chip"><span className="user-avatar">{(user?.username || "G").slice(0, 1).toUpperCase()}</span><span>{user?.username || "Guest"}<small>{isAdmin ? "Admin / Creator" : isInfluencer ? "Approved Influencer" : user?.influencerStatus === "pending" ? "Fan · Influencer pending" : user ? "Fan" : "Public visitor"}</small></span></div></div>
    {error && <div className="error-message global-message">{error}</div>}{message && <div className="success-message global-message">{message}</div>}
    {isAdmin && overview && <div className="stats-grid"><Stat icon={<Users />} label={t("registeredMembers")} value={overview.registeredMembers} /><Stat icon={<ShieldCheck />} label="Logins (24h)" value={overview.loginsToday} /><Stat icon={<MessageSquare />} label={t("totalDialogues")} value={overview.totalDialogues} /><Stat icon={<Trophy />} label={t("totalVotes")} value={overview.totalVotes} /></div>}
    <div className="tab-bar">{(isAdmin ? ["active", "applications", "mine", "leaderboard"] : isInfluencer ? ["active", "influencer", "mine", "leaderboard"] : ["active", "all", "mine", "submit", "leaderboard"]).map(k => <button key={k} className={tab === k ? "active" : ""} onClick={() => handleTabChange(k)}>{({ active: t("activeChallenges"), all: t("allDialogues"), mine: t("mySubmissions"), submit: t("submitDialogue"), leaderboard: t("leaderboard"), applications: "Influencer Applications", influencer: "Available Challenges" })[k]}</button>)}</div>
    {tab === "submit" && user && !isAdmin && <form className="panel submit-form" onSubmit={submitDialogue}><h2>{t("submitDialogue")}</h2><p>Share the line you want the creator to perform.</p><label>{t("dialoguePlaceholder")}<textarea required minLength="2" maxLength="1000" rows="5" value={dialogue} onChange={e => setDialogue(e.target.value)} /><span className="char-count">{dialogue.length}/1000</span></label><label>{t("selectEmotion")}<select value={emotion} onChange={e => setEmotion(e.target.value)}>{["happy", "sad", "angry", "joyful", "romantic", "motivational", "other"].map(x => <option key={x} value={x}>{t(x)}</option>)}</select></label><div className="password-input-group">
      <label htmlFor="private-emotion-password">Private Emotion Reveal Password</label>
      <div className="password-field">
        <input
          id="private-emotion-password"
          type={showEmotionPassword ? "text" : "password"}
          value={privateEmotionPassword}
          onChange={(e) => setPrivateEmotionPassword(e.target.value)}
          placeholder="Create a private reveal password"
          minLength={4}
          maxLength={64}
          autoComplete="new-password"
          required
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowEmotionPassword(value => !value)}
          aria-label={showEmotionPassword ? "Hide reveal password" : "Show reveal password"}
          title={showEmotionPassword ? "Hide password" : "Show password"}
        >
          {showEmotionPassword ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>
    </div>

      <div className="password-input-group">
        <label htmlFor="confirm-emotion-password">Confirm Reveal Password</label>
        <div className="password-field">
          <input
            id="confirm-emotion-password"
            type={showConfirmEmotionPassword ? "text" : "password"}
            value={confirmEmotionPassword}
            onChange={(e) => setConfirmEmotionPassword(e.target.value)}
            placeholder="Confirm your reveal password"
            minLength={4}
            maxLength={64}
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmEmotionPassword(value => !value)}
            aria-label={showConfirmEmotionPassword ? "Hide confirmation password" : "Show confirmation password"}
            title={showConfirmEmotionPassword ? "Hide password" : "Show password"}
          >
            {showConfirmEmotionPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>
      </div>

      <p>
        Keep this password private until you share it with the influencer separately.
        The influencer can share it in their Instagram Story so other fans can reveal the emotion.
      </p><div className="notice"><LockKeyhole size={16} /> Your emotion stays hidden until someone enters the correct reveal password.</div><button className="button button-primary">{t("submitDialogue")}</button></form>}
    {tab === "active" && <div className="challenge-grid">{challenges.filter(c => ["active", "completed"].includes(c.status)).map(c => <article className="challenge-card" key={c._id}><div className="challenge-top"><span className="status-pill">{c.status.toUpperCase()}</span>{c.expiresAt && <span className="muted">{Math.max(0, Math.ceil((new Date(c.expiresAt) - Date.now()) / 86400000))} days left</span>}</div><blockquote>{c.dialogue}</blockquote>{c.instagramUrl && <a className="instagram-link" href={c.instagramUrl} target="_blank" rel="noreferrer">{t("watchInstagram")} ↗</a>}
      <div className="emotion-reveal-section">
        <h4>🔐 Reveal the Fan's Secret Emotion</h4>
        {revealedEmotions[c._id] ? (
          <div className="notice"><strong>Revealed Emotion:</strong> {revealedEmotions[c._id].toUpperCase()}</div>
        ) : (
          <>
            <p>Enter the password shared by the influencer to reveal the emotion.</p>
            <input
              type="password"
              placeholder="Enter private emotion password"
              value={revealPasswords[c._id] || ""}
              onChange={e => setRevealPasswords(previous => ({ ...previous, [c._id]: e.target.value }))}
            />
            <button className="button button-primary button-full" disabled={!revealPasswords[c._id]} onClick={() => revealEmotion(c._id)}>Reveal Emotion</button>
          </>
        )}
      </div>
      {c.status === "active" && (
        votedChallenges[c._id] ? (
          <div className="vote-box vote-recorded">
            <div className="success-message">
              <strong>✓ Vote already recorded</strong>
              <p>Your {votedChallenges[c._id].verdict} vote has been submitted for this challenge.</p>
              <small>You can watch the performance and view the revealed emotion, but you cannot vote again.</small>
            </div>
          </div>
        ) : (
          <div className="vote-box">
            <p>{revealedEmotions[c._id] ? "Now give your verdict. Did the performance match your expectation?" : "Reveal the secret emotion before voting."}</p>
            <div className="vote-actions">
              <button disabled={!revealedEmotions[c._id]} className={votes[c._id] === "PASS" ? "vote-pass selected" : "vote-pass"} onClick={() => setVotes({ ...votes, [c._id]: "PASS" })}>✓ {t("pass")}</button>
              <button disabled={!revealedEmotions[c._id]} className={votes[c._id] === "FAIL" ? "vote-fail selected" : "vote-fail"} onClick={() => setVotes({ ...votes, [c._id]: "FAIL" })}>✕ {t("fail")}</button>
            </div>
            <textarea disabled={!revealedEmotions[c._id]} rows="2" placeholder={t("feedback")} value={feedback[c._id] || ""} onChange={e => setFeedback({ ...feedback, [c._id]: e.target.value })} />
            <button className="button button-primary button-full" disabled={!revealedEmotions[c._id] || !votes[c._id]} onClick={() => vote(c._id)}>{t("submitVote")}</button>
          </div>
        )
      )}</article>)}{challenges.filter(c => ["active", "completed"].includes(c.status)).length === 0 && <Empty text={t("noChallenges")} />}</div>}
    {tab === "all" && <div className="challenge-grid">{challenges.map(c => <article className="challenge-card" key={c._id}><span className="status-pill">{c.status.toUpperCase()}</span><blockquote>{c.dialogue}</blockquote>{c.instagramUrl && <a className="instagram-link" href={c.instagramUrl} target="_blank" rel="noreferrer">{t("watchInstagram")} ↗</a>}
      <div className="emotion-reveal-section">
        <h4>🔐 Reveal the Fan's Secret Emotion</h4>
        {revealedEmotions[c._id] ? (
          <div className="notice"><strong>Revealed Emotion:</strong> {revealedEmotions[c._id].toUpperCase()}</div>
        ) : (
          <>
            <p>Enter the password shared by the influencer.</p>
            <input type="password" placeholder="Enter private emotion password" value={revealPasswords[c._id] || ""} onChange={e => setRevealPasswords(previous => ({ ...previous, [c._id]: e.target.value }))} />
            <button className="button button-primary button-full" disabled={!revealPasswords[c._id]} onClick={() => revealEmotion(c._id)}>Reveal Emotion</button>
          </>
        )}
      </div>
      <span className="muted">Submitted {new Date(c.createdAt).toLocaleDateString()}</span></article>)}</div>}
    {tab === "mine" && <div className="challenge-grid">{mine.map(c => <article className="challenge-card" key={c._id}><span className="status-pill">{c.status.toUpperCase()}</span><blockquote>{c.dialogue}</blockquote>{c.expiresAt && <span className="muted">Expires {new Date(c.expiresAt).toLocaleString()}</span>}</article>)}{mine.length === 0 && <Empty text="No submissions yet." />}</div>}
    {isAdmin && tab === "active" && <div className="queue-list">{challenges.filter(c => ["active", "completed"].includes(c.status)).map(c => <article className="queue-item" key={c._id}><div><span className="status-pill">{c.status.toUpperCase()}</span><p>{c.dialogue}</p><small className="muted">Expires {c.expiresAt ? new Date(c.expiresAt).toLocaleString() : "—"}</small>{c.instagramUrl && <a className="instagram-link" href={c.instagramUrl} target="_blank" rel="noreferrer">View published Instagram link ↗</a>}</div><div className="publish-fields"><input type="url" placeholder="Instagram post URL" value={publish[c._id]?.instagramUrl || c.instagramUrl || ""} onChange={e => setPublish({ ...publish, [c._id]: { ...publish[c._id], instagramUrl: e.target.value } })} /><button className="button button-primary" onClick={() => publishChallenge(c._id)}>Publish Instagram link</button><div className="emotion-reveal-section"><h4>🔐 Reveal Fan's Private Emotion</h4><input type="password" placeholder="Enter fan's private reveal password" value={revealPasswords[c._id] || ""} onChange={e => setRevealPasswords(previous => ({ ...previous, [c._id]: e.target.value }))} /><button className="button button-primary" onClick={() => revealEmotion(c._id)}>Reveal Emotion</button>{revealedEmotions[c._id] && <div className="notice"><strong>Fan's Selected Emotion:</strong>{" "}{revealedEmotions[c._id].toUpperCase()}</div>}</div></div></article>)}</div>}
    {tab === "influencer" && isInfluencer && <div className="challenge-grid">
      {influencerChallenges.map(c => <article className="challenge-card" key={c._id}>
        <span className="status-pill">{c.acceptedBy ? "ACCEPTED BY YOU" : "AVAILABLE"}</span>
        <blockquote>{c.dialogue}</blockquote>
        <p className="muted">Expires {c.expiresAt ? new Date(c.expiresAt).toLocaleString() : "—"}</p>
        {c.acceptedBy
          ? <div className="notice">You have accepted this challenge. Publish your Instagram link when your performance is live.</div>
          : <button className="button button-primary button-full" onClick={() => acceptChallenge(c._id)}>Accept Challenge</button>}
        {c.acceptedBy && <div className="publish-fields">
          <input type="url" placeholder="Instagram post / reel URL" value={publish[c._id]?.instagramUrl || ""} onChange={e => setPublish(previous => ({ ...previous, [c._id]: { ...previous[c._id], instagramUrl: e.target.value } }))} />
          <button className="button button-primary button-full" disabled={!publish[c._id]?.instagramUrl} onClick={() => publishChallenge(c._id)}>Publish Instagram Link</button>
        </div>}
      </article>)}
      {influencerChallenges.length === 0 && <Empty text="No available challenges right now." />}
    </div>}

    {tab === "applications" && isAdmin && <div className="queue-list">
      {pendingInfluencers.map(applicant => <article className="queue-item" key={applicant._id}>
        <div><span className="status-pill">PENDING</span><h3>{applicant.username}</h3><p>{applicant.email}</p><small className="muted">Requested {applicant.influencerRequestedAt ? new Date(applicant.influencerRequestedAt).toLocaleString() : "—"}</small></div>
        <div className="publish-fields">
          <button className="button button-primary" onClick={() => reviewInfluencer(applicant._id, "approve")}>Approve</button>
          <button className="button button-ghost" onClick={() => reviewInfluencer(applicant._id, "reject")}>Reject</button>
        </div>
      </article>)}
      {pendingInfluencers.length === 0 && <Empty text="No pending influencer applications." />}
    </div>}

    {tab === "leaderboard" && <div className="panel"><h2>{t("leaderboard")}</h2><div className="table-wrap"><table><thead><tr><th>#</th><th>Username</th><th>{t("score")}</th><th>{t("completedTasks")}</th></tr></thead><tbody>{leaderboard.map((row, i) => <tr key={row.username}><td>{i + 1}</td><td>{row.username}</td><td>{row.cumulativeScore}</td><td>{row.completedTasks}</td></tr>)}</tbody></table></div></div>}
  </div>;
}
function Stat({ icon, label, value }) { return <article className="stat-card"><span className="stat-icon">{icon}</span><div><span>{label}</span><strong>{value}</strong></div></article>; }
function Empty({ text }) { return <div className="empty-state"><Film size={27} /><p>{text}</p></div>; }

export default function App() {
  const [user, setUser] = useState(getUser());
  const location = useLocation();
  useEffect(() => {
    if (getUser()) api("/auth/me").then(r => setUser(r.user)).catch(() => { clearSession(); setUser(null); });
  }, []);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [location.pathname]);
  function logout() { clearSession(); setUser(null); window.location.href = "/"; }
  return <div className="app-shell"><Header user={user} onLogout={logout} /><main>
    <Routes>
      <Route path="/" element={<Home />} /><Route path="/rules" element={<Rules />} /><Route path="/portfolio" element={<Portfolio />} />
      <Route path="/login" element={<AuthPage mode="login" onAuth={setUser} />} /><Route path="/register" element={<AuthPage mode="register" onAuth={setUser} />} />
      <Route path="/rules/accept" element={user ? <AcceptRules user={user} onUserUpdate={setUser} /> : <AuthPage mode="login" onAuth={setUser} />} />
      <Route path="/game" element={<Game user={user} />} />
      <Route path="*" element={<Home />} />
    </Routes>
  </main><Footer /></div>;
}
