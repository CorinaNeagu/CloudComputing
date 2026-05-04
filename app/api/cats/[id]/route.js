import { getCollection } from "@/lib/mongo";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  try {
    const { id } = await params; 
    
    const catsCollection = await getCollection("cats");
    const requestsCollection = await getCollection("adoption_requests");
    const adoptionCollection = await getCollection("adoption"); 

    const query = {
      $or: [
        { catId: id }, 
        { catId: new ObjectId(id) }
      ]
    };

    const delReq = await requestsCollection.deleteMany(query);
    console.log(`Șterse din adoption_requests: ${delReq.deletedCount}`);

    const delAdoption = await adoptionCollection.deleteMany(query);
    console.log(`Șterse din adoption: ${delAdoption.deletedCount}`);

    const result = await catsCollection.deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 1) {
      return NextResponse.json({ message: "Curățare completă realizată" }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Pisica nu a fost găsită" }, { status: 404 });
    }
    
  } catch (error) {
    console.error("Eroare la ștergerea în cascadă:", error);
    return NextResponse.json({ error: "Eroare server la ștergere" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const collection = await getCollection("cats");

    const updateData = {};
    if (body.name) updateData.name = body.name;
    if (body.breed) updateData.breed = body.breed;
    if (body.city) updateData.city = body.city;
    if (body.description) updateData.description = body.description;
    if (body.imageUrl) updateData.imageUrl = body.imageUrl;
    
    if (Object.prototype.hasOwnProperty.call(body, 'isAdopted')) {
      updateData.isAdopted = body.isAdopted;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Nimic de actualizat" }, { status: 200 });
    }

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Eroare la update" }, { status: 500 });
  }
}