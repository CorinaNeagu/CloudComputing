import { getCollection } from "@/lib/mongo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  try {
    const { catId, catName } = await req.json();
    const collection = await getCollection("adoptions");

    const newAdoption = {
      userId: session.user.email, 
      catId,
      catName,
      status: "în așteptare",
      createdAt: new Date(),
    };

    await collection.insertOne(newAdoption);
    return NextResponse.json({ message: "Cerere trimisă cu succes!" });
  } catch (error) {
    return NextResponse.json({ error: "Eroare la salvare" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([], { status: 401 });

  try {
    const collection = await getCollection("adoptions");
    const myAdoptions = await collection.find({ userId: session.user.email }).toArray();
    return NextResponse.json(myAdoptions);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}