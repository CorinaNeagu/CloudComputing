import { getCollection } from "@/lib/mongo";
import { ObjectId } from "mongodb";
import Image from "next/image";
import Link from "next/link";
import styles from "./details.module.css";
import AdoptButton from "./AdoptButton";

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
    return <div className={styles.container}>Pisica nu a fost găsită!</div>;
  }

  return (
    <main className={styles.container}>
      <Link href="/" className={styles.backLink}>
        ← Înapoi la toate pisicile
      </Link>

      <div className={styles.card}>
        <div className={styles.imageWrapper}>
          <Image
            src={cat.image || "/placeholder-cat.jpg"}
            alt={cat.name}
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>

        <div>
          <h1 className={styles.title}>{cat.name}</h1>
          <p className={styles.breed}>{cat.breed}</p>
          
          <div className={styles.descriptionBox}>
            <p className={styles.descriptionText}>
              {cat.description || "Această pisică abia așteaptă un cămin."}
            </p>
          </div>

          <AdoptButton catId={cat._id.toString()} catName={cat.name} />
        </div>
      </div>
    </main>
  );
}