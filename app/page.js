"use client";
import Link from 'next/link';
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import "./style.css";
import ProfilPage from "./profil/page";
import ManageCatsPage from '@/components/ManageCatsPage';
import AddCatPage from '@/components/AddCatPage';
import HomePage from '@/components/HomePage';
import EditCatPage from '@/components/EditCatPage';

export default function MainPage() {
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
  const [loadingRequestId, setLoadingRequestId] = useState(null);

  
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

  const   handleAddCat = async (e) => {
    e.preventDefault();
    setUploading(true);

    if (!newCat.name.trim()) {
    alert("Te rugam sa introduci numele pisicii!");
    return;
  }
  
  if (!newCat.city.trim()) {
    alert("Te rugam sa introduci orasul!");
    return;
  }
    
    const fileInput = document.getElementById('cat-image-upload');
    const file = fileInput.files[0];

    if (!file) {
      alert("Te rugam sa selectezi o imagine!");
      setUploading(false);
      return;
    }

    setUploading(true);
    
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
    let finalImageUrl = editingCat.imageUrl;

    const fileInput = document.getElementById('edit-cat-image');
    const file = fileInput?.files[0];

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "pisici_preset");

      const cloudRes = await fetch("https://api.cloudinary.com/v1_1/dcdgwrflw/image/upload", { 
        method: "POST", 
        body: formData 
      });

      if (!cloudRes.ok) {
        throw new Error("Eroare la încărcarea imaginii pe Cloudinary");
      }

      const cloudData = await cloudRes.json();
      finalImageUrl = cloudData.secure_url;
      console.log("Imagine nouă încărcată cu succes:", finalImageUrl);
    }

    const updatedCatData = { 
      ...editingCat, 
      imageUrl: finalImageUrl,
      creatorEmail: editingCat.creatorEmail || session?.user?.email
    };

    console.log("Date trimise către backend:", updatedCatData);

    console.log("--- DEBUG FRONTEND ---");
    console.log("ID Pisică:", editingCat._id);
    console.log("Email în sesiune:", session?.user?.email);
    console.log("Datele care vor fi trimise (Payload):", { ...editingCat, imageUrl: finalImageUrl });

    if (!editingCat.creatorEmail) {
      console.warn("ATENȚIE: 'creatorEmail' lipsește din obiectul editingCat înainte de trimitere!");
    }

    const res = await fetch(`/api/cats/${editingCat._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedCatData),
    });

    if (res.ok) {
      alert("Pisica a fost actualizată cu succes!");

      setCats(prevCats => 
        prevCats.map(c => (c._id === editingCat._id ? updatedCatData : c))
      );
      setView("manage");
      setEditingCat(null);
    } else {
      const errorData = await res.json();
      throw new Error(errorData.error || "Eroare la actualizarea în baza de date");
    }
  } catch (err) {
    console.error("Eroare completă la procesul de update:", err);
    alert(`Eroare: ${err.message}`);
  } finally {
    setUploading(false);
  }
};

const handleSetEditingCat = (cat) => {
  if (cat.isAdopted) {
    alert("Anunțurile pentru pisicile adoptate nu mai pot fi modificate.");
    return;
  }
  setEditingCat(cat);
  setView("edit");
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
  if (loadingRequestId) return; 

  const currentRequest = requests.find(r => r._id === requestId);
  const adopterName = currentRequest ? currentRequest.adopterName : "Utilizatorul";
  
  if (!currentRequest) {
    alert("Eroare: Cererea nu a fost găsită în listă.");
    return;
  }

  setLoadingRequestId(requestId);

  try {
    const resReq = await fetch("/api/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        requestId, 
        newStatus,
        adopterEmail: currentRequest.adopterEmail, 
        catName: currentRequest.catName 
      }),
    });

    const data = await resReq.json();
    if (!resReq.ok) throw new Error(data.error || "Eroare la actualizarea cererii");

    if (newStatus === 'accepted') {
      const resCat = await fetch(`/api/cats/${catId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdopted: true }),
      });

      if (!resCat.ok) console.error("Eroare la marcarea pisicii.");
    }

    setRequests(prev =>
      prev.map(req => {
        if (req._id === requestId) {
          return { ...req, status: newStatus };
        }
        if (newStatus === 'accepted' && req.catId === catId && req._id !== requestId) {
          return { ...req, status: 'rejected' };
        }
        return req;
      })
    );

    if (newStatus === 'accepted') {
      setCats(prevCats => 
        prevCats.map(cat => 
          cat._id === catId ? { ...cat, isAdopted: true } : cat
        )
      );
    }

    alert(
      newStatus === 'accepted'
        ? `Succes! ${adopterName} a primit confirmarea prin email, iar celelalte cereri au fost respinse.`
        : `Cererea facuta de ${adopterName} a fost refuzată.`
    );

  } catch (err) {
    console.error("Functia handleRequestStatus a eșuat:", err);
    alert("Eroare: " + err.message);
  } finally {
    setLoadingRequestId(null);
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
                style={{ marginRight: '15px', backgroundColor: '#1F51FF', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}
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
          <HomePage 
            session={session}
            cats={cats}
            isAdoptedByMe={isAdoptedByMe}
            hasPendingRequest={hasPendingRequest}
            setSelectedCat={setSelectedCat}
            selectedCat={selectedCat}
            confirmAdoption={confirmAdoption}
          />
      )}
        {view === "manage" && (
          <ManageCatsPage 
            cats={cats}
            requests={requests}
            session={session}
            setView={setView}
            setEditingCat={handleSetEditingCat} 
            handleDelete={handleDelete}
            handleRequestStatus={handleRequestStatus}
          />
        )}

        {view === "add" && (
            <AddCatPage 
              setView={setView}
              handleAddCat={handleAddCat}
              newCat={newCat}
              setNewCat={setNewCat}
              handleImageChange={handleImageChange}
              imagePreview={imagePreview}
              uploading={uploading}
            />
          )}
        {view === "edit" && editingCat && (
          <EditCatPage 
            editingCat={editingCat}
            setEditingCat={setEditingCat}
            handleUpdateCat={handleUpdateCat}
            setView={setView}
            uploading={uploading}
          />
        )}
        {view === "profil" && 
            <ProfilPage 
              requests={requests} 
              cats={cats} 
              setView={setView} />}
      </div>
    </main>
  );
}