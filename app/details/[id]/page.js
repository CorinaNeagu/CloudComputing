import { getCollection } from "@/lib/mongo";
import { ObjectId } from "mongodb";
import Image from "next/image";
import Link from "next/link";

export default async function CatDetailsPage({ params }) {
  const { id } = await params;
  let cat = null;

  try {
    const collection = await getCollection("cats");
    cat = await collection.findOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error("Eroare:", error);
  }

  if (!cat) return <div style={centerStyle}>Pisica nu a fost găsită!</div>;

  return (
    <main className="fade-in" style={wrapperStyle}>
      
      <div style={containerStyle}>
        <Link href="/" style={backButtonStyle}>← Înapoi</Link>

        <div style={imageSectionStyle}>
          <Image
            src={cat.imageUrl || "/placeholder-cat.jpg"}
            alt={cat.name}
            fill
            priority
            style={{ objectFit: 'cover' }}
          />
          <div style={badgeStyle}>📍 {cat.city}</div>
        </div>

        <div style={infoSectionStyle}>
          <header>
            <h1 style={nameStyle}>{cat.name}</h1>
            <span style={breedStyle}>{cat.breed || "Altele"}</span>
          </header>

          <div style={descriptionWrapperStyle}>
            <h4 style={subTitleStyle}>Povestea lui {cat.name}:</h4>
            <p style={textStyle}>
              {cat.isAdopted ? (
                <span style={{ fontWeight: 'bold', color: '#4CAF50' }}>
                  ✨ Aceasta pisica si-a găsit deja un stapan iubitor!
                </span>
              ) : (
                cat.description || "Aceasta pisica abia asteapta un camin iubitor."
              )}
            </p>
          </div>

          <footer style={footerStyle}>
            <div style={contactStyle}>
              <small style={{color: '#94a3b8'}}>Contact:</small>
              <div style={{fontWeight: '500'}}>{cat.creatorEmail}</div>
            </div>
            
            {cat.isAdopted ? (
              <div style={statusAdopted}>Adoptat 🎉</div>
            ) : (
              <div style={statusAvailable}>Disponibil</div>
            )}
          </footer>
        </div>
      </div>
    </main>
  );
}

const wrapperStyle = { height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",padding: "20px", backgroundColor: "#f1f5f9", overflow: "hidden"  };

const containerStyle = {
  display: "flex",
  width: "100%",
  maxWidth: "1000px",
  height: "80vh", 
  backgroundColor: "white",
  borderRadius: "30px",
  overflow: "hidden",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
  position: "relative"
};

const backButtonStyle = {
  position: "absolute",
  top: "20px",
  left: "20px",
  zIndex: 10,
  padding: "8px 16px",
  background: "rgba(255,255,255,0.8)",
  backdropFilter: "blur(4px)",
  borderRadius: "12px",
  textDecoration: "none",
  color: "#1e293b",
  fontWeight: "bold",
  fontSize: "0.9rem"
};

const imageSectionStyle = {
  flex: "1.2", 
  position: "relative",
  height: "100%"
};

const infoSectionStyle = {
  flex: "1",
  padding: "40px",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  backgroundColor: "white"
};

const descriptionWrapperStyle = {
  flex: "1", 
  overflowY: "auto", 
  margin: "20px 0",
  paddingRight: "10px"
};

const nameStyle = { fontSize: "2.8rem", margin: 0, color: "#1e293b", fontWeight: "800" };
const breedStyle = { color: "#6366f1", fontWeight: "600", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "1px" };
const subTitleStyle = { fontSize: "1.1rem", marginBottom: "10px", color: "#475569" };
const textStyle = { lineHeight: "1.6", color: "#64748b", fontSize: "1rem" };
const footerStyle = { borderTop: "1px solid #f1f5f9", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" };
const badgeStyle = { position: "absolute", bottom: "20px", right: "20px", background: "white", padding: "6px 12px", borderRadius: "10px", fontWeight: "bold", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" };
const statusAvailable = { background: "#e0f2fe", color: "#0369a1", padding: "6px 12px", borderRadius: "8px", fontWeight: "bold", fontSize: "0.8rem" };
const statusAdopted = { background: "#dcfce7", color: "#16a34a", padding: "6px 12px", borderRadius: "8px", fontWeight: "bold", fontSize: "0.8rem" };
const centerStyle = { height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" };
const contactStyle = { display: "flex", flexDirection: "column", gap: "2px" };