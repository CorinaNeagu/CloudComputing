import sgMail from '@sendgrid/mail';
import { NextResponse } from 'next/server';

// Setăm cheia API
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(req) {
    console.log("Verificare cheie:", process.env.SENDGRID_API_KEY?.substring(0, 5));
  try {
    const { to, catName, fromName, fromEmail } = await req.json();

    const msg = {
      to: to, // Emailul celui care a postat pisica
      from: process.env.SENDGRID_FROM_EMAIL, // Adresa ta verificată
      replyTo: fromEmail, // Adresa celui care vrea să adopte
      subject: `🐾 Cerere de adopție: ${catName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #6366f1;">Ai o cerere nouă de adopție!</h2>
          <p>Utilizatorul <strong>${fromName}</strong> (${fromEmail}) este interesat de <strong>${catName}</strong>.</p>
          <p style="background: #f8fafc; padding: 15px; border-radius: 8px;">
            "Bună! Am văzut anunțul tău pe CatAdopt și aș dori să aflu mai multe detalii despre procesul de adopție."
          </p>
          <p>Poți răspunde direct la acest email pentru a lua legătura cu solicitantul.</p>
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