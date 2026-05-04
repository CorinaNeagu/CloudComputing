"use client";
import Link from 'next/link';
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import "./style.css";
import CatCarousel from '@/components/CatCarousel';

export default function HomePage() {
  const { data: session } = useSession();
  const [cats, setCats] = useState([]);
  const [view, setView] = useState("home"); 
  const [uploading, setUploading] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newCat, setNewCat] = useState({ name: "", breed: "", description: "", city: "" });
  const [selectedCat, setSelectedCat] = useState(null);
  const [requests, setRequests] = useState([]); 
  const [userRequests, setUserRequests] = useState([]);

  
useEffect(() => {
  const fetchData = async () => {
    try {
      const catsRes = await fetch('/api/cats');
      const catsData = await catsRes.json();
      setCats(catsData);

      const reqRes = await fetch('/api/requests');
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(Array.isArray(reqData) ? reqData : []);
      }
    } catch (err) {
      console.error("Eroare la încărcarea datelor:", err);
    }
  };
  fetchData();
}, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(null);
    }
  };

  const handleAddCat = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    const fileInput = document.getElementById('cat-image-upload');
    const file = fileInput.files[0];

    if (!file) {
      alert("Te rog selecteaza o imagine!");
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "pisici_preset");

    try {
      const cloudRes = await fetch("https://api.cloudinary.com/v1_1/dcdgwrflw/image/upload", {
        method: "POST",
        body: formData,
      });
      
      const cloudData = await cloudRes.json();
      if (!cloudData.secure_url) throw new Error("Cloudinary error");
      
      const imageUrl = cloudData.secure_url;

      const res = await fetch("/api/cats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...newCat, 
          imageUrl,
          creatorEmail: session?.user?.email 
        }),
      });

      if (res.ok) {
        alert("Pisica a fost adaugata cu succes!");
        setNewCat({ name: "", breed: "", description: "", city: "" }); 
        setImagePreview(null);
        if (fileInput) fileInput.value = "";
        setView("home");
        const updated = await fetch("/api/cats").then(r => r.json());
        setCats(updated);
      }
    } catch (err) {
      console.error(err);
      alert("A aparut o problema la incarcare.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
  if (!confirm("Vrei sa stergi acest anunt? Toate cererile primite vor fi de asemenea sterse.")) return;
  
  const res = await fetch(`/api/cats/${id}`, { method: "DELETE" });
  
  if (res.ok) {
    setCats(cats.filter(c => c._id !== id));

    if (typeof setRequests === "function") {
       setRequests(prevRequests => prevRequests.filter(req => req.catId !== id));
    }

    alert("Sters cu succes - anuntul si cererile au disparut!");
  } else {
    alert("Eroare la stergere.");
  }
};

  const handleUpdateCat = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let imageUrl = editingCat.imageUrl;
      const fileInput = document.getElementById('edit-cat-image');
      const file = fileInput.files[0];

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "pisici_preset");
        const cloudRes = await fetch("https://api.cloudinary.com/v1_1/dcdgwrflw/image/upload", { method: "POST", body: formData });
        const cloudData = await cloudRes.json();
        imageUrl = cloudData.secure_url;
      }

      const res = await fetch(`/api/cats/${editingCat._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editingCat, imageUrl }),
      });

      if (res.ok) {
        alert("Actualizat cu succes!");
        setCats(cats.map(c => c._id === editingCat._id ? { ...editingCat, imageUrl } : c));
        setView("manage");
        setEditingCat(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const hasSentRequest = (catId) => {
  return requests.some(req => req.catId === catId && req.adopterEmail === session?.user?.email);
};

  const handleAdopt = (cat) => {
  const message = `Buna! Sunt interesat de adoptia lui ${cat.name} (${cat.breed || 'Pisicuță'}). Am vazut anunțul pe CatAdopt!`;s
  const mailtoLink = `mailto:${cat.creatorEmail}?subject=Adopție ${cat.name}&body=${encodeURIComponent(message)}`;
  window.location.href = mailtoLink;
};

const handleAccept = async (request) => {
  const res = await fetch(`/api/adoption_requests/${request._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      status: "accepted",
      adopterEmail: request.adopterEmail,  
      catName: request.catName           
    }),
  });

  if (res.ok) {
    alert("Cerere acceptata! Utilizatorul a fost notificat prin email.");
  }
};

