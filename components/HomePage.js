import React, { useState } from 'react'; 
import Link from 'next/link';
import CatCarousel from './CatCarousel'; 

export default function HomePage({ 
  session, 
  cats, 
  isAdoptedByMe, 
  hasPendingRequest, 
  setSelectedCat, 
  selectedCat, 
  confirmAdoption 
}) {
  const [filter, setFilter] = useState("available"); 
  const [sortOrder, setSortOrder] = useState("recent");

  const filteredCats = cats
  .filter(cat => {
    if (filter === "available") return !cat.isAdopted;
    if (filter === "adopted") return cat.isAdopted;
    return true; 
  })
  .sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
  });

  

  return (
    <section className="fade-in">
      <header className="page-header" style={headerContainerStyle}>
        <div style={titleWrapperStyle}>
          <h2 style={titleStyle}>
            Pisici in cautarea unei <span style={highlightStyle}>case primitoare</span>
          </h2>
        </div>
        <p style={subtitleStyle}>Gaseste-ti viitorul prieten blanos printre anunturile de mai jos</p>
        
      </header>

      {!session ? (
        <div style={{ marginTop: "1rem" }}>
          <CatCarousel cats={cats} />
        </div>
      ) : (
        <>
          <div style={filterContainerStyle}>
            <button 
              onClick={() => setFilter("available")} 
              style={filter === "available" ? activeFilterStyle : inactiveFilterStyle}
            >
              Disponibile
            </button>
            <button 
              onClick={() => setFilter("adopted")} 
              style={filter === "adopted" ? activeFilterStyle : inactiveFilterStyle}
            >
              Adoptate
            </button>
            <button 
              onClick={() => setFilter("all")} 
              style={filter === "all" ? activeFilterStyle : inactiveFilterStyle}
            >
              Toate
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Ordonează după:</span>
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              style={selectStyle}
            >
              <option value="recent">Cele mai recente</option>
              <option value="oldest">Cele mai vechi</option>
            </select>
          </div>

          <div className="cat-grid" style={{ marginTop: '2rem' }}>
            {filteredCats.length > 0 ? (
              filteredCats.map((cat) => (
                <div key={cat._id} className="cat-card">
                  <Link href={`/details/${cat._id}`} className="cat-link-wrapper">
                    <div className="image-container">
                      <img src={cat.imageUrl} className="cat-image" alt={cat.name} />
                      <div className="location-tag">📍 {cat.city}</div>
                    </div>
                    <div className="cat-details">
                      <h3>{cat.name}</h3>
                      <p className="cat-desc">{cat.description?.substring(0, 60)}...</p>
                    </div>
                  </Link>

                  <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                    {cat.isAdopted ? (
                      isAdoptedByMe(cat._id) ? (
                        <button className="btn-adopt" disabled style={btnMyFriendStyle}>
                          🎉 Felicitari! E prietenul tau
                        </button>
                      ) : (
                        <button className="btn-adopt" disabled style={btnAlreadyAdoptedStyle}>
                          🏠 {cat.name} si-a gasit deja o casă
                        </button>
                      )
                    ) : (
                      <>
                        {session?.user?.email === cat.creatorEmail ? (
                          <button className="btn-adopt" disabled style={btnOwnAdStyle}>
                            📢 Anuntul tau
                          </button>
                        ) : hasPendingRequest(cat._id) ? (
                          <button className="btn-adopt" disabled style={btnPendingStyle}>
                            📩 Cerere trimisa
                          </button>
                        ) : (
                          <button className="btn-adopt active" onClick={() => setSelectedCat(cat)} style={{ width: '100%' }}>
                            Adopta acum <span>→</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', gridColumn: '1/-1', padding: '2rem', color: '#64748b' }}>
                Nu am găsit nicio pisicuță în această categorie. 🐾
              </p>
            )}
          </div>
        </>
      )}

      {selectedCat && (
        <div className="modal-overlay fade-in">
          <div className="modal-content">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐱</div>
            <h3>Vrei sa-l adopți pe {selectedCat.name}?</h3>
            <p>Vom deschide aplicatia de email pentru a-i trimite un mesaj lui <strong>{selectedCat.creatorEmail}</strong>.</p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={confirmAdoption}>Da, trimite mesajul</button>
              <button className="btn-secondary" onClick={() => setSelectedCat(null)}>Ma mai gândesc</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const filterContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '10px',
  marginTop: '20px'
};

const baseFilterStyle = {
  padding: '8px 18px',
  borderRadius: '20px',
  border: 'none',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontSize: '0.9rem'
};

const activeFilterStyle = {
  ...baseFilterStyle,
  backgroundColor: '#9370DB',
  color: 'white',
  boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)'
};

const inactiveFilterStyle = {
  ...baseFilterStyle,
  backgroundColor: '#e2e8f0',
  color: '#475569'
};

const selectStyle = {
  padding: '5px 12px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  backgroundColor: 'white',
  color: '#475569',
  fontSize: '0.85rem',
  fontWeight: '600',
  cursor: 'pointer',
  outline: 'none',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
};

const btnMyFriendStyle = { backgroundColor: '#DA70D6', color: 'white', cursor: 'default', width: '100%' };
const btnAlreadyAdoptedStyle = { backgroundColor: 'salmon', color: 'white', cursor: 'not-allowed', width: '100%', fontSize: '0.8rem' };
const btnOwnAdStyle = { backgroundColor: '#94a3b8', cursor: 'not-allowed', opacity: 0.7, width: '100%' };
const btnPendingStyle = { backgroundColor: '#50bfdd', color: 'white', cursor: 'not-allowed', width: '100%' };
const headerContainerStyle = { textAlign: 'center', padding: '3rem 1rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' };
const titleStyle = { fontSize: '2.5rem', fontWeight: '850', color: '#1e293b', marginBottom: '0.5rem', letterSpacing: '-0.025em' };
const highlightStyle = { background: 'linear-gradient(to right, #3b82f6, #BA55D3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };
const subtitleStyle = { color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' };
const titleWrapperStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '10px' };