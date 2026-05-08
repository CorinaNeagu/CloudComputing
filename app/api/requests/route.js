import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY); 
const uri = process.env.NEXT_ATLAS_URI;
const dbName = "PisicaDB";

export async function GET() {
  if (!uri) return NextResponse.json({ error: "Config lipsa" }, { status: 500 });
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const allRequests = await db.collection('adoption_requests').find({}).toArray();
    return NextResponse.json(allRequests || []);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function POST(req) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const body = await req.json();

    const newRequest = {
      ...body,
      status: 'pending',
      createdAt: new Date()
    };

    const result = await db.collection('adoption_requests').insertOne(newRequest);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function PATCH(req) {
  const client = new MongoClient(uri);

  try {
    const body = await req.json();
    const { requestId, newStatus, adopterEmail, catName } = body;

    await client.connect();
    const db = client.db(dbName);

    const result = await db.collection('adoption_requests').findOneAndUpdate(
      {
        _id: new ObjectId(requestId),
        status: "pending"
      },
      { $set: { status: newStatus } },
      { returnDocument: "after" }
    );

    if (!result) { 
      return NextResponse.json(
        { error: "Cererea nu mai este pending sau ID invalid" },
        { status: 400 }
      );
    }

    const originalRequest = result;

    if (newStatus === 'accepted') {
      
      await db.collection('adoption_requests').updateMany(
        {
          catId: originalRequest.catId,
          _id: { $ne: new ObjectId(requestId) }
        },
        { $set: { status: "rejected" } }
      );

      const adoptionExists = await db.collection('adoption').findOne({
        catId: originalRequest.catId
      });

      if (!adoptionExists) {
        await db.collection('adoption').insertOne({
          ...originalRequest,
          _id: new ObjectId(),
          status: 'completed',
          completedAt: new Date()
        });
      }

      if (adopterEmail) {
        const msg = {
          to: adopterEmail,
          from: "neagucorina22@stud.ase.ro",
          subject: `🐾 Cererea de adoptie pentru ${catName || 'pisicuta'} a fost acceptata!`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
              <h2 style="color: #4CAF50;">Vesti bune!</h2>
              <p>Bună,</p>
              <p>Cererea ta pentru <strong>${catName || 'pisicuta'}</strong> a fost acceptata cu succes.</p>
              <p>Proprietarul te va contacta în curand pentru a stabili detaliile finale.</p>
              <br>
              <p>Echipa CatAdopt</p>
            </div>
          `,
        };
        await sgMail.send(msg);
      }
    }

    return NextResponse.json({ success: true });

  } catch (e) {
    console.error("Eroare PATCH:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  } finally {
    await client.close();
  }
}