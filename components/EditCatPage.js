import React, { useState } from 'react';

export default function EditCatPage({ 
  editingCat, 
  setEditingCat, 
  handleUpdateCat, 
  setView, 
  uploading 
}) {

  const [localPreview, setLocalPreview] = useState(null);

  if (!editingCat) return null;

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLocalPreview(URL.createObjectURL(file));
    }
  };

  const isAdopted = editingCat.isAdopted === true;

  return (
    <section className="fade-in form-container" style={containerStyle}>
      <button onClick={() => setView("manage")} className="btn-back">
        ← Anuleaza
      </button>

      <h2 style={{ marginTop: '1rem', color: isAdopted ? '#64748b' : '#1e293b' }}>
        Editeaza {editingCat.name} {isAdopted && "🔒"}
      </h2>

      <form onSubmit={handleUpdateCat} style={formStyle}>
        <input 
          type="text" 
          disabled={isAdopted}
          value={editingCat.name} 
          onChange={e => setEditingCat({...editingCat, name: e.target.value})} 
          style={isAdopted ? { ...inputStyle, backgroundColor: '#f1f5f9' } : inputStyle} 
          placeholder="Nume"
        />
        <input 
          type="text" 
          disabled={isAdopted}
          value={editingCat.breed} 
          onChange={e => setEditingCat({...editingCat, breed: e.target.value})} 
          style={isAdopted ? { ...inputStyle, backgroundColor: '#f1f5f9' } : inputStyle} 
          placeholder="Rasa"
        />
        <input 
          type="text" 
          disabled={isAdopted}
          value={editingCat.city} 
          onChange={e => setEditingCat({...editingCat, city: e.target.value})} 
          style={isAdopted ? { ...inputStyle, backgroundColor: '#f1f5f9' } : inputStyle} 
          placeholder="Oras"
        />
        
        <div style={imageRowStyle}>
          <img 
            src={localPreview || editingCat.imageUrl} 
            alt="preview" 
            style={previewThumbStyle} 
          />
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
              {isAdopted ? "Poza nu poate fi schimbata" : "Schimba poza (optional):"}
            </label>
            <input 
              id="edit-cat-image" 
              type="file" 
              disabled={isAdopted}
              accept="image/*" 
              style={{ width: '100%' }} 
              onChange={onImageChange}
            />
          </div>
        </div>

        <textarea 
          disabled={isAdopted}
          value={editingCat.description} 
          onChange={e => setEditingCat({...editingCat, description: e.target.value})} 
          style={{ 
            ...inputStyle, 
            height: '100px', 
            backgroundColor: isAdopted ? '#f1f5f9' : 'white' 
          }} 
          placeholder="Descriere"
        />

        <button 
          type="submit" 
          disabled={uploading || isAdopted} 
          style={{ 
            ...submitBtnStyle, 
            backgroundColor: (uploading || isAdopted) ? '#ccc' : '#3b82f6',
            cursor: (uploading || isAdopted) ? 'not-allowed' : 'pointer' 
          }}
        >
          {uploading ? "Se salvează..." : isAdopted ? "Anunt inchis" : "Actualizează"}
        </button>
      </form>
    </section>
  );
}

const containerStyle = { 
  maxWidth: '500px', 
  margin: '0 auto', 
  background: 'white', 
  padding: '2rem', 
  borderRadius: '20px', 
  boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
};

const formStyle = { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '15px', 
  marginTop: '1.5rem' 
};

const inputStyle = { 
  padding: '10px', 
  borderRadius: '8px', 
  border: '1px solid #ddd',
  outline: 'none'
};

const imageRowStyle = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '10px', 
  background: '#f8fafc', 
  padding: '10px', 
  borderRadius: '8px' 
};

const previewThumbStyle = { 
  width: '50px', 
  height: '50px', 
  borderRadius: '5px', 
  objectFit: 'cover', 
  border: '1px solid #e2e8f0' 
};

const labelStyle = { 
  display: 'block', 
  fontSize: '0.75rem', 
  color: '#64748b', 
  marginBottom: '5px' 
};

const submitBtnStyle = { 
  color: 'white', 
  padding: '12px', 
  border: 'none', 
  borderRadius: '10px', 
  fontWeight: 'bold', 
  transition: 'all 0.2s' 
};