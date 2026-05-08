import sgMail from '@sendgrid/mail';
import { NextResponse } from 'next/server';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(req) {
    console.log("Verificare cheie:", process.env.SENDGRID_API_KEY?.substring(0, 5));
  try {
    const { to, catName, fromName, fromEmail } = await req.json();

    const msg = {
      to: to, 
      from: process.env.SENDGRID_FROM_EMAIL,
      replyTo: fromEmail, 
      subject: `🐾 Cerere de adoptie: ${catName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #6366f1;">Ai o cerere noua de adoptie!</h2>
          <p>Utilizatorul <strong>${fromName}</strong> (${fromEmail}) este interesat de <strong>${catName}</strong>.</p>
          <p style="background: #f8fafc; padding: 15px; border-radius: 8px;">
            "Buna! Am vazut anuntul tau pe CatAdopt si as dori sa aflu mai multe detalii despre procesul de adoptie."
          </p>
          <p>Poti raspunde direct la acest email pentru a lua legatura cu solicitantul.</p>
          <footer style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
            Trimis automat de platforma CatAdopt.
          </footer>
        </div>
      `,
    };

    await sgMail.send(msg);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("SendGrid Error:", error.response?.body || error);
    return NextResponse.json({ error: "Eroare la trimiterea email-ului." }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { status, adopterEmail, catName } = await req.json();
    
    const collection = await getCollection("adoption_requests");

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: status } }
    );

    if (status === 'accepted') {
      const msg = {
        to: adopterEmail,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: `🎉 Veste bună: Cererea ta de adoptie pentru ${catName} a fost acceptata!`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #10b981;">Felicitări! 🐾</h2>
            <p>Cererea ta de adoptie pentru <strong>${catName}</strong> a fost acceptata de catre proprietar.</p>
            <p>In scurt timp vei fi contactat pentru a stabili detaliile logistice.</p>
            <p style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
              Va multumim ca ati ales sa oferiti o casa unui animalut!
            </p>
            <footer style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
              Echipa CatAdopt
            </footer>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log("Email de acceptare trimis catre:", adopterEmail);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("SendGrid/Update Error:", error.response?.body || error);
    return NextResponse.json({ error: "Eroare la procesare." }, { status: 500 });
  }
}