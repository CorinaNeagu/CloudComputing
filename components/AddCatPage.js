import React from 'react';

export default function AddCatPage({ 
  setView, 
  handleAddCat, 
  newCat, 
  setNewCat, 
  handleImageChange, 
  imagePreview, 
  setImagePreview,
  uploading 
}) {
  return (
    <section className="fade-in form-container" style={formContainerStyle}>
      <button 
        onClick={() => {
          setNewCat({ name: '', breed: '', city: '', description: '' });
          if (typeof setImagePreview === 'function') {
            setImagePreview(null); 
          }
          const fileInput = document.getElementById('cat-image-upload');
          if (fileInput) {
            fileInput.value = "";
          }
          setView("home");
        }} 
        className="btn-back"
      >
        ← Inapoi
      </button>
      <h2 style={{ marginTop: '1rem' }}>Adauga un anunt nou</h2>
      
      <form onSubmit={handleAddCat} className="cat-form" style={formStyle}>
        <input 
            type="text" 
            placeholder="Numele pisicii" 
            required 
            value={newCat.name} 
            onChange={e => setNewCat({...newCat, name: e.target.value})} 
            style={inputStyle} 
            />
        <input 
          type="text" placeholder="Rasă" 
          value={newCat.breed} 
          onChange={e => setNewCat({...newCat, breed: e.target.value})} 
          style={inputStyle} 
        />
        <input 
          type="text" placeholder="Oraș / Locație" required 
          value={newCat.city} 
          onChange={e => setNewCat({...newCat, city: e.target.value})} 
          style={inputStyle} 
        />
        
        <label style={{ fontSize: '0.8rem', color: '#666' }}>Alege poza pisicii:</label>
        <input 
          id="cat-image-upload" type="file" accept="image/*" required 
          onChange={handleImageChange} 
          style={fileInputStyle} 
        />
        
        {imagePreview && (
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
            <img src={imagePreview} alt="Previzualizare" style={previewImageStyle} />
          </div>
        )}
        
        <textarea 
          placeholder="Descrie personalitatea pisicii..." 
          value={newCat.description} 
          onChange={e => setNewCat({...newCat, description: e.target.value})} 
          style={{ ...inputStyle, height: '100px' }} 
        />

        <button 
          type="submit" 
          disabled={uploading} 
          style={{ 
            ...submitBtnStyle, 
            backgroundColor: uploading ? '#ccc' : '#22c55e',
            cursor: uploading ? 'not-allowed' : 'pointer'
          }}
        >
          {uploading ? "Se incarca..." : "Salvează Anuntul"}
        </button>
      </form>
    </section>
  );
}

const formContainerStyle = { maxWidth: '500px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '1.5rem' };
const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', transition: 'border-color 0.3s ease, box-shadow 0.3s ease' };
const fileInputStyle = { padding: '10px', borderRadius: '8px', border: '1px dashed #ddd' };
const previewImageStyle = { maxWidth: '100%', maxHeight: '200px', borderRadius: '10px', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' };
const submitBtnStyle = { color: 'white', padding: '12px', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem' };