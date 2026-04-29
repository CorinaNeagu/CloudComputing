import { getCollection } from "@/lib/mongo";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  try {
    const { id } = await params; 
    console.log("Încerc să șterg pisica cu ID:", id);

    const collection = await getCollection("cats");

    const result = await collection.deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 1) {
      console.log("Ștergere reușită din MongoDB!");
      return NextResponse.json({ message: "Succes" }, { status: 200 });
    } else {
      console.log("Nu am găsit nicio pisică cu acest ID.");
      return NextResponse.json({ error: "Nu a fost găsită" }, { status: 404 });
    }
  } catch (error) {
    console.error("Eroare server la DELETE:", error);
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const collection = await getCollection("cats");

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          name: body.name, 
          breed: body.breed, 
          city: body.city,
          description: body.description,
          imageUrl: body.imageUrl,
        } 
      }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Eroare la update" }, { status: 500 });
  }
}