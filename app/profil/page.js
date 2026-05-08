"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilPage({ requests = [], cats = [], setView }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div style={loaderWrapper}>
        <div style={spinnerStyle} />
        <p>Se încarcă profilul...</p>
      </div>
    );
  }

  if (!session) return null;

const userRequests = requests
  .filter(req => req.adopterEmail === session?.user?.email)
  .map(req => {
    if (!req.imageUrl) {
      const catData = cats.find(c => c.name === req.catName);
      return { 
        ...req, 
        imageUrl: catData?.imageUrl || "/placeholder-cat.jpg" 
      };
    }
    return req;
  });

  return (
    <main style={pageWrapper}>
      <div style={bgGlow} />

      <div style={container}>
        <div style={headerNav}>
          <button onClick={() => setView ? setView("home") : router.push("/")} style={backBtn}>
            ← Inapoi
          </button>
          
        </div>

        <div style={profileCard}>
          <div style={avatarWrapper}>
            <img 
              src={session.user.image} 
              alt="Profil" 
              style={avatarImg} 
              referrerPolicy="no-referrer" 
            />
            <div style={statusBadge}>Activ</div>
          </div>
          
          <h1 style={userName}>{session.user.name}</h1>
          <p style={userEmail}>{session.user.email}</p>
          
          <div style={miniBentoRow}>
            <div style={miniBentoItem}>
              <span style={bentoLabelText}>ID Sesiune</span>
              <span style={bentoValueText}>{session.user.id?.slice(-6) || "N/A"}</span>
            </div>
            <div style={miniBentoItem}>
              <span style={bentoLabelText}>Provider</span>
              <span style={bentoValueText}>Google</span>
            </div>
          </div>
        </div>

        <div style={historySection}>
          <div style={historyHeader}>
            <h3 style={historyTitle}>Istoricul cererilor tale</h3>
            <span style={requestCounter}>{userRequests.length} cereri</span>
          </div>

          {userRequests.length > 0 ? (
            <div style={listContainer}>
              {userRequests
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((req) => {
                  const statusStyles = {
                    pending: { bg: '#f8fafc', color: '#3b82f6', text: 'În așteptare', icon: '⏳', border: '#e2e8f0' },
                    accepted: { bg: '#f0fdf4', color: '#10b981', text: 'Adoptat', icon: '🎉', border: '#dcfce7' },
                    rejected: { bg: '#fff1f2', color: '#f43f5e', text: 'Refuzat', icon: '❌', border: '#ffe4e6' }
                  };
                  const style = statusStyles[req.status] || statusStyles.pending;

                  return (
                    <div key={req._id} style={{...historyItem, border: `1px solid ${style.border}`}}>
                      <div style={catInfoGroup}>
                        <div style={catThumbWrapper}>
                          <img src={req.imageUrl || "/placeholder-cat.jpg"} alt={req.catName} style={catThumbImg} />
                        </div>
                        <div>
                          <div style={catNameText}>{req.catName}</div>
                          <div style={dateText}>
                            📅 {new Date(req.createdAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{...statusLabel, color: style.color, backgroundColor: 'white'}}>
                         {style.icon} <span style={{marginLeft: '5px'}}>{style.text.toUpperCase()}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div style={emptyState}>
              <p style={{margin: 0, opacity: 0.6}}>Nu ai trimis nicio cerere inca.</p>
              <button onClick={() => setView("home")} style={exploreBtn}>Exploreaza pisici</button>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}


const pageWrapper = {
  minHeight: "100vh",
  backgroundColor: "#f8fafc",
  display: "flex",
  justifyContent: "center",
  padding: "40px 20px",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  position: "relative",
  overflowX: "hidden"
};

const bgGlow = {
  position: "absolute",
  top: "-100px",
  right: "-100px",
  width: "400px",
  height: "400px",
  background: "radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(255,255,255,0) 70%)",
  zIndex: 0
};

const container = {
  width: "100%",
  maxWidth: "600px",
  position: "relative",
  zIndex: 1
};

const headerNav = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px"
};

const backBtn = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  padding: "10px 18px",
  borderRadius: "14px",
  color: "#64748b",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "0.85rem",
  boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
};

const logoutBtn = {
  background: "#fee2e2",
  color: "#ef4444",
  border: "none",
  padding: "10px 18px",
  borderRadius: "14px",
  fontSize: "0.85rem",
  fontWeight: "700",
  cursor: "pointer"
};

const profileCard = {
  backgroundColor: "#fff",
  borderRadius: "35px",
  padding: "40px 30px",
  textAlign: "center",
  boxShadow: "0 20px 40px rgba(0,0,0,0.03)",
  border: "1px solid rgba(0,0,0,0.02)",
  marginBottom: "25px"
};

const avatarWrapper = {
  position: "relative",
  width: "120px",
  height: "120px",
  margin: "0 auto 20px",
  padding: "5px",
  background: "linear-gradient(135deg, #6366f1, #a855f7)",
  borderRadius: "50%"
};

const avatarImg = {
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  objectFit: "cover",
  border: "4px solid #fff"
};

const statusBadge = {
  position: "absolute",
  bottom: "5px",
  right: "5px",
  backgroundColor: "#22c55e",
  color: "#fff",
  padding: "4px 10px",
  borderRadius: "20px",
  fontSize: "0.65rem",
  fontWeight: "bold",
  border: "3px solid #fff"
};

const userName = {
  fontSize: "2rem",
  fontWeight: "900",
  color: "#0f172a",
  margin: "0 0 5px 0",
  letterSpacing: "-1px"
};

const userEmail = {
  color: "#64748b",
  fontSize: "1rem",
  fontWeight: "500",
  marginBottom: "25px"
};

const miniBentoRow = {
  display: "flex",
  gap: "10px",
  justifyContent: "center"
};

const miniBentoItem = {
  background: "#f8fafc",
  padding: "10px 20px",
  borderRadius: "15px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minWidth: "100px"
};

const bentoLabelText = {
  fontSize: "0.65rem",
  textTransform: "uppercase",
  color: "#94a3b8",
  fontWeight: "800",
  letterSpacing: "0.5px"
};

const bentoValueText = {
  fontSize: "0.9rem",
  color: "#334155",
  fontWeight: "700"
};

const historySection = {
  backgroundColor: "#fff",
  borderRadius: "35px",
  padding: "30px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.03)",
  border: "1px solid rgba(0,0,0,0.02)"
};

const historyHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px"
};

const historyTitle = {
  fontSize: "1.2rem",
  fontWeight: "800",
  color: "#1e293b",
  margin: 0
};

const requestCounter = {
  background: "#f1f5f9",
  padding: "5px 12px",
  borderRadius: "10px",
  fontSize: "0.75rem",
  fontWeight: "700",
  color: "#64748b"
};

const listContainer = {
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const historyItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "15px",
  borderRadius: "20px",
  background: "#fff"
};

const catInfoGroup = {
  display: "flex",
  alignItems: "center",
  gap: "15px"
};

const catThumbWrapper = {
  width: "55px",
  height: "55px",
  borderRadius: "14px",
  overflow: "hidden",
  backgroundColor: "#f1f5f9"
};

const catThumbImg = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

const catNameText = {
  fontWeight: "800",
  color: "#1e293b",
  fontSize: "1rem"
};

const dateText = {
  fontSize: "0.8rem",
  color: "#94a3b8"
};

const statusLabel = {
  padding: "8px 14px",
  borderRadius: "12px",
  fontSize: "0.75rem",
  fontWeight: "800",
  boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
};

const emptyState = {
  textAlign: "center",
  padding: "40px 0"
};

const exploreBtn = {
  marginTop: "15px",
  background: "#6366f1",
  color: "#fff",
  border: "none",
  padding: "10px 24px",
  borderRadius: "12px",
  fontWeight: "700",
  cursor: "pointer"
};

const loaderWrapper = {
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center"
};

const spinnerStyle = {
  width: "40px",
  height: "40px",
  border: "4px solid #f3f3f3",
  borderTop: "4px solid #6366f1",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
  marginBottom: "15px"
};