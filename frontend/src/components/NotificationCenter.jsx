import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, Info, CheckCircle2, AlertCircle, XCircle, MessageSquare, 
  Trophy, GraduationCap, Banknote, UserPlus, Landmark, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { broadcastMutation } from "@/lib/realtime";
import { addNotification, getNotifications, markAsRead as storeMarkAsRead, markAllAsRead as storeMarkAllAsRead } from "@/lib/notificationStore";

const TYPE_ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  error: XCircle,
  message: MessageSquare,
  system: Trophy,
  student_registered: GraduationCap,
  fee_payment: Banknote,
  expense_decision: AlertCircle,
  lead_created: UserPlus,
  gst_filed: Landmark,
  scholarship_application: Trophy,
  enrollment: GraduationCap,
  job_application: Info,
  whatsapp_message_received: MessageSquare,
};

const TYPE_COLORS = {
  info: "bg-accent/10 text-accent",
  success: "bg-emerald-500/10 text-emerald-600",
  warning: "bg-amber-500/10 text-amber-600",
  error: "bg-rose-500/10 text-rose-600",
  message: "bg-sky-500/10 text-sky-600",
  system: "bg-violet-500/10 text-violet-600",
  student_registered: "bg-emerald-500/10 text-emerald-600",
  fee_payment: "bg-amber-500/10 text-amber-600",
  expense_decision: "bg-rose-500/10 text-rose-600",
  lead_created: "bg-sky-500/10 text-sky-600",
  gst_filed: "bg-indigo-500/10 text-indigo-600",
  scholarship_application: "bg-purple-500/10 text-purple-600",
  enrollment: "bg-emerald-500/10 text-emerald-600",
  job_application: "bg-blue-500/10 text-blue-600",
  whatsapp_message_received: "bg-teal-500/10 text-teal-600",
};

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const eventSourceRef = useRef(null);
  const initializedRef = useRef(false);

  // High-fidelity synthesized harmonic audio chime (works without external mp3 dependencies)
  const playNotificationSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const now = ctx.currentTime;
      
      // Harmonic Tone 1: 587.33 Hz (D5) - soft bell
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Harmonic Tone 2: 880.00 Hz (A5) - crisp upper overtone
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880.0, now + 0.1);
      gain2.gain.setValueAtTime(0.15, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.55);
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  const handleMarkAsRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await api.post(`/admin/notifications/${id}/read`);
      await storeMarkAsRead(id);
    } catch {
      // Silently fail
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await api.post("/admin/notifications/read-all");
      await storeMarkAllAsRead();
    } catch {
      // Silently fail
    }
  }, []);

  const handleNotificationClick = useCallback((notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    setIsOpen(false);

    // Deep link navigation based on event type
    const type = notification.type;
    switch (type) {
      case "student_registered":
        navigate("/erp/students");
        break;
      case "fee_payment":
        navigate("/erp/payments");
        break;
      case "expense_decision":
        navigate("/erp/expenses");
        break;
      case "lead_created":
        navigate("/erp/leads");
        break;
      case "gst_filed":
        navigate("/erp/payments");
        break;
      case "scholarship_application":
        navigate("/admin?tab=scholarships");
        break;
      case "enrollment":
        navigate("/admin?tab=enrollments");
        break;
      case "job_application":
        navigate("/admin?tab=job-applications");
        break;
      case "whatsapp_message_received":
        navigate("/admin?tab=chats");
        break;
      default:
        break;
    }
  }, [handleMarkAsRead, navigate]);

  // Initial load from server and local store
  useEffect(() => {
    let mounted = true;

    async function init() {
      if (initializedRef.current) return;
      initializedRef.current = true;

      try {
        const stored = await getNotifications();
        let serverNotifications = [];
        try {
          const res = await api.get("/admin/notifications?limit=50");
          serverNotifications = res.data?.items || res.data || [];
        } catch {
          // Fallback to offline store
        }

        const map = new Map();
        [...serverNotifications, ...(stored || [])].forEach((n) => {
          if (n && n.id && !map.has(n.id)) {
            map.set(n.id, n);
          }
        });

        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
        );

        if (mounted) {
          setNotifications(merged);
          setUnreadCount(merged.filter((n) => !n.read).length);
        }
      } catch (e) {
        console.error("Failed to load notifications", e);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  // SSE Real-Time Streaming Connection with Auto-Reconnect
  useEffect(() => {
    let reconnectTimeout = null;
    let isDisposed = false;

    const handleSseMessage = (event) => {
      try {
        if (!event?.data) return;
        const data = JSON.parse(event.data);
        if (data.type === "system_handshake" || data.system_status) return;

        const type = data.type || "info";
        const payload = data.payload || {};

        const buildTitle = () => {
          if (data.title) return data.title;
          if (payload.title) return payload.title;
          switch (type) {
            case "student_registered":
              return `Student Admission: ${payload.name || "New Student"}`;
            case "fee_payment":
              return `Fee Payment Received: ₹${payload.amount || 0}`;
            case "expense_decision":
              return `Expense ${payload.status === "approved" ? "Approved" : "Rejected"}`;
            case "lead_created":
              return `New Lead Enquiry: ${payload.name || "Student"}`;
            case "gst_filed":
              return `GST Remittance Filed: ${payload.month || ""}`;
            case "scholarship_application":
              return `New scholarship application from ${payload.name || "a student"}`;
            case "enrollment":
              return `New enrollment from ${payload.name || "a student"}`;
            case "job_application":
              return `New job application from ${payload.name || "an applicant"}`;
            case "whatsapp_message_received":
              return "New WhatsApp message received";
            case "result_published":
              return `Result published for ${payload.name || "a student"}`;
            case "broadcast_complete":
              return "Broadcast completed";
            default:
              return "New Notification";
          }
        };

        const buildMessage = () => {
          if (data.message) return data.message;
          if (payload.message) return payload.message;
          switch (type) {
            case "student_registered":
              return `Roll No: ${payload.student_no || "—"} · Branch: ${payload.branch || ""} · Course: ${payload.course || ""}`;
            case "fee_payment":
              return `Receipt: ${payload.receipt_no || "—"} · Student: ${payload.student_no || ""} · Mode: ${(payload.mode || "").toUpperCase()}`;
            case "expense_decision":
              return `Amount: ₹${payload.amount || 0} · Category: ${payload.category || ""} · ${payload.title || ""}`;
            case "lead_created":
              return `Phone: ${payload.phone || "—"} · Source: ${payload.source || "Walk-in"}`;
            case "gst_filed":
              return `Status: ${payload.status || "PAID"} · Challan: ${payload.challan_no || "N/A"}`;
            case "scholarship_application":
              return `Application #${payload.application_no || "—"} · ${payload.scholarship_title || payload.campaign_kind || "Scholarship"} · ${payload.venue || ""}`;
            case "enrollment":
              return `Enrollment #${payload.application_no || payload.enrollment_no || "—"} · ${payload.course || payload.program || ""}`;
            case "job_application":
              return `Application #${payload.application_no || "—"} · ${payload.department || payload.job_title || ""}`;
            case "whatsapp_message_received":
              return payload.body || payload.message || "You received a new WhatsApp message.";
            case "result_published":
              return `${payload.name || "Student"} · ${payload.exam || ""} · Marks: ${payload.marks_obtained ?? ""}`;
            case "broadcast_complete":
              return payload.summary || "Your broadcast campaign has finished sending.";
            default:
              return "";
          }
        };

        const notification = {
          id: data.id || crypto.randomUUID(),
          type: type,
          title: buildTitle(),
          message: buildMessage(),
          timestamp: data.timestamp || new Date().toISOString(),
          read: false,
          payload,
        };

        setNotifications((prev) => [notification, ...prev.filter((n) => n.id !== notification.id)].slice(0, 100));
        setUnreadCount((prev) => prev + 1);

        playNotificationSound();
        toast(notification.title, {
          description: notification.message,
          duration: 4500,
        });

        // Broadcast real-time cross-tab mutation event to refresh queries without page reloads
        try {
          broadcastMutation(type, "sse_event", payload);
        } catch {
          // ignore
        }

        addNotification(notification).catch(() => {});
      } catch (e) {
        console.error("Failed to parse SSE event", e);
      }
    };

    const connectStream = () => {
      if (isDisposed) return;
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
      const url = `${BACKEND_URL}/api/admin/notifications/stream`;
      const es = new EventSource(url, { withCredentials: true });
      eventSourceRef.current = es;

      es.onmessage = handleSseMessage;
      es.addEventListener("notification_received", handleSseMessage);

      es.onerror = () => {
        es.close();
        if (eventSourceRef.current === es) {
          eventSourceRef.current = null;
        }
        // Auto-reconnect with 5-second backoff
        if (!isDisposed && !reconnectTimeout) {
          reconnectTimeout = setTimeout(() => {
            reconnectTimeout = null;
            connectStream();
          }, 5000);
        }
      };
    };

    connectStream();

    return () => {
      isDisposed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [playNotificationSound]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-xl border border-border hover:bg-muted/50 transition-colors cursor-pointer"
        data-testid="notification-bell"
        aria-label="Open notifications"
      >
        <Bell size={18} className="text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="p-4 border-b border-border shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <SheetTitle className="text-base font-bold">Real-time Notifications</SheetTitle>
                <SheetDescription>
                  {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? "s" : ""}` : "All systems caught up"}
                </SheetDescription>
              </div>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMarkAllAsRead}
                  className="text-xs rounded-lg border-border cursor-pointer shrink-0"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center text-muted-foreground py-12 text-sm">
                No notifications recorded
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = TYPE_ICONS[notification.type] || Info;
                const time = new Date(notification.timestamp).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                      notification.read
                        ? "bg-background/30 border-border opacity-75"
                        : "bg-accent/5 border-accent/20 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${TYPE_COLORS[notification.type] || TYPE_COLORS.info}`}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-sm font-semibold truncate ${
                            notification.read ? "text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {notification.title}
                        </div>
                        {notification.message && (
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                            {notification.message}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 mt-1.5 font-mono">
                          <span>{time}</span>
                          <span className="flex items-center gap-0.5 text-accent opacity-0 hover:opacity-100 transition">
                            View <ExternalLink size={10} />
                          </span>
                        </div>
                      </div>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1.5" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
