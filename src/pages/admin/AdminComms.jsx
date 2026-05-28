import { useState, useRef, useEffect } from "react";
import "./AdminComms.css";
const CONVERSATIONS = [
  {
    id: "c1",
    name: "Meera Sharma",
    initials: "MS",
    avatarBg: "#c1ecd4",
    avatarColor: "#012d1d",
    plan: "A2 Desi Ghee Plan",
    preview: '"Is the morning delivery on track?"',
    channel: "whatsapp",
    time: "2m ago",
    online: true,
    lastStatus: "read",
    previewItalic: true
  },
  {
    id: "c2",
    name: "Rohan Verma",
    initials: "RV",
    avatarBg: "#ffdcc4",
    avatarColor: "#2f1400",
    plan: "Bulk Order Enquiry",
    preview: '"Sent the quotation for the upcoming event..."',
    channel: "email",
    time: "1h ago",
    online: false,
    lastStatus: "delivered",
    previewItalic: false
  },
  {
    id: "c3",
    name: "Priya Kapur",
    initials: "PK",
    avatarBg: "#ffdcc4",
    avatarColor: "#5f2f00",
    plan: "Trial Period",
    preview: '"The Paneer quality was exceptional, thank you!"',
    channel: "sms",
    time: "Yesterday",
    online: false,
    lastStatus: "read",
    previewItalic: false
  }
];
const INITIAL_MESSAGES = {
  c1: [
    { id: "c1m1", dir: "in", text: "Good morning! I wanted to check if the delivery for the A2 Ghee batch is on track for today. Usually, the milk arrives by 7:30 AM, but I haven't seen the delivery executive yet.", time: "08:34 AM" },
    { id: "c1m2", dir: "out", text: "Good morning, Mrs. Sharma. We apologize for the delay. Our delivery vehicle encountered a slight delay at the collection center this morning. Your package is currently out for delivery and should reach you within the next 20 minutes.", time: "08:42 AM", status: "read" },
    { id: "c1m3", dir: "in", text: "That's understandable. Thank you for the update. Is the morning delivery on track for tomorrow as well?", time: "08:45 AM" }
  ],
  c2: [
    { id: "c2m1", dir: "out", text: "Sent the quotation for the upcoming event. Please review and let us know if you'd like any adjustments to the bulk order.", time: "10:15 AM", status: "delivered" }
  ],
  c3: [
    { id: "c3m1", dir: "in", text: "The Paneer quality was exceptional, thank you! I'm very pleased with the trial period so far.", time: "Yesterday" }
  ]
};
const CHANNELS = [
  { id: "all", label: "All Messages", icon: "chat_bubble" },
  { id: "whatsapp", label: "WhatsApp", icon: "forum" },
  { id: "sms", label: "SMS", icon: "sms" },
  { id: "email", label: "Email", icon: "mail" }
];
const SEGMENTS = ["Subscribed Members", "Trial Users", "Lapsed Customers"];
const QUICK_TEMPLATES = [
  { label: "Delivery Status \u{1F69A}", text: "Your delivery is on its way and will arrive within the next 30 minutes." },
  { label: "Product Launch \u{1F95B}", text: "Exciting news! We have a new product available just for you." },
  { label: "Payment Reminder \u{1F4B3}", text: "Gentle reminder: your payment is due soon. Please complete it at your earliest convenience." },
  { label: "Order Confirmation \u2705", text: "Your order has been confirmed and is currently being prepared for dispatch." }
];
const CH_BADGE = {
  whatsapp: { label: "WHATSAPP", bg: "#ffca98", color: "#7a532a" },
  email: { label: "EMAIL", bg: "#c1ecd4", color: "#274e3d" },
  sms: { label: "SMS", bg: "#e6e1e0", color: "#414844" }
};
const CH_LABEL = {
  whatsapp: "WhatsApp",
  email: "Email",
  sms: "SMS"
};
function AdminComms() {
  const [activeConvId, setActiveConvId] = useState("c1");
  const [channel, setChannel] = useState("all");
  const [segments, setSegments] = useState(/* @__PURE__ */ new Set());
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [broadFlash, setBroadFlash] = useState(false);
  const textareaRef = useRef(null);
  const msgsEndRef = useRef(null);
  const activeConv = CONVERSATIONS.find((c) => c.id === activeConvId);
  const activeMessages = messages[activeConvId] ?? [];
  const visibleConvs = channel === "all" ? CONVERSATIONS : CONVERSATIONS.filter((c) => c.channel === channel);
  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConvId]);
  function resizeTextarea() {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 128)}px`;
  }
  function handleDraft(val) {
    setDraft(val);
    resizeTextarea();
  }
  function handleSend() {
    if (!draft.trim()) return;
    const now = /* @__PURE__ */ new Date();
    const time = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const msg = { id: `m${Date.now()}`, dir: "out", text: draft.trim(), time, status: "delivered" };
    setMessages((prev) => ({ ...prev, [activeConvId]: [...prev[activeConvId] ?? [], msg] }));
    setDraft("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }
  function handleBroadcast() {
    setBroadFlash(true);
    setTimeout(() => setBroadFlash(false), 2500);
  }
  function toggleSegment(s) {
    setSegments((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  }
  return <div className="comms-page">
      <div className="comms-inner">

        {
    /* ── Left filter sidebar ── */
  }
        <aside className="comms-filters">
          <div className="comms-filters-hd">
            <h2 className="comms-filters-title">Comms</h2>
            <p className="comms-filters-sub">Manage all channels</p>
          </div>

          <div className="comms-filters-body">
            <div className="comms-section">
              <p className="comms-section-label">Channels</p>
              <div className="comms-ch-list">
                {CHANNELS.map((ch) => <button
    key={ch.id}
    type="button"
    className={`comms-ch-btn ${channel === ch.id ? "comms-ch-active" : ""}`}
    onClick={() => setChannel(ch.id)}
  >
                    <div className="comms-ch-left">
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{ch.icon}</span>
                      <span>{ch.label}</span>
                    </div>
                    {ch.id === "all" && <span className="comms-ch-badge">24</span>}
                  </button>)}
              </div>
            </div>

            <div className="comms-section">
              <p className="comms-section-label">Segments</p>
              <div className="comms-seg-list">
                {SEGMENTS.map((seg) => <label key={seg} className="comms-seg-label">
                    <input
    type="checkbox"
    className="comms-seg-check"
    checked={segments.has(seg)}
    onChange={() => toggleSegment(seg)}
  />
                    <span>{seg}</span>
                  </label>)}
              </div>
            </div>
          </div>

          <div className="comms-filters-ft">
            <button
    type="button"
    className={`comms-broad-btn ${broadFlash ? "comms-broad-sent" : ""}`}
    onClick={handleBroadcast}
  >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                {broadFlash ? "check_circle" : "add"}
              </span>
              {broadFlash ? "Broadcast Sent!" : "Broadcast Update"}
            </button>
          </div>
        </aside>

        {
    /* ── Middle conversation list ── */
  }
        <div className="comms-convlist">
          <div className="comms-convlist-hd">
            <h3 className="comms-convlist-title">Recent Activity</h3>
            <button type="button" className="comms-filter-btn">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>filter_list</span>
            </button>
          </div>
          <div className="comms-convlist-body">
            {visibleConvs.map((conv) => {
    const badge = CH_BADGE[conv.channel];
    const isActive = conv.id === activeConvId;
    return <button
      key={conv.id}
      type="button"
      className={`comms-conv-item ${isActive ? "comms-conv-active" : ""}`}
      onClick={() => setActiveConvId(conv.id)}
    >
                  <div className="comms-conv-top">
                    <div className="comms-conv-who">
                      <div className="comms-avatar-wrap">
                        <div className="comms-avatar" style={{ background: conv.avatarBg, color: conv.avatarColor }}>
                          {conv.initials}
                        </div>
                        {conv.online && <span className="comms-online-dot" />}
                      </div>
                      <div>
                        <p className="comms-conv-name">{conv.name}</p>
                        <p className="comms-conv-plan">{conv.plan}</p>
                      </div>
                    </div>
                    <span className="comms-conv-time">{conv.time}</span>
                  </div>

                  <p className={`comms-conv-preview ${conv.previewItalic ? "comms-italic" : ""}`}>
                    {conv.preview}
                  </p>

                  <div className="comms-conv-footer">
                    <span className="comms-ch-pill" style={{ background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                    <div className={`comms-read-row ${conv.lastStatus === "read" ? "comms-read-green" : "comms-read-muted"}`}>
                      <span
      className="material-symbols-outlined"
      style={{
        fontSize: 14,
        fontVariationSettings: conv.lastStatus === "read" ? "'FILL' 1" : void 0
      }}
    >
                        {conv.lastStatus === "read" ? "done_all" : "done"}
                      </span>
                      <span>{conv.lastStatus === "read" ? "Read" : "Delivered"}</span>
                    </div>
                  </div>
                </button>;
  })}
          </div>
        </div>

        {
    /* ── Right chat window ── */
  }
        <div className="comms-chatwin">

          {
    /* Chat header */
  }
          <div className="comms-chat-hd">
            <div className="comms-chat-hd-left">
              <div className="comms-chat-avatar-wrap">
                <div className="comms-chat-avatar" style={{ background: activeConv.avatarBg, color: activeConv.avatarColor }}>
                  {activeConv.initials}
                </div>
                {activeConv.online && <span className="comms-chat-online" />}
              </div>
              <div>
                <h3 className="comms-chat-name">{activeConv.name}</h3>
                <p className="comms-chat-sub">{activeConv.plan} · {CH_LABEL[activeConv.channel]}</p>
              </div>
            </div>
            <div className="comms-chat-actions">
              <button type="button" className="comms-hd-btn comms-hd-primary">
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>call</span>
              </button>
              <button type="button" className="comms-hd-btn comms-hd-primary">
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>videocam</span>
              </button>
              <button type="button" className="comms-hd-btn">
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>more_vert</span>
              </button>
            </div>
          </div>

          {
    /* Messages canvas */
  }
          <div className="comms-messages">
            <div className="comms-date-pill">Today, 08:30 AM</div>

            {activeMessages.map((msg) => <div
    key={msg.id}
    className={`comms-msg-row ${msg.dir === "out" ? "comms-msg-out" : "comms-msg-in"}`}
  >
                {msg.dir === "in" && <div className="comms-bubble-avatar" style={{ background: activeConv.avatarBg, color: activeConv.avatarColor }}>
                    {activeConv.initials}
                  </div>}
                <div className={`comms-bubble ${msg.dir === "out" ? "comms-bubble-out" : "comms-bubble-in"}`}>
                  <p className="comms-bubble-text">{msg.text}</p>
                  <div className={`comms-bubble-meta ${msg.dir === "out" ? "comms-meta-out" : "comms-meta-in"}`}>
                    <span className="comms-bubble-time">{msg.time}</span>
                    {msg.dir === "out" && <span
    className="material-symbols-outlined"
    style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}
  >
                        {msg.status === "read" ? "done_all" : "done"}
                      </span>}
                  </div>
                </div>
              </div>)}

            <div ref={msgsEndRef} />
          </div>

          {
    /* Compose area */
  }
          <div className="comms-compose">
            <div className="comms-templates">
              {QUICK_TEMPLATES.map((t) => <button
    key={t.label}
    type="button"
    className="comms-tpl-btn"
    onClick={() => {
      setDraft(t.text);
      setTimeout(resizeTextarea, 0);
    }}
  >
                  {t.label}
                </button>)}
            </div>
            <div className="comms-compose-row">
              <button type="button" className="comms-attach-btn">
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>attachment</span>
              </button>
              <div className="comms-input-wrap">
                <textarea
    ref={textareaRef}
    className="comms-textarea"
    placeholder="Type your message…"
    rows={1}
    value={draft}
    onChange={(e) => handleDraft(e.target.value)}
    onKeyDown={handleKeyDown}
  />
                <button type="button" className="comms-emoji-btn">
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>mood</span>
                </button>
              </div>
              <button type="button" className="comms-send-btn" onClick={handleSend}>
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>send</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {
    /* Broadcast FAB */
  }
      <button
    type="button"
    className={`comms-fab ${broadFlash ? "comms-fab-sent" : ""}`}
    onClick={handleBroadcast}
  >
        <span className="material-symbols-outlined" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1" }}>
          {broadFlash ? "check_circle" : "campaign"}
        </span>
        <span>{broadFlash ? "Sent!" : "Broadcast Group Message"}</span>
      </button>
    </div>;
}
export {
  AdminComms
};
