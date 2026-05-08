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
    
    console.log("--- DEBUG BACKEND ---");
    console.log("ID primit în URL:", id);
    console.log("Câmpuri primite în body:", Object.keys(body));
    console.log("Valoare creatorEmail primită:", body.creatorEmail);
    console.log("Date primite pentru update la ID-ul:", id, body);

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
      return NextResponse.json({ message: "Nu s-au trimis date pentru actualizare" }, { status: 400 });
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      console.error("Nu s-a găsit nicio pisică cu ID-ul:", id);
      return NextResponse.json({ error: "Pisica nu a fost găsită în baza de date" }, { status: 404 });
    }

    if (updateData.name || updateData.imageUrl) {
      const requestsCollection = await getCollection("adoption_requests");
  
        const requestUpdateData = {};
  if (updateData.name) requestUpdateData.catName = updateData.name;
  if (updateData.imageUrl) requestUpdateData.catImageUrl = updateData.imageUrl;

  const cascadeResult = await requestsCollection.updateMany(
    { catId: id }, 
    { $set: requestUpdateData }
  );
  
  console.log(`Cascadare: ${cascadeResult.modifiedCount} cereri actualizate.`);
}
    console.log("Obiectul final care pleacă spre MongoDB ($set):", updateData);

    console.log("Update reușit:", result);
    return NextResponse.json({ 
      success: true, 
      message: "Actualizat cu succes (inclusiv cererile asociate)",
      modified: result.modifiedCount 
    }, { status: 200 });

  } catch (error) {
    console.error("Eroare server la PUT:", error);
    return NextResponse.json(
      { error: "Eroare internă la procesarea actualizării" }, 
      { status: 500 }
    );
  }
}