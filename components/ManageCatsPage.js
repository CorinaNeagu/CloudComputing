import React from 'react';

export default function ManageCatsPage({ 
  cats = [], 
  requests = [], 
  session, 
  setView, 
  setEditingCat, 
  handleDelete, 
  handleRequestStatus 
}) {
  const [sortType, setSortType] = React.useState("recent");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const userCats = cats.filter(cat => cat.creatorEmail === session?.user?.email);

  const filteredByStatus = userCats.filter(cat => {
    if (statusFilter === "available") return !cat.isAdopted;
    if (statusFilter === "adopted") return cat.isAdopted;
    return true; 
  });

  const finalCats = [...filteredByStatus].sort((a, b) => {
    if (sortType === "recent") {
      return new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id);
    }
    if (sortType === "oldest") {
      return new Date(a.createdAt || a._id) - new Date(b.createdAt || b._id);
    }
    return 0;
  });

  return (
    <section className="fade-in" style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h2 className="cat-name" style={{ fontSize: '2rem', margin: 0 }}>Anunturile mele</h2>
          
          <div style={{ marginTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
            <div style={filterGroupStyle}>
              <label style={labelStyle}>Sortează:</label>
              <select value={sortType} onChange={(e) => setSortType(e.target.value)} style={selectStyle}>
                <option value="recent">Recente</option>
                <option value="oldest">Vechi</option>
              </select>
            </div>

            <div style={filterGroupStyle}>
              <label style={labelStyle}>Status:</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
                <option value="all">Toate</option>
                <option value="available">Disponibile</option>
                <option value="adopted">Adoptate</option>
              </select>
            </div>
          </div>
        </div>
        
        <button onClick={() => setView("home")} className="btn-back" style={{ position: 'static' }}>
          ← Inapoi
        </button>
      </header>

      {finalCats.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {finalCats.map(cat => (
            <div key={cat._id} className="cat-card-manage" style={cardStyle}>
              
              <div style={cardHeaderStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <img src={cat.imageUrl} alt={cat.name} style={catImageStyle} />
                  <div>
                    <h4 style={{ margin: 0 }}>{cat.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>📍 {cat.city}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => { setEditingCat(cat); setView("edit"); }} 
                    className="btn-secondary" 
                    disabled={cat.isAdopted}
                    style={{
                      ...actionBtnStyle,
                      backgroundColor: cat.isAdopted ? '#e2e8f0' : undefined,
                      cursor: cat.isAdopted ? 'not-allowed' : 'pointer',
                      opacity: cat.isAdopted ? 0.6 : 1,
                    }}
                  >
                    {cat.isAdopted ? "🔒" : "✏️"}
                  </button>

                  <button 
                    onClick={() => handleDelete(cat._id)} 
                    className="btn-logout" 
                    disabled={cat.isAdopted}
                    style={{
                      ...actionBtnStyle,
                      backgroundColor: cat.isAdopted ? '#f1f5f9' : undefined,
                      cursor: cat.isAdopted ? 'not-allowed' : 'pointer',
                      opacity: cat.isAdopted ? 0.5 : 1,
                      filter: cat.isAdopted ? 'grayscale(1)' : 'none'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="timeline-section">
                <h5 style={timelineTitleStyle}>
                  <span style={dotStyle}></span>
                  Timeline Cereri
                </h5>
                
                <div style={timelineListStyle}>
                  {requests.filter(req => req.catId === cat._id).length > 0 ? (
                    requests.filter(req => req.catId === cat._id).map((req) => (
                      <div key={req._id} className={`timeline-card ${req.status}`} style={timelineCardStyle}>
                        <div style={{ 
                          ...statusIndicatorStyle, 
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
                                <span style={statusTextStyle}>❌ Respins</span>
                              ) : (
                                <>
                                  <button onClick={() => handleRequestStatus(req._id, 'accepted', cat._id)} style={btnAcceptStyle}>Acceptă</button>
                                  <button onClick={() => handleRequestStatus(req._id, 'rejected', cat._id)} style={btnRejectStyle}>Refuză</button>
                                </>
                              )
                            ) : (
                              <span style={{ ...statusTextStyle, color: req.status === 'accepted' ? '#10b981' : '#ef4444' }}>
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
        <div className="fade-in" style={emptyStateStyle}>
          <div style={{ fontSize: '64px' }}>🐱</div>
          <div style={{ maxWidth: '400px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '8px' }}>
              {statusFilter === "all" ? "Nu ai adaugat nicio pisica inca" : "Nu exista pisici in aceasta categorie"}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {statusFilter === "all" ? "Anunturile tale vor aparea aici." : "Incearca sa schimbi filtrul."}
            </p>
          </div>
          {statusFilter === "all" && <button onClick={() => setView("add")} style={btnAddFirstStyle}>+ Adaugă prima ta pisică</button>}
        </div>
      )}
    </section>
  );
}

const filterGroupStyle = { display: 'flex', alignItems: 'center', gap: '8px' };
const labelStyle = { fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' };
const selectStyle = { padding: '6px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' };

const containerStyle = { maxWidth: '800px', margin: '0 auto' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const cardStyle = { background: 'white', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '10px' };
const cardHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' };
const catImageStyle = { width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' };
const actionBtnStyle = { padding: '6px 12px', fontSize: '0.8rem' };
const timelineTitleStyle = { fontSize: '0.9rem', color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' };
const dotStyle = { background: '#6366f1', width: '8px', height: '8px', borderRadius: '50%' };
const timelineListStyle = { display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '2px solid #e2e8f0', marginLeft: '4px', paddingLeft: '20px' };
const timelineCardStyle = { position: 'relative', padding: '12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' };
const statusIndicatorStyle = { position: 'absolute', left: '-25px', top: '50%', transform: 'translateY(-50%)', width: '10px', height: '10px', borderRadius: '50%' };
const statusTextStyle = { fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '800' };
const btnAcceptStyle = { background: '#10b981', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '8px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 'bold' };
const btnRejectStyle = { background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '8px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 'bold' };
const emptyStateStyle = { textAlign: 'center', padding: '80px 40px', background: 'white', borderRadius: '32px', border: '2px dashed #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' };
const btnAddFirstStyle = { backgroundColor: '#6366f1', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' };