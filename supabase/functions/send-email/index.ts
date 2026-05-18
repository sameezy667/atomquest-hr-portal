// =============================================================
// @file send-email/index.ts
// @description Supabase Edge Function for sending email notifications
// @module supabase/functions
// =============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "noreply@atomquest.com";

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  type: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { to, subject, body, type }: EmailRequest = await req.json();

    // Validate input
    if (!to || !subject || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, body" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Choose email provider based on availability
    let result;
    
    if (RESEND_API_KEY) {
      // Use Resend (recommended for Supabase)
      result = await sendWithResend(to, subject, body);
    } else if (SENDGRID_API_KEY) {
      // Use SendGrid as fallback
      result = await sendWithSendGrid(to, subject, body);
    } else {
      // Log to console if no email provider configured (development mode)
      console.log("=== EMAIL NOTIFICATION ===");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Type: ${type}`);
      console.log(`Body:\n${body}`);
      console.log("========================");
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email logged (no provider configured)",
          development: true 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

async function sendWithResend(to: string, subject: string, body: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject: subject,
      text: body,
      html: body.replace(/\n/g, "<br>"),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return await response.json();
}

async function sendWithSendGrid(to: string, subject: string, body: string) {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject,
        },
      ],
      from: { email: FROM_EMAIL },
      content: [
        {
          type: "text/plain",
          value: body,
        },
        {
          type: "text/html",
          value: body.replace(/\n/g, "<br>"),
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid API error: ${error}`);
  }

  return { success: true };
}