const confirmAdoption = async () => {
  if (!selectedCat || !session) return;
  setUploading(true);

  try {
    const dbResponse = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        catId: selectedCat._id,
        catName: selectedCat.name,
        ownerEmail: selectedCat.creatorEmail,
        adopterEmail: session.user.email,
        adopterName: session.user.name
      }),
    });

    if (!dbResponse.ok) throw new Error("Eroare la salvarea în DB");

    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: selectedCat.creatorEmail,
        catName: selectedCat.name,
        fromName: session.user.name,
        fromEmail: session.user.email
      }),
    });

    alert("Cerere inregistrată cu succes!");
    
    const updatedReqs = await fetch("/api/requests").then(r => r.json());
    setRequests(updatedReqs);

  } catch (error) {
    console.error("Eroare completă:", error);
    alert("A apărut o problemă. Verifică consola.");
  } finally {
    setUploading(false);
    setSelectedCat(null);
  }
};

const handleRequestStatus = async (requestId, newStatus, catId) => {
  const currentRequest = requests.find(r => r._id === requestId);

  try {
    const resReq = await fetch("/api/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        requestId, 
        newStatus,
        adopterEmail: currentRequest?.adopterEmail, 
        catName: currentRequest?.catName 
      }),
    });

    if (!resReq.ok) throw new Error("Eroare la actualizarea cererii");

    if (newStatus === 'accepted') {
      const resCat = await fetch(`/api/cats/${catId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdopted: true }),
      });
      if (!resCat.ok) console.error("Nu s-a putut marca pisica ca adoptata in DB");
    }

    setRequests(prev => prev.map(req => 
      req._id === requestId ? { ...req, status: newStatus } : req
    ));
    
    const updatedCats = await fetch("/api/cats").then(r => r.json());
    setCats(updatedCats);
    
    alert(newStatus === 'accepted' ? "Succes! Adoptatorul a primit confirmarea prin email." : "Refuzat.");
  } catch (err) {
    console.error(err);
    alert("Eroare: " + err.message);
  }
};

const isAdoptedByMe = (catId) => {
  return requests.some(req => 
    req.catId === catId && 
    req.adopterEmail === session?.user?.email && 
    req.status === 'accepted'
  );
};

const hasPendingRequest = (catId) => {
  return requests.some(req => 
    req.catId === catId && 
    req.adopterEmail === session?.user?.email && 
    req.status === 'pending'
  );
};

  return (
    <main className="main-container">
      <nav className="navbar">
        <h1 onClick={() => setView("home")} className="logo" style={{ cursor: 'pointer' }}>
          <span>🐾</span> CatAdopt
        </h1>
        
        <div className="nav-auth">
          {session ? (
            <div className="user-control">
              <button 
                onClick={() => setView("add")} 
                className="btn-add-nav"
                style={{ marginRight: '10px', backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                + Adauga o pisica
              </button>

              <button 
                onClick={() => setView("manage")} 
                style={{ marginRight: '15px', backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ⚙️ Pisicile tale
              </button>

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
        
{view === "home" && (
  <section className="fade-in">
    <header className="page-header">
      <h2>Pisici gata pentru adoptie</h2>
    </header>

    {!session ? (
      <div style={{ marginTop: "1rem" }}>
        <CatCarousel
          cats={cats.filter(cat => !cat.isAdopted).slice(0, 6)}
        />
      </div>
    ) : (
      <>
        <div className="cat-grid">
          {cats.map((cat) => (
            <div key={cat._id} className="cat-card">

              <Link href={`/details/${cat._id}`} className="cat-link-wrapper">
                <div className="image-container">
                  <img src={cat.imageUrl} className="cat-image" alt={cat.name} />
                  <div className="location-tag">📍 {cat.city}</div>
                </div>

                <div className="cat-details">
                  <h3>{cat.name}</h3>
                  <p className="cat-desc">
                    {cat.description?.substring(0, 60)}...
                  </p>
                </div>
              </Link>

              <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                {cat.isAdopted ? (
                  <>
                    {isAdoptedByMe(cat._id) ? (
                      <button
                        className="btn-adopt"
                        disabled
                        style={{
                          backgroundColor: '#1ac6ff',
                          color: 'white',
                          cursor: 'default',
                          width: '100%'
                        }}
                      >
                        🎉 Felicitari! E prietenul tau
                      </button>
                    ) : (
                      <button
                        className="btn-adopt"
                        disabled
                        style={{
                          backgroundColor: 'salmon',
                          color: 'white',
                          cursor: 'not-allowed',
                          width: '100%',
                          fontSize: '0.8rem'
                        }}
                      >
                        🏠 {cat.name} si-a gasit deja o casa
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {session?.user?.email === cat.creatorEmail ? (
                      <button
                        className="btn-adopt"
                        disabled
                        style={{
                          backgroundColor: '#94a3b8',
                          cursor: 'not-allowed',
                          opacity: 0.7,
                          width: '100%'
                        }}
                      >
                        Anuntul tau
                      </button>
                    ) : hasPendingRequest(cat._id) ? (
                      <button
                        className="btn-adopt"
                        disabled
                        style={{
                          backgroundColor: '#50bfdd',
                          color: 'white',
                          cursor: 'not-allowed',
                          width: '100%'
                        }}
                      >
                        📩 Cerere trimisa
                      </button>
                    ) : (
                      <button
                        className="btn-adopt active"
                        onClick={() => setSelectedCat(cat)}
                        style={{ width: '100%' }}
                      >
                        Adopta acum <span>→</span>
                      </button>
                    )}
                  </>
                )}
              </div>

            </div>
          ))}
        </div>
      </>
    )}

    {selectedCat && (
      <div className="modal-overlay fade-in">
        <div className="modal-content">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐱</div>
          <h3>Vrei sa adopti pe {selectedCat.name}?</h3>
          <p>
            Vom deschide aplicatia ta de email pentru a-i trimite un mesaj lui{" "}
            <strong>{selectedCat.creatorEmail}</strong>.
          </p>

          <div className="modal-actions">
            <button className="btn-primary" onClick={confirmAdoption}>
              Da, trimite mesajul
            </button>
            <button
              className="btn-secondary"
              onClick={() => setSelectedCat(null)}
            >
              Ma mai gandesc
            </button>
          </div>
        </div>
      </div>
    )}
  </section>
)}
        {view === "add" && (
          <section className="fade-in form-container" style={{ maxWidth: '500px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <button onClick={() => setView("home")} className="btn-back">← Înapoi</button>
            <h2 style={{ marginTop: '1rem' }}>Adauga un anunt nou</h2>
            
            <form onSubmit={handleAddCat} className="cat-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '1.5rem' }}>
              <input type="text" placeholder="Numele pisicii" required value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
              <input type="text" placeholder="Rasă" value={newCat.breed} onChange={e => setNewCat({...newCat, breed: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
              <input type="text" placeholder="Oraș / Locație" required value={newCat.city} onChange={e => setNewCat({...newCat, city: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
              
              <label style={{ fontSize: '0.8rem', color: '#666' }}>Alege poza pisicii:</label>
              <input id="cat-image-upload" type="file" accept="image/*" required onChange={handleImageChange} style={{ padding: '10px', borderRadius: '8px', border: '1px dashed #ddd' }} />
              
              {imagePreview && (
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                  <img src={imagePreview} alt="Previzualizare" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '10px', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                </div>
              )}
              
              <textarea placeholder="Descrie personalitatea pisicii..." value={newCat.description} onChange={e => setNewCat({...newCat, description: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', height: '100px' }} />

              <button type="submit" disabled={uploading} style={{ backgroundColor: uploading ? '#ccc' : '#22c55e', color: 'white', padding: '12px', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: uploading ? 'not-allowed' : 'pointer', fontSize: '1rem' }}>
                {uploading ? "Se încarcă..." : "Salvează Anunțul"}
              </button>
            </form>
          </section>
        )}

        {view === "manage" && (
          <section className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 className="cat-name" style={{ fontSize: '2rem' }}>Anunțurile mele</h2>
              <button onClick={() => setView("home")} className="btn-back" style={{ position: 'static' }}>← Înapoi</button>
            </header>

            {cats.filter(cat => cat.creatorEmail === session?.user?.email).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                {cats.filter(cat => cat.creatorEmail === session?.user?.email).map(cat => (
                  <div key={cat._id} className="cat-card-manage" style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img src={cat.imageUrl} alt={cat.name} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                        <div>
                          <h4 style={{ margin: 0 }}>{cat.name}</h4>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>📍 {cat.city}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => { setEditingCat(cat); setView("edit"); }} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>✏️</button>
                        <button onClick={() => handleDelete(cat._id)} className="btn-logout" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>🗑️</button>
                      </div>
                    </div>

                    <div className="timeline-section">
                      <h5 style={{ fontSize: '0.9rem', color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: '#6366f1', width: '8px', height: '8px', borderRadius: '50%' }}></span>
                        Timeline Cereri
                      </h5>
                      
                      <div className="timeline-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '2px solid #e2e8f0', marginLeft: '4px', paddingLeft: '20px' }}>
                        {requests.filter(req => req.catId === cat._id).length > 0 ? (
                          requests.filter(req => req.catId === cat._id).map((req) => (
                            <div key={req._id} className={`timeline-card ${req.status}`} style={{ position: 'relative', padding: '12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                              
                              <div style={{ 
                                position: 'absolute', 
                                left: '-25px', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                width: '10px', 
                                height: '10px', 
                                borderRadius: '50%', 
                                background: req.status === 'accepted' ? '#10b981' : req.status === 'rejected' ? '#ef4444' : '#6366f1' 
                              }}></div>
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{req.adopterName}</div>
                                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    {new Date(req.createdAt).toLocaleDateString()} • {req.adopterEmail}
                                  </div>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '5px' }}>
                                  {req.status === 'pending' ? (
                                    cat.isAdopted ? (
                                      <span style={{ fontSize: '0.7rem', color: '#ef4444', textTransform: 'uppercase', fontWeight: '800' }}>
                                        ❌ Respins
                                      </span>
                                    ) : (
                                      <>
                                        <button 
                                          onClick={() => handleRequestStatus(req._id, 'accepted', cat._id)} 
                                          style={{ background: '#10b981', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '8px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                          Accepta
                                        </button>
                                        <button 
                                          onClick={() => handleRequestStatus(req._id, 'rejected', cat._id)} 
                                          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '8px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                          Refuza
                                        </button>
                                      </>
                                    )
                                  ) : (
                                    <span style={{ 
                                      fontSize: '0.7rem', 
                                      fontWeight: '800', 
                                      textTransform: 'uppercase', 
                                      color: req.status === 'accepted' ? '#10b981' : '#ef4444' 
                                    }}>
                                      {req.status === 'accepted' ? '✅ Adoptat' : '❌ Respins'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Nicio cerere primita inca.</p>
                        )}
                      </div>
                    </div>
                  </div>
            ))}
              </div>
                ) : (
                  <div className="fade-in" style={{ 
                  textAlign: 'center', 
                  padding: '80px 40px', 
                  background: 'white', 
                  borderRadius: '32px', 
                  border: '2px dashed #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px'
                  }}>
                <div style={{ fontSize: '64px' }}>🐱</div>
                          
                  <div style={{ maxWidth: '400px' }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '8px' }}>
                      Nu ai adaugat nicio pisica inca
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5' }}>
                      Anunturile tale de adoptie vor aparea aici dupa ce le creezi.
                    </p>
                  </div>

                    <button 
                      onClick={() => setView("add")}
                        style={{ 
                              backgroundColor: '#6366f1', 
                              color: 'white', 
                              padding: '12px 24px', 
                              borderRadius: '12px', 
                              border: 'none', 
                              fontWeight: 'bold', 
                              fontSize: '1rem',
                              cursor: 'pointer',
                              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                              transition: 'transform 0.2s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      + Adauga prima ta pisica
                    </button>
                        </div>
          )}
          </section>
        )}

        {view === "edit" && editingCat && (
          <section className="fade-in" style={{ maxWidth: '500px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <button onClick={() => setView("manage")} className="btn-back">← Anulează</button>
            <h2 style={{ marginTop: '1rem' }}>Editează {editingCat.name}</h2>
            <form onSubmit={handleUpdateCat} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '1.5rem' }}>
              <input type="text" value={editingCat.name} onChange={e => setEditingCat({...editingCat, name: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
              <input type="text" value={editingCat.breed} onChange={e => setEditingCat({...editingCat, breed: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
              <input type="text" value={editingCat.city} onChange={e => setEditingCat({...editingCat, city: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={editingCat.imageUrl} alt="preview" style={{ width: '50px', height: '50px', borderRadius: '5px', objectFit: 'cover' }} />
                <input id="edit-cat-image" type="file" accept="image/*" style={{ flex: 1 }} />
              </div>

              <textarea value={editingCat.description} onChange={e => setEditingCat({...editingCat, description: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', height: '100px' }} />
              <button type="submit" disabled={uploading} style={{ backgroundColor: uploading ? '#ccc' : '#3b82f6', color: 'white', padding: '12px', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: uploading ? 'not-allowed' : 'pointer' }}>
                {uploading ? "Se salvează..." : "Actualizează"}
              </button>
            </form>
          </section>
        )}

       {view === "profil" && (
  <section className="fade-in" style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
    
    <div style={{ 
      background: 'white', 
      padding: '3rem 2rem', 
      borderRadius: '32px', 
      boxShadow: '0 20px 40px rgba(0,0,0,0.04)', 
      textAlign: 'center', 
      position: 'relative',
      marginBottom: '2rem',
      border: '1px solid #f1f5f9'
    }}>
      <button 
        onClick={() => setView("home")} 
        className="btn-back" 
        style={{ position: 'absolute', left: '24px', top: '24px', border: 'none', background: '#f8fafc', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', color: '#64748b' }}
      >
        ← Inapoi
      </button>
      
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <img 
          src={session?.user?.image} 
          alt="avatar" 
          style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }} 
        />
        <div style={{ position: 'absolute', bottom: '5px', right: '5px', background: '#10b981', width: '20px', height: '20px', borderRadius: '50%', border: '3px solid white' }}></div>
      </div>
      
      <h2 style={{ margin: '1rem 0 0.2rem 0', fontSize: '1.8rem', color: '#1e293b' }}>{session?.user?.name}</h2>
      <p style={{ color: '#64748b', fontWeight: '500' }}>{session?.user?.email}</p>
    </div>

    <div style={{ 
      background: 'white', 
      padding: '2rem', 
      borderRadius: '32px', 
      boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
      border: '1px solid #f1f5f9'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', color: '#1e293b' }}>
          <span style={{ fontSize: '1.5rem' }}>🕒</span> Istoricul cererilor tale
        </h3>
        <span style={{ background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>
          {requests.filter(req => req.adopterEmail === session?.user?.email).length} cereri
        </span>
      </div>

      {requests.filter(req => req.adopterEmail === session?.user?.email).length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {requests
            .filter(req => req.adopterEmail === session?.user?.email)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((req) => {
              const statusStyles = {
                pending: { bg: '#eff6ff', color: '#3b82f6', text: 'In asteptare', icon: '⏳', border: '#dbeafe' },
                accepted: { bg: '#f0fdf4', color: '#10b981', text: 'Adoptat', icon: '🎉', border: '#bbf7d0' },
                rejected: { bg: '#fff1f2', color: '#f43f5e', text: 'Refuzat', icon: '❌', border: '#ffe4e6' }
              };
              const style = statusStyles[req.status] || statusStyles.pending;

              return (
                <div key={req._id} className="history-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '20px', 
                  borderRadius: '20px', 
                  border: `1px solid ${style.border}`,
                  background: style.bg,
                  transition: 'transform 0.2s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '14px', 
                      overflow: 'hidden',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      flexShrink: 0,
                      background: '#f1f5f9' 
                      }}>
                      {req.imageUrl ? (
                        <img 
                          src={req.imageUrl} 
                          alt={req.catName} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <div style={{ 
                          width: '100%', 
                          height: '100%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '1.2rem' 
                        }}>
                          🐱
                        </div>
                          )}
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#1e293b', marginBottom: '2px' }}>
                        {req.catName}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                         📅 {new Date(req.createdAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })}
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    backgroundColor: 'white', 
                    color: style.color, 
                    padding: '8px 16px', 
                    borderRadius: '14px', 
                    fontSize: '0.85rem', 
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: `0 4px 10px ${style.border}`
                  }}>
                    {style.icon} {style.text.toUpperCase()}
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏜️</div>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Încă nu ai trimis nicio cerere de adopție.</p>
          <button onClick={() => setView("home")} style={{ marginTop: '1rem', background: '#6366f1', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
            Vezi pisicile disponibile
          </button>
        </div>
      )}
    </div>
  </section>
)}
      </div>
    </main>
  );
}