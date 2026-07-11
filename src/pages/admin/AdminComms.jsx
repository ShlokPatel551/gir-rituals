import { useEffect, useRef, useState } from "react";
import { api } from "../../lib/api";
import "./AdminComms.css";

const PALETTE = [
  { bg: "#d1fae5", color: "#065f46" },
  { bg: "#dbeafe", color: "#1e40af" },
  { bg: "#fef3c7", color: "#92400e" },
  { bg: "#f3e8ff", color: "#6b21a8" },
  { bg: "#fce7f3", color: "#9d174d" },
  { bg: "#e0f2fe", color: "#0c4a6e" },
];

const CHANNELS = [
  { id: "all",      label: "All Messages", icon: "chat_bubble" },
  { id: "whatsapp", label: "WhatsApp",     icon: "forum"       },
  { id: "sms",      label: "SMS",          icon: "sms"         },
  { id: "email",    label: "Email",        icon: "mail"        },
];

const CH_BADGE = {
  whatsapp: { label: "WHATSAPP", bg: "#dcfce7", color: "#166534" },
  email:    { label: "EMAIL",    bg: "#dbeafe", color: "#1e40af" },
  sms:      { label: "SMS",      bg: "#fef3c7", color: "#92400e" },
};

const ROLE_META = {
  owner:      { label: "Owner",      bg: "#f3e8ff", color: "#6b21a8" },
  manager:    { label: "Manager",    bg: "#dbeafe", color: "#1e40af" },
  accountant: { label: "Accountant", bg: "#fef3c7", color: "#92400e" },
};

const QUICK_TEMPLATES = [
  { label: "Delivery Status",  text: "Your delivery is on its way and will arrive within the next 30 minutes." },
  { label: "Payment Reminder", text: "Gentle reminder: your payment is due soon. Please complete it at your earliest convenience." },
  { label: "Order Confirmed",  text: "Your order has been confirmed and is currently being prepared for dispatch." },
  { label: "Holiday Notice",   text: "Please note there will be no delivery on the upcoming holiday. Normal service resumes the next day." },
];

function palette(idx) { return PALETTE[idx % PALETTE.length]; }

function convInitials(c) {
  const name = (c.first_name || c.client_id || "?");
  const last  = c.last_name || "";
  return `${name[0] || "?"}${last[0] || ""}`.toUpperCase();
}

function convName(c) {
  if (c.first_name) return `${c.first_name} ${c.last_name || ""}`.trim();
  return c.client_id || "Unknown";
}

