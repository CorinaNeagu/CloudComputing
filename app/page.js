"use client";
import Link from 'next/link'; // Importăm Link pentru navigare
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import "./style.css";

export default function HomePage() {
  const { data: session } = useSession();
  const [cats, setCats] = useState([]);
  const [view, setView] = useState("home");

  useEffect(() => {
    fetch("/api/cats")
      .then((res) => res.json())
      .then((data) => setCats(data))
      .catch(err => console.error("Eroare fetch cats:", err));
  }, []);

  return (
    <main className="main-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <h1 onClick={() => setView("home")} className="logo" style={{ cursor: 'pointer' }}>
          <span>🐾</span> CatAdopt
        </h1>
        
        <div className="nav-auth">
          {session ? (
            <div className="user-control">
              <div className="user-badge" onClick={() => setView("profil")}>
                <img src={session.user.image} alt="avatar" className="avatar-nav" />
                <div className="user-text">
                  <span className="user-name">{session.user.name}</span>
                  <span className="user-sub">Vezi profil</span>
                </div>
              </div>
              <button onClick={() => signOut()} className="btn-logout">Logout</button>
            </div>
          ) : (
            <div className="auth-group">
              <button onClick={() => signIn("google")} className="btn-secondary">Creare cont</button>
              <button onClick={() => signIn("google")} className="btn-primary">Autentificare</button>
            </div>
          )}
        </div>
      </nav>

      <div className="content-wrapper">
        {view === "home" ? (
          <section className="fade-in">
            <header className="page-header">
              <h2>Pisici gata pentru adopție</h2>
              <p>Fiecare pisică de mai jos provine din baza de date live MongoDB Atlas.</p>
            </header>

            <div className="cat-grid">
              {cats.length > 0 ? (
                cats.map((cat) => (
                  <div key={cat._id} className="cat-card">
                    {/* MODIFICARE: Tot ce e vizual devine link către pagina de detalii */}
                    <Link href={`/details/${cat._id}`} className="cat-link-wrapper">
                      <div className="image-container">
                        <img src={cat.imageUrl} className="cat-image" alt={cat.name} />
                        {!session && <div className="overlay">Autentifică-te pentru a vedea detalii</div>}
                      </div>
                      <div className="cat-details">
                        <h3>{cat.name}</h3>
                        <p className="cat-desc">
                          {cat.description ? (cat.description.substring(0, 60) + "...") : "Apasă pentru a-i afla povestea."}
                        </p>
                      </div>
                    </Link>

                    {/* Butonul rămâne jos, funcțional separat */}
                    <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                      <button 
                        disabled={!session} 
                        className={session ? "btn-adopt active" : "btn-adopt disabled"}
                        onClick={(e) => {
                          e.preventDefault(); // Prevenim navigarea când se apasă butonul
                          alert("Cerere trimisă pentru " + cat.name);
                        }}
                      >
                        {session ? "Adoptă acum" : "Logare necesară"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="loading-state">Se încarcă pisicile din Cloud...</div>
              )}
            </div>
          </section>
        ) : (
          /* SECTION PROFIL */
          <section className="profile-container fade-in">
            <div className="profile-card">
              <button onClick={() => setView("home")} className="btn-back">← Înapoi la listă</button>
              <div className="profile-header">
                <img src={session?.user?.image} className="avatar-large" alt="avatar" />
                <h2>{session?.user?.name}</h2>
                <span className="email-tag">{session?.user?.email}</span>
              </div>
              
              <div className="tech-info">
                <h3>Detalii Sesiune Cloud</h3>
                <div className="info-row">
                  <span>Provider:</span>
                  <strong>Google OAuth 2.0</strong>
                </div>
                <div className="info-row">
                  <span>Bază de date:</span>
                  <strong>MongoDB Atlas</strong>
                </div>
                <div className="info-row">
                  <span>ID Utilizator:</span>
                  <code className="id-code">{session?.user?.id || "N/A"}</code>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}