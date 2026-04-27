import clientPromise from "@/lib/mongo";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("PisicaDB");
    const cats = await db.collection("cats").find({}).toArray();
    return NextResponse.json(cats);

  } catch (error) {
    console.error("Eroare la preluarea pisicilor din Cloud:", error);
    return NextResponse.json([], { status: 500 });
  }
}