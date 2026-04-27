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
    return (
      <div className="flex flex-col items-center p-10">
        <h1 className="text-2xl font-bold">Pisica nu a fost gasita!</h1>
        <Link href="/" className="mt-4 text-blue-500 underline">Înapoi la listă</Link>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <Link href="/" className="text-sm text-gray-500 hover:text-black mb-4 inline-block">
        ← Înapoi la toate pisicile
      </Link>

      <div className="grid md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl shadow-lg">
        <div className="relative h-96 w-full rounded-xl overflow-hidden shadow-md">
          <Image
            src={cat.image || "/placeholder-cat.jpg"} 
            alt={cat.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{cat.name}</h1>
          <p className="text-xl text-orange-600 font-semibold mb-4">{cat.breed}</p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-gray-700 leading-relaxed">
              {cat.description || "Aceasta pisica abia asteapta sa fie adoptata si sa primeasca un camin calduros."}
            </p>
          </div>

          <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-full transition-colors shadow-lg">
            Adopta {cat.name}
          </button>
        </div>
      </div>
    </main>
  );
}