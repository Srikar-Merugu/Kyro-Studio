import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // Notify Kyro inbox
    await resend.emails.send({
      from: "Kyro Studio Contact <contact@kyrostudio.eu>",
      to: "hello@kyrostudio.eu",
      replyTo: email,
      subject: `New inquiry from ${name}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; background: #ffffff;">
          <div style="margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #D4D93F;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: #0A0A0B;">KYRO STUDIO</h1>
            <p style="margin: 4px 0 0; font-size: 12px; color: #888; letter-spacing: 0.1em; text-transform: uppercase;">New Website Inquiry</p>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eee; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #888; width: 100px;">Name</td>
              <td style="padding: 14px 0; border-bottom: 1px solid #eee; color: #0A0A0B; font-size: 15px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eee; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #888;">Email</td>
              <td style="padding: 14px 0; border-bottom: 1px solid #eee; font-size: 15px;"><a href="mailto:${email}" style="color: #200F8C; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 14px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #888; vertical-align: top;">Message</td>
              <td style="padding: 14px 0; color: #0A0A0B; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>
          <div style="margin-top: 32px; padding: 16px 20px; background: #f5f5f2; border-radius: 10px;">
            <p style="margin: 0; color: #666; font-size: 13px;">Hit reply to respond directly to ${name}.</p>
          </div>
        </div>
      `,
    });

    // Auto-reply to the inquirer
    await resend.emails.send({
      from: "Kyro Studio <contact@kyrostudio.eu>",
      to: email,
      subject: `We got your message, ${name} — Kyro Studio`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; background: #0A0A0B; color: #ffffff;">
          <div style="margin-bottom: 32px;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: #D4D93F;">KYRO STUDIO</h1>
            <p style="margin: 4px 0 0; font-size: 12px; color: #555; letter-spacing: 0.1em; text-transform: uppercase;">Web · Marketing · AI Automation</p>
          </div>
          <h2 style="font-size: 26px; font-weight: 800; color: #ffffff; margin: 0 0 16px; letter-spacing: -0.02em;">Thanks, ${name}.</h2>
          <p style="color: #888; line-height: 1.7; margin: 0 0 12px; font-size: 15px;">
            We've received your message and will get back to you within 24 hours.
          </p>
          <p style="color: #888; line-height: 1.7; margin: 0 0 32px; font-size: 15px;">
            In the meantime, feel free to book a discovery call — it's free and takes 30 minutes.
          </p>
          <a href="https://calendar.app.google/SkMr99BXaF5DhGn98"
             style="display: inline-block; background: #D4D93F; color: #0A0A0B; padding: 14px 32px; border-radius: 100px; text-decoration: none; font-weight: 700; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;">
            Book a Discovery Call
          </a>
          <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #1a1a1a;">
            <p style="color: #444; font-size: 12px; margin: 0;">Kyro Studio &mdash; <a href="mailto:hello@kyrostudio.eu" style="color: #555; text-decoration: none;">hello@kyrostudio.eu</a></p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[contact route]", error);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
