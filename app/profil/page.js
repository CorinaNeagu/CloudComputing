"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div style={{ padding: "2rem" }}>Se încarca datele...</div>;
  }

  if (!session) return null;

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <button 
        onClick={() => router.push("/")}
        style={{ marginBottom: "1rem", cursor: "pointer" }}
      >
        ⬅ Înapoi la listă
      </button>

      <div style={{ 
        border: "1px solid #ccc", 
        borderRadius: "15px", 
        padding: "2rem", 
        textAlign: "center",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)" 
      }}>
        <img 
          src={session.user.image} 
          alt="Profil" 
          style={{ width: "100px", height: "100px", borderRadius: "50%", marginBottom: "1rem" }}
        />
        <h1 style={{ margin: "0.5rem 0" }}>{session.user.name}</h1>
        <p style={{ color: "#666" }}>Email: {session.user.email}</p>
        
        <div style={{ marginTop: "2rem", textAlign: "left", background: "#f9f9f9", padding: "1rem", borderRadius: "8px" }}>
          <h3>Detalii Cont (Cloud Data)</h3>
          <p><strong>ID Utilizator:</strong> {session.user.id}</p>
          <p><strong>Status Sesiune:</strong> Activă (Stocată în MongoDB)</p>
          <p><strong>Provider:</strong> Google OAuth 2.0</p>
        </div>
      </div>
    </main>
  );
}