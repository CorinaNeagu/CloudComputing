"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function CatCarousel({ cats }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!cats || cats.length === 0) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 2000); 

    return () => clearInterval(interval);
  }, [currentIndex, cats]); 

  if (!cats || cats.length === 0) {
    return <p style={{ textAlign: "center" }}>Nu sunt pisici disponibile momentan.</p>;
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === cats.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? cats.length - 1 : prevIndex - 1
    );
  };

  const currentCat = cats[currentIndex];

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ 
        position: "relative", 
        height: "450px", 
        borderRadius: "20px", 
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        transition: "all 0.5s ease-in-out" 
      }}>
        <Image
          src={currentCat.imageUrl || "/placeholder-cat.jpg"}
          alt={currentCat.name}
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        
        <div style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          padding: "30px 20px",
          background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
          color: "white",
          textAlign: "center"
        }}>
          <h2 style={{ margin: 0, fontSize: "1.8rem" }}>{currentCat.name}</h2>
          <p style={{ margin: "5px 0 0", fontSize: "1.1rem", opacity: 0.9 }}>
            📍 {currentCat.city} • {currentCat.breed}
          </p>
        </div>
      </div>

      <button onClick={prevSlide} style={{ ...navBtnStyle, left: "15px" }}>❮</button>
      <button onClick={nextSlide} style={{ ...navBtnStyle, right: "15px" }}>❯</button>
      
      <div style={{ textAlign: "center", marginTop: "15px" }}>
        {cats.map((_, index) => (
          <span 
            key={index} 
            onClick={() => setCurrentIndex(index)} 
            style={{
              height: "12px",
              width: currentIndex === index ? "24px" : "12px", 
              backgroundColor: currentIndex === index ? "#3b82f6" : "#cbd5e1",
              borderRadius: "10px",
              display: "inline-block",
              margin: "0 4px",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
          />
        ))}
      </div>
    </div>
  );
}

const navBtnStyle = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  backgroundColor: "rgba(255, 255, 255, 0.85)",
  border: "none",
  borderRadius: "50%",
  width: "45px",
  height: "45px",
  cursor: "pointer",
  fontSize: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10,
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  color: "#333",
  transition: "background 0.2s"
};