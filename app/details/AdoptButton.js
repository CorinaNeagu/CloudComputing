"use client";

import { useSession } from "next-auth/react";
import styles from "./details.module.css";

export default function AdoptButton({ catId, catName }) {
  const { data: session } = useSession();

  async function handleAdopt() {
    if (!session) {
      alert("Trebuie să fii logat pentru a adopta o pisică!");
      return;
    }

    const res = await fetch("/api/adoptions", {
      method: "POST",
      body: JSON.stringify({ catId, catName }),
      headers: { "Content-Type": "application/json" }
    });

    if (res.ok) {
      alert(`Cererea pentru ${catName} a fost trimisă cu succes!`);
    } else {
      alert("A apărut o eroare. Încearcă din nou.");
    }
  }

  return (
    <button onClick={handleAdopt} className={styles.adoptButton}>
      Adoptă {catName}
    </button>
  );
}