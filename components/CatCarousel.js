"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function CatCarousel({ cats = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!cats || cats.length <= 1) return;
    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, cats.length]);

  const handleNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === cats.length - 1 ? 0 : prev + 1));
      setIsAnimating(false);
    }, 500);
  };

  const handlePrev = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? cats.length - 1 : prev - 1));
      setIsAnimating(false);
    }, 500);
  };

  if (!cats || cats.length === 0) return null;
  const cat = cats[currentIndex];

  return (
    <div style={stageWrapper}>
      <div style={{...bgAura, backgroundImage: `url(${cat.imageUrl})` }} />

      <div style={mainContent}>
        <div style={visualSection}>
          <div style={{
            ...imageMask,
            opacity: isAnimating ? 0 : 1,
            transform: isAnimating ? "scale(0.9) rotate(-5deg)" : "scale(1) rotate(0deg)"
          }}>
            <Image
              src={cat.imageUrl || "/placeholder-cat.jpg"}
              alt={cat.name}
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
          
          <div style={navCircle}>
             <button onClick={handlePrev} style={smallArrow}>←</button>
             <div style={counter}>{currentIndex + 1} / {cats.length}</div>
             <button onClick={handleNext} style={smallArrow}>→</button>
          </div>
        </div>

        <div style={{
          ...textSection,
          opacity: isAnimating ? 0 : 1,
          transform: isAnimating ? "translateX(30px)" : "translateX(0)"
        }}>
          <h1 style={hugeTitle}>{cat.name}</h1>
          <h4 style={topLabel}>Poate fi noul tau prieten</h4>
          <div style={statsBox}>
            <div style={statItem}><span>Oras</span><strong>{cat.city}</strong></div>
            <div style={statDivider} />
            <div style={statItem}><span>Rasa</span><strong>{cat.breed || "Comuna"}</strong></div>
          </div>
          <p style={description}>
            Aceasta pisicuta isi cauta o familie. 
          </p>
          <button style={premiumBtn}>Autentifica-te pentru a ma adopta</button>
        </div>
      </div>
    </div>
  );
}


const stageWrapper = {
  position: "relative",
  width: "100%",
  minHeight: "650px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  backgroundColor: "#fff",
  fontFamily: "'Plus Jakarta Sans', sans-serif"
};

const bgAura = {
  position: "absolute",
  width: "140%",
  height: "140%",
  backgroundSize: "cover",
  backgroundPosition: "center",
  filter: "blur(80px) saturate(150%)",
  opacity: 0.15,
  transition: "background-image 1s ease-in-out",
  zIndex: 0
};

const mainContent = {
  position: "relative",
  zIndex: 1,
  width: "90%",
  maxWidth: "1100px",
  display: "flex",
  gap: "60px",
  alignItems: "center",
  flexWrap: "wrap"
};

const visualSection = {
  position: "relative",
  flex: "1",
  minWidth: "350px",
  height: "500px"
};

const imageMask = {
  position: "relative",
  width: "100%",
  height: "100%",
  borderRadius: "60% 40% 70% 30% / 40% 50% 60% 70%", 
  overflow: "hidden",
  boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
  transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)"
};

const textSection = {
  flex: "1",
  minWidth: "300px",
  transition: "all 0.5s ease"
};

const topLabel = {
  textTransform: "uppercase",
  letterSpacing: "3px",
  fontSize: "0.8rem",
  color: "#6366f1",
  fontWeight: "700",
  marginBottom: "10px"
};

const hugeTitle = {
  fontSize: "5rem",
  margin: "0",
  fontWeight: "900",
  color: "#1e293b",
  lineHeight: "0.9",
  letterSpacing: "-3px"
};

const statsBox = {
  display: "flex",
  gap: "20px",
  margin: "30px 0",
  padding: "20px",
  backgroundColor: "rgba(255,255,255,0.6)",
  backdropFilter: "blur(10px)",
  borderRadius: "20px",
  border: "1px solid rgba(0,0,0,0.05)"
};

const statItem = {
  display: "flex",
  flexDirection: "column",
  fontSize: "0.9rem",
  color: "#64748b"
};

const statDivider = {
  width: "1px",
  backgroundColor: "#e2e8f0"
};

const description = {
  fontSize: "1.1rem",
  color: "#475569",
  lineHeight: "1.6",
  maxWidth: "400px",
  marginBottom: "40px"
};

const premiumBtn = {
  padding: "18px 40px",
  backgroundColor: "#1e293b",
  color: "#fff",
  border: "none",
  borderRadius: "15px",
  fontSize: "1rem",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
  transition: "transform 0.2s"
};

const navCircle = {
  position: "absolute",
  bottom: "-20px",
  right: "0",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  backgroundColor: "#fff",
  padding: "10px 20px",
  borderRadius: "50px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
};

const smallArrow = {
  border: "none",
  background: "none",
  fontSize: "1.2rem",
  cursor: "pointer",
  padding: "5px 10px",
  color: "#1e293b",
  fontWeight: "bold"
};

const counter = {
  fontSize: "0.9rem",
  fontWeight: "700",
  color: "#64748b",
  borderLeft: "1px solid #eee",
  borderRight: "1px solid #eee",
  padding: "0 15px"
};