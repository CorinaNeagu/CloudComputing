import { getCollection } from "@/lib/mongo";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const collection = await getCollection("cats");
  const cats = await collection.find({}).toArray();
  return NextResponse.json(cats);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Loghează-te!" }, { status: 401 });

  try {
    const body = await req.json();
    const collection = await getCollection("cats");

    const newCat = {
      name: body.name,
      breed: body.breed,
      imageUrl: body.imageUrl, 
      description: body.description,
      city: body.city,
      creatorEmail: session.user.email,
      status: "disponibil",
      createdAt: new Date()
    };

    const result = await collection.insertOne(newCat);
    
    return NextResponse.json({ 
      message: "Pisica a fost adaugata!", 
      success: true, 
      id: result.insertedId 
    }, { status: 201 });

  } catch (e) {
    console.error("Eroare API Cats:", e);
    return NextResponse.json({ error: "Eroare la baza de date" }, { status: 500 });
  }
}