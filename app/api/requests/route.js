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
    const { requestId, newStatus, adopterEmail, catName } = body; // 2. Extragem datele trimise din frontend

    await client.connect();
    const db = client.db(dbName);

    const originalRequest = await db.collection('adoption_requests').findOne({ 
      _id: new ObjectId(requestId) 
    });

    if (!originalRequest) return NextResponse.json({ error: "Nu exista" }, { status: 404 });

    // Actualizăm statusul în colecția principală
    await db.collection('adoption_requests').updateOne(
      { _id: new ObjectId(requestId) },
      { $set: { status: newStatus } }
    );

    if (newStatus === 'accepted') {
      // 3. Mutăm în colecția 'adoption'
      await db.collection('adoption').insertOne({
        ...originalRequest,
        _id: new ObjectId(),
        status: 'completed',
        completedAt: new Date()
      });

      // 4. TRIMITEM EMAIL-UL PRIN SENDGRID
      if (adopterEmail) {
        const msg = {
          to: adopterEmail,
          from: "neagucorina22@stud.ase.ro",
          subject: `Cererea de adopție pentru ${catName || 'pisicuță'} a fost acceptată!`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
              <h2 style="color: #4CAF50;">Vești bune!</h2>
              <p>Bună,</p>
              <p>Cererea ta pentru <strong>${catName || 'pisicuță'}</strong> a fost acceptată cu succes.</p>
              <p>Proprietarul te va contacta în curând pentru a stabili detaliile finale.</p>
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