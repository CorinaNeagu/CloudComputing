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
    console.error("Eroare la încărcarea pisicii:", error);
  }

  if (!cat) {
    return <div style={{ padding: "20px", textAlign: "center" }}>Pisica nu a fost găsită!</div>;
  }

  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <Link href="/" style={{ marginBottom: "20px", display: "inline-block", color: "#666" }}>
        ← Inapoi la toate pisicile
      </Link>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }}>
        <div style={{ position: "relative", width: "300px", height: "300px" }}>
          <Image
            src={cat.imageUrl || "/placeholder-cat.jpg"}
            alt={cat.name}
            fill
            style={{ objectFit: 'cover', borderRadius: "8px" }}
          />
        </div>

        <div style={{ flex: "1", minWidth: "250px" }}>
          <h1 style={{ fontSize: "2rem", margin: "0 0 10px 0" }}>{cat.name}</h1>
          <p style={{ fontStyle: "italic", color: "#555" }}>{cat.breed}</p>
          
          <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "4px" }}>
            <p style={{ lineHeight: "1.6" }}>
              {cat.description || "Această pisică abia așteaptă un cămin."}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}