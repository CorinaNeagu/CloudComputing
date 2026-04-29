"use client";
import Link from 'next/link';
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import "./style.css";

export default function HomePage() {
  const { data: session } = useSession();
  const [cats, setCats] = useState([]);
  const [view, setView] = useState("home"); 
  const [uploading, setUploading] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newCat, setNewCat] = useState({ name: "", breed: "", description: "", city: "" });
  const [selectedCat, setSelectedCat] = useState(null);

  useEffect(() => {
    fetch("/api/cats")
      .then((res) => res.json())
      .then((data) => setCats(data))
      .catch(err => console.error("Eroare fetch cats:", err));
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
      alert("Te rog selectează o imagine!");
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
    if (!confirm("Vrei sa stergi acest anunt?")) return;
    const res = await fetch(`/api/cats/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCats(cats.filter(c => c._id !== id));
      alert("Sters cu succes!");
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

  const handleAdopt = (cat) => {
  // Putem folosi un mesaj personalizat
  const message = `Bună! Sunt interesat de adopția lui ${cat.name} (${cat.breed || 'Pisicuță'}). Am văzut anunțul pe CatAdopt!`;
  
  // Opțiunea A: Email (Deschide clientul de mail al utilizatorului)
  const mailtoLink = `mailto:${cat.creatorEmail}?subject=Adopție ${cat.name}&body=${encodeURIComponent(message)}`;
  
  // Opțiunea B: WhatsApp (Dacă am avea numărul de telefon în DB, dar momentan folosim email)
  window.location.href = mailtoLink;
};

const confirmAdoption = async () => {
  if (!selectedCat || !session) return;
  
  setUploading(true); // Reutilizăm starea de loading pentru feedback vizual

  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: selectedCat.creatorEmail, // Destinatarul
        catName: selectedCat.name,     // Numele pisicii
        fromName: session.user.name,   // Cine trimite
        fromEmail: session.user.email  // Emailul celui care trimite
      }),
    });

    if (response.ok) {
      alert(`Cererea pentru ${selectedCat.name} a fost trimisă cu succes! Proprietarul te va contacta pe mail.`);
    } else {
      throw new Error("Eroare la API");
    }
  } catch (error) {
    console.error(error);
    alert("Ups! Nu am putut trimite mail-ul. Verifică dacă ai configurat corect SendGrid.");
  } finally {
    setUploading(false);
    setSelectedCat(null); // Închidem modalul
  }
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
      <h2>Pisici gata pentru adopție</h2>
      <p>Fiecare pisică de mai jos provine din baza de date live MongoDB Atlas.</p>
    </header>

    <div className="cat-grid">
      {cats.map((cat) => (
        <div key={cat._id} className="cat-card">
          <Link href={`/details/${cat._id}`} className="cat-link-wrapper">
            <div className="image-container">
              <img src={cat.imageUrl} className="cat-image" alt={cat.name} />
              {/* Badge locație stilat */}
              <div className="location-tag">📍 {cat.city || "România"}</div>
            </div>
            <div className="cat-details">
              <h3>{cat.name}</h3>
              <p className="cat-desc">{cat.description?.substring(0, 60)}...</p>
            </div>
          </Link>

          <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
            {session?.user?.email === cat.creatorEmail ? (
              <button 
                className="btn-adopt" 
                disabled 
                style={{ backgroundColor: '#94a3b8', cursor: 'not-allowed', opacity: 0.7 }}
              >
                Anunțul tău
              </button>
            ) : (
              /* BUTONUL CORECT CARE DESCHIDE MODALUL */
              <button 
                className="btn-adopt active" 
                onClick={() => setSelectedCat(cat)}
              >
                Adoptă acum <span>→</span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>

    {/* MODALUL SE PUNE AICI, O SINGURĂ DATĂ, ÎN AFARA GRID-ULUI */}
    {selectedCat && (
      <div className="modal-overlay fade-in">
        <div className="modal-content">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐱</div>
          <h3>Vrei să-l adopți pe {selectedCat.name}?</h3>
          <p>Vom deschide aplicația ta de email pentru a-i trimite un mesaj lui <strong>{selectedCat.creatorEmail}</strong>.</p>
          
          <div className="modal-actions">
            <button className="btn-primary" onClick={confirmAdoption}>
              Da, trimite mesajul
            </button>
            <button className="btn-secondary" onClick={() => setSelectedCat(null)}>
              Mai mă gândesc
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
            <h2 style={{ marginTop: '1rem' }}>Adaugă un anunț nou</h2>
            
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

        {/* VIEW: MANAGE */}
{view === "manage" && (
  <section className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
      <h2 className="cat-name" style={{ fontSize: '2rem' }}>Anunțurile mele</h2>
      <button onClick={() => setView("home")} className="btn-back" style={{ position: 'static' }}>← Înapoi la adopții</button>
    </header>

    {/* Filtrăm pisicile pentru a vedea dacă utilizatorul are vreuna creată */}
    {cats.filter(cat => cat.creatorEmail === session?.user?.email).length > 0 ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {cats.filter(cat => cat.creatorEmail === session?.user?.email).map(cat => (
          <div key={cat._id} className="cat-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '1rem', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <img src={cat.imageUrl} alt={cat.name} style={{ width: '80px', height: '80px', borderRadius: '15px', objectFit: 'cover' }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{cat.name}</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>📍 {cat.city || "Oraș nespecificat"}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => { setEditingCat(cat); setView("edit"); }} 
                className="btn-secondary" 
                style={{ padding: '8px 15px', fontSize: '0.9rem' }}
              >
                ✏️ Editează
              </button>
              <button 
                onClick={() => handleDelete(cat._id)} 
                className="btn-logout" 
                style={{ padding: '8px 15px', fontSize: '0.9rem' }}
              >
                🗑️ Șterge
              </button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      /* MESAJUL CARE SE AFIȘEAZĂ DACĂ NU EXISTĂ PISICI */
      <div className="fade-in" style={{ 
        textAlign: 'center', 
        padding: '5rem 2rem', 
        background: 'white', 
        borderRadius: '30px', 
        border: '2px dashed #e2e8f0' 
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🐱</div>
        <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Nu ai adaugat nicio pisica inca</h3>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Anunturile tale de adopție vor aparea aici dupa ce le creezi</p>
        <button 
          onClick={() => setView("add")} 
          className="btn-primary"
          style={{ padding: '12px 30px' }}
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
          <section className="profile-container fade-in">
             <div className="profile-card">
               <button onClick={() => setView("home")} className="btn-back">← Înapoi</button>
               <img src={session?.user?.image} className="avatar-large" alt="avatar" />
               <h2>{session?.user?.name}</h2>
               <p>{session?.user?.email}</p>
             </div>
          </section>
        )}
      </div>
    </main>
  );
}