function fmtAge(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  if (h < 48) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function fmtTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function resizeTA(ref) {
  const ta = ref.current;
  if (!ta) return;
  ta.style.height = "auto";
  ta.style.height = `${Math.min(ta.scrollHeight, 128)}px`;
}

function AdminComms() {
  const [view, setView] = useState("inbox");

  // ── Inbox ──
  const [conversations, setConversations] = useState([]);
  const [activeId,      setActiveId]      = useState(null);
  const [messages,      setMessages]      = useState({});
  const [channel,       setChannel]       = useState("all");
  const [draft,         setDraft]         = useState("");
  const [sending,       setSending]       = useState(false);

  // ── Broadcast ──
  const [broadcasts, setBroadcasts] = useState([]);
  const [bTitle,     setBTitle]     = useState("");
  const [bBody,      setBBody]      = useState("");
  const [bChannel,   setBChannel]   = useState("whatsapp");
  const [bSegment,   setBSegment]   = useState("all");
  const [bSending,   setBSending]   = useState(false);
  const [bSuccess,   setBSuccess]   = useState(false);

  // ── Team ──
  const [team,        setTeam]        = useState([]);
  const [teamDraft,   setTeamDraft]   = useState("");
  const [teamSending, setTeamSending] = useState(false);

  const taRef      = useRef(null);
  const teamTARef  = useRef(null);
  const msgsEnd    = useRef(null);
  const teamEnd    = useRef(null);

  // ── Load data per view ──
  useEffect(() => {
    if (view !== "inbox") return;
    api.adminCommsConversations()
      .then(d => {
        const rows = d.rows ?? [];
        setConversations(rows);
        if (rows.length && !activeId) setActiveId(rows[0].id);
      })
      .catch(() => {});
  }, [view]);

  useEffect(() => {
    if (!activeId) return;
    api.adminCommsMessages(activeId)
      .then(d => {
        setMessages(prev => ({ ...prev, [activeId]: d.messages ?? [] }));
        setConversations(prev => prev.map(c => c.id === activeId ? { ...c, unread_count: 0 } : c));
      })
      .catch(() => {});
  }, [activeId]);

  useEffect(() => { msgsEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, activeId]);

  useEffect(() => {
    if (view !== "broadcast") return;
    api.adminCommsBroadcasts().then(d => setBroadcasts(d.rows ?? [])).catch(() => {});
  }, [view]);

  useEffect(() => {
    if (view !== "team") return;
    api.adminCommsTeam().then(d => setTeam(d.rows ?? [])).catch(() => {});
  }, [view]);

  useEffect(() => { teamEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [team]);

  // ── Inbox send ──
  async function handleSend() {
    if (!draft.trim() || !activeId || sending) return;
    setSending(true);
    try {
      const msg = await api.adminCommsSend(activeId, draft.trim());
      setMessages(prev => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), msg] }));
      setConversations(prev => prev.map(c =>
        c.id === activeId ? { ...c, last_message: draft.trim(), last_at: msg.sent_at } : c
      ));
      setDraft("");
      if (taRef.current) taRef.current.style.height = "auto";
    } catch {}
    setSending(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  // ── Broadcast send ──
  async function handleBroadcast(e) {
    e.preventDefault();
    if (!bTitle.trim() || !bBody.trim() || bSending) return;
    setBSending(true);
    try {
      const result = await api.adminCommsBroadcastSend({ title: bTitle, body: bBody, channel: bChannel, segment: bSegment });
      setBroadcasts(prev => [result, ...prev]);
      setBTitle(""); setBBody("");
      setBSuccess(true);
      setTimeout(() => setBSuccess(false), 3000);
    } catch {}
    setBSending(false);
  }

  // ── Team send ──
  async function handleTeamSend() {
    if (!teamDraft.trim() || teamSending) return;
    setTeamSending(true);
    try {
      const msg = await api.adminCommsTeamSend(teamDraft.trim());
      setTeam(prev => [...prev, msg]);
      setTeamDraft("");
      if (teamTARef.current) teamTARef.current.style.height = "auto";
    } catch {}
    setTeamSending(false);
  }

  function handleTeamKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleTeamSend(); }
  }

  const activeConv    = conversations.find(c => c.id === activeId);
  const activeMessages = messages[activeId] ?? [];
  const visibleConvs  = channel === "all" ? conversations : conversations.filter(c => c.channel === channel);
  const totalUnread   = conversations.reduce((s, c) => s + (c.unread_count || 0), 0);

  return (
    <div className="comms-page">

      {/* ── Top nav ── */}
      <div className="comms-topbar">
        <h2 className="comms-topbar-title">Comms</h2>
        <nav className="comms-viewnav">
          {[
            { id: "inbox",     label: "Inbox",      icon: "inbox"    },
            { id: "broadcast", label: "Broadcasts",  icon: "campaign" },
            { id: "team",      label: "Team Chat",   icon: "groups"   },
          ].map(v => (
            <button key={v.id} type="button"
              className={`comms-viewnav-btn${view === v.id ? " comms-viewnav-active" : ""}`}
              onClick={() => setView(v.id)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>{v.icon}</span>
              {v.label}
              {v.id === "inbox" && totalUnread > 0 && (
                <span className="comms-nav-badge">{totalUnread}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ── INBOX ── */}
      {view === "inbox" && (
        <div className="comms-inner">

          {/* Sidebar */}
          <aside className="comms-filters">
            <div className="comms-filters-body">
              <div className="comms-section">
                <p className="comms-section-label">Channels</p>
                <div className="comms-ch-list">
                  {CHANNELS.map(ch => (
                    <button key={ch.id} type="button"
                      className={`comms-ch-btn${channel === ch.id ? " comms-ch-active" : ""}`}
                      onClick={() => setChannel(ch.id)}
                    >
                      <div className="comms-ch-left">
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{ch.icon}</span>
                        <span>{ch.label}</span>
                      </div>
                      {ch.id === "all" && totalUnread > 0 && (
                        <span className="comms-ch-badge">{totalUnread}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="comms-filters-ft">
              <button type="button" className="comms-broad-btn" onClick={() => setView("broadcast")}>
                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>campaign</span>
                Send Broadcast
              </button>
            </div>
          </aside>

          {/* Conversation list */}
          <div className="comms-convlist">
            <div className="comms-convlist-hd">
              <h3 className="comms-convlist-title">Recent</h3>
              <span className="comms-convlist-count">{visibleConvs.length}</span>
            </div>
            <div className="comms-convlist-body">
              {visibleConvs.length === 0 ? (
                <div className="comms-conv-empty">
                  <span className="material-symbols-outlined" style={{ fontSize: 36 }}>chat_bubble_outline</span>
                  <p>No conversations yet</p>
                </div>
              ) : visibleConvs.map((conv, i) => {
                const pal   = palette(i);
                const badge = CH_BADGE[conv.channel] || CH_BADGE.sms;
                return (
                  <button key={conv.id} type="button"
                    className={`comms-conv-item${conv.id === activeId ? " comms-conv-active" : ""}`}
                    onClick={() => setActiveId(conv.id)}
                  >
                    <div className="comms-conv-top">
                      <div className="comms-conv-who">
                        <div className="comms-avatar-wrap">
                          <div className="comms-avatar" style={{ background: pal.bg, color: pal.color }}>
                            {convInitials(conv)}
                          </div>
                          {conv.unread_count > 0 && <span className="comms-online-dot" />}
                        </div>
                        <div>
                          <p className="comms-conv-name">{convName(conv)}</p>
                          <p className="comms-conv-plan">{conv.client_id}</p>
                        </div>
                      </div>
                      <span className="comms-conv-time">{fmtAge(conv.last_at)}</span>
                    </div>
                    <p className="comms-conv-preview">{conv.last_message || "—"}</p>
                    <div className="comms-conv-footer">
                      <span className="comms-ch-pill" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                      {conv.unread_count > 0 && (
                        <span className="comms-unread-badge">{conv.unread_count} new</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat window */}
          <div className="comms-chatwin">
            {!activeConv ? (
              <div className="comms-chat-empty">
                <span className="material-symbols-outlined" style={{ fontSize: 52 }}>forum</span>
                <p>Select a conversation to start</p>
              </div>
            ) : (
              <>
                <div className="comms-chat-hd">
                  <div className="comms-chat-hd-left">
                    {(() => {
                      const idx = visibleConvs.findIndex(c => c.id === activeId);
                      const pal = palette(Math.max(0, idx));
                      return (
                        <div className="comms-chat-avatar-wrap">
                          <div className="comms-chat-avatar" style={{ background: pal.bg, color: pal.color }}>
                            {convInitials(activeConv)}
                          </div>
                        </div>
                      );
                    })()}
                    <div>
                      <h3 className="comms-chat-name">{convName(activeConv)}</h3>
                      <p className="comms-chat-sub">{activeConv.client_id} · {activeConv.channel}</p>
                    </div>
                  </div>
                  <div className="comms-chat-actions">
                    <button type="button" className="comms-hd-btn">
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>more_vert</span>
                    </button>
                  </div>
                </div>

                <div className="comms-messages">
                  {activeMessages.length === 0 && (
                    <div className="comms-date-pill">Start of conversation</div>
                  )}
                  {activeMessages.map(msg => (
                    <div key={msg.id} className={`comms-msg-row ${msg.direction === "out" ? "comms-msg-out" : "comms-msg-in"}`}>
                      {msg.direction === "in" && (
                        <div className="comms-bubble-avatar" style={{ background: palette(0).bg, color: palette(0).color }}>
                          {convInitials(activeConv)}
                        </div>
                      )}
                      <div className={`comms-bubble ${msg.direction === "out" ? "comms-bubble-out" : "comms-bubble-in"}`}>
                        <p className="comms-bubble-text">{msg.body}</p>
                        <div className={`comms-bubble-meta ${msg.direction === "out" ? "comms-meta-out" : "comms-meta-in"}`}>
                          <span className="comms-bubble-time">{fmtTime(msg.sent_at)}</span>
                          {msg.direction === "out" && (
                            <span className="material-symbols-outlined" style={{ fontSize: 13, fontVariationSettings: "'FILL' 1" }}>
                              {msg.status === "read" ? "done_all" : "done"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={msgsEnd} />
                </div>

                <div className="comms-compose">
                  <div className="comms-templates">
                    {QUICK_TEMPLATES.map(t => (
                      <button key={t.label} type="button" className="comms-tpl-btn"
                        onClick={() => { setDraft(t.text); setTimeout(() => resizeTA(taRef), 0); }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <div className="comms-compose-row">
                    <div className="comms-input-wrap">
                      <textarea ref={taRef} className="comms-textarea" rows={1}
                        placeholder="Type your message…" value={draft}
                        onChange={e => { setDraft(e.target.value); resizeTA(taRef); }}
                        onKeyDown={handleKeyDown} />
                    </div>
                    <button type="button" className="comms-send-btn" onClick={handleSend} disabled={!draft.trim() || sending}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>send</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── BROADCASTS ── */}
      {view === "broadcast" && (
        <div className="comms-inner comms-bc-layout">

          {/* History */}
          <div className="comms-bc-history">
            <div className="comms-convlist-hd">
              <h3 className="comms-convlist-title">Sent Broadcasts</h3>
              <span className="comms-convlist-count">{broadcasts.length}</span>
            </div>
            <div className="comms-bc-list">
              {broadcasts.length === 0 ? (
                <div className="comms-conv-empty">
                  <span className="material-symbols-outlined" style={{ fontSize: 36 }}>campaign</span>
                  <p>No broadcasts yet</p>
                </div>
              ) : broadcasts.map(b => {
                const badge = CH_BADGE[b.channel] || CH_BADGE.sms;
                return (
                  <div key={b.id} className="comms-bc-item">
                    <div className="comms-bc-item-top">
                      <span className="comms-bc-item-title">{b.title}</span>
                      <span className="comms-conv-time">{fmtAge(b.sent_at || b.created_at)}</span>
                    </div>
                    <p className="comms-bc-item-body">{b.body}</p>
                    <div className="comms-bc-item-footer">
                      <span className="comms-ch-pill" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                      <span className="comms-bc-seg">{b.segment === "all" ? "All Customers" : b.segment === "active" ? "Active Subscribers" : b.segment}</span>
                      <span className="comms-bc-rc">
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>group</span>
                        {b.recipient_count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compose */}
          <div className="comms-bc-compose">
            <div className="comms-bc-compose-hd">
              <h3 className="comms-bc-compose-title">New Broadcast</h3>
              <p className="comms-bc-compose-sub">Send a message to a customer segment</p>
            </div>

            {bSuccess && (
              <div className="comms-bc-success">
                <span className="material-symbols-outlined" style={{ fontSize: 17, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Broadcast sent successfully!
              </div>
            )}

            <form className="comms-bc-form" onSubmit={handleBroadcast}>
              <div className="comms-form-group">
                <label className="comms-form-label">Title</label>
                <input type="text" className="comms-form-input"
                  placeholder="e.g. Holiday Delivery Notice"
                  value={bTitle} onChange={e => setBTitle(e.target.value)} required />
              </div>
              <div className="comms-form-group">
                <label className="comms-form-label">Message</label>
                <textarea className="comms-form-textarea" rows={5}
                  placeholder="Write your message here…"
                  value={bBody} onChange={e => setBBody(e.target.value)} required />
              </div>
              <div className="comms-form-row2">
                <div className="comms-form-group">
                  <label className="comms-form-label">Channel</label>
                  <select className="comms-form-select" value={bChannel} onChange={e => setBChannel(e.target.value)}>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div className="comms-form-group">
                  <label className="comms-form-label">Segment</label>
                  <select className="comms-form-select" value={bSegment} onChange={e => setBSegment(e.target.value)}>
                    <option value="all">All Customers</option>
                    <option value="active">Active Subscribers</option>
                    <option value="inactive">Inactive / Churned</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="comms-bc-send-btn" disabled={bSending || !bTitle.trim() || !bBody.trim()}>
                <span className="material-symbols-outlined" style={{ fontSize: 17, fontVariationSettings: "'FILL' 1" }}>campaign</span>
                {bSending ? "Sending…" : "Send Broadcast"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── TEAM CHAT ── */}
      {view === "team" && (
        <div className="comms-inner comms-team-layout">
          <div className="comms-team-win">
            <div className="comms-chat-hd">
              <div className="comms-chat-hd-left">
                <div className="comms-team-icon">
                  <span className="material-symbols-outlined" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1" }}>groups</span>
                </div>
                <div>
                  <h3 className="comms-chat-name">Team Chat</h3>
                  <p className="comms-chat-sub">Visible to Owner · Manager · Accountant</p>
                </div>
              </div>
            </div>

            <div className="comms-messages comms-team-thread">
              {team.length === 0 && (
                <div className="comms-date-pill">No messages yet — say hello to the team!</div>
              )}
              {team.map(msg => {
                const rm  = ROLE_META[msg.sender_role] || ROLE_META.owner;
                const ini = (msg.sender_name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div key={msg.id} className="comms-team-msg">
                    <div className="comms-team-avatar" style={{ background: rm.bg, color: rm.color }}>{ini}</div>
                    <div className="comms-team-body">
                      <div className="comms-team-meta">
                        <span className="comms-team-sender">{msg.sender_name}</span>
                        <span className="comms-role-badge" style={{ background: rm.bg, color: rm.color }}>{rm.label}</span>
                        <span className="comms-team-time">{fmtTime(msg.sent_at)}</span>
                      </div>
                      <p className="comms-team-text">{msg.body}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={teamEnd} />
            </div>

            <div className="comms-compose">
              <div className="comms-compose-row">
                <div className="comms-input-wrap">
                  <textarea ref={teamTARef} className="comms-textarea" rows={1}
                    placeholder="Message the team… (Enter to send)"
                    value={teamDraft}
                    onChange={e => { setTeamDraft(e.target.value); resizeTA(teamTARef); }}
                    onKeyDown={handleTeamKeyDown} />
                </div>
                <button type="button" className="comms-send-btn" onClick={handleTeamSend} disabled={!teamDraft.trim() || teamSending}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { AdminComms };
