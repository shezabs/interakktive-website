// Email notifications via Resend
// Sends admin alerts for subscription events + customer confirmations

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'Interakktive <support@interakktive.com>';
const ADMIN_EMAIL = 'support@interakktive.com';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping email');
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Resend error:', err);
      return false;
    }

    console.log(`✉️ Email sent: ${subject} → ${to}`);
    return true;
  } catch (err) {
    console.error('Email send failed:', err);
    return false;
  }
}

// ── Admin notification: New subscription ──
export async function notifyNewSubscription(data: {
  email: string;
  tradingviewUsername: string;
  plan: string;
  billing: string;
  indicators: string[];
  isUpgrade?: boolean;
}) {
  const { email, tradingviewUsername, plan, billing, indicators, isUpgrade } = data;
  
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `🟢 ${isUpgrade ? 'UPGRADE' : 'NEW SUBSCRIPTION'}: ${email} — ${plan} (${billing})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; padding: 30px; border-radius: 12px;">
        <h2 style="color: #0ea5e9; margin-bottom: 20px;">🟢 ${isUpgrade ? 'Plan Upgrade' : 'New Subscription'}</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #9ca3af;">Email</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${email}</td></tr>
          <tr><td style="padding: 8px 0; color: #9ca3af;">TradingView</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${tradingviewUsername}</td></tr>
          <tr><td style="padding: 8px 0; color: #9ca3af;">Plan</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${plan} (${billing})</td></tr>
          <tr><td style="padding: 8px 0; color: #9ca3af;">Indicators</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${indicators.join(', ')}</td></tr>
        </table>
        <div style="margin-top: 20px; padding: 15px; background: #0ea5e9/10; border: 1px solid #0ea5e933; border-radius: 8px;">
          <p style="color: #0ea5e9; margin: 0; font-weight: bold;">⚡ ACTION REQUIRED</p>
          <p style="color: #d1d5db; margin: 8px 0 0;">Grant TradingView access to <strong>${tradingviewUsername}</strong> for: ${indicators.join(', ')}</p>
        </div>
      </div>
    `,
  });
}

// ── Admin notification: Cancellation ──
export async function notifyCancellation(data: {
  email: string;
  tradingviewUsername: string;
  plan: string;
}) {
  const { email, tradingviewUsername, plan } = data;
  
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `🔴 CANCELLATION: ${email} — ${plan}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; padding: 30px; border-radius: 12px;">
        <h2 style="color: #ef4444; margin-bottom: 20px;">🔴 Subscription Cancelled</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #9ca3af;">Email</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${email}</td></tr>
          <tr><td style="padding: 8px 0; color: #9ca3af;">TradingView</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${tradingviewUsername}</td></tr>
          <tr><td style="padding: 8px 0; color: #9ca3af;">Plan</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${plan}</td></tr>
        </table>
        <div style="margin-top: 20px; padding: 15px; background: #ef444410; border: 1px solid #ef444433; border-radius: 8px;">
          <p style="color: #ef4444; margin: 0; font-weight: bold;">⚡ ACTION REQUIRED</p>
          <p style="color: #d1d5db; margin: 8px 0 0;">Revoke TradingView access for <strong>${tradingviewUsername}</strong> at period end.</p>
        </div>
      </div>
    `,
  });
}

// ── Admin notification: Swap ──
export async function notifySwap(data: {
  email: string;
  tradingviewUsername: string;
  oldIndicators: string[];
  newIndicators: string[];
}) {
  const { email, tradingviewUsername, oldIndicators, newIndicators } = data;
  
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `🔄 SWAP: ${email} — ${oldIndicators.join(',')} → ${newIndicators.join(',')}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; padding: 30px; border-radius: 12px;">
        <h2 style="color: #f59e0b; margin-bottom: 20px;">🔄 Indicator Swap</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #9ca3af;">Email</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${email}</td></tr>
          <tr><td style="padding: 8px 0; color: #9ca3af;">TradingView</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${tradingviewUsername}</td></tr>
          <tr><td style="padding: 8px 0; color: #9ca3af;">Old</td><td style="padding: 8px 0; color: #ef4444; font-weight: bold;">${oldIndicators.join(', ')}</td></tr>
          <tr><td style="padding: 8px 0; color: #9ca3af;">New</td><td style="padding: 8px 0; color: #22c55e; font-weight: bold;">${newIndicators.join(', ')}</td></tr>
        </table>
        <div style="margin-top: 20px; padding: 15px; background: #f59e0b10; border: 1px solid #f59e0b33; border-radius: 8px;">
          <p style="color: #f59e0b; margin: 0; font-weight: bold;">⚡ ACTION REQUIRED</p>
          <p style="color: #d1d5db; margin: 8px 0 0;">Update TradingView access for <strong>${tradingviewUsername}</strong>: Remove ${oldIndicators.filter(i => !newIndicators.includes(i)).join(', ') || 'none'}, Add ${newIndicators.filter(i => !oldIndicators.includes(i)).join(', ') || 'none'}</p>
        </div>
      </div>
    `,
  });
}

// ── Admin notification: TV username change ──
export async function notifyUsernameChange(data: {
  email: string;
  oldUsername: string;
  newUsername: string;
  plan: string;
}) {
  const { email, oldUsername, newUsername, plan } = data;
  
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `✏️ USERNAME CHANGE: ${email} — ${oldUsername} → ${newUsername}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; padding: 30px; border-radius: 12px;">
        <h2 style="color: #8b5cf6; margin-bottom: 20px;">✏️ TradingView Username Changed</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #9ca3af;">Email</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${email}</td></tr>
          <tr><td style="padding: 8px 0; color: #9ca3af;">Plan</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${plan}</td></tr>
          <tr><td style="padding: 8px 0; color: #9ca3af;">Old Username</td><td style="padding: 8px 0; color: #ef4444; font-weight: bold;">${oldUsername}</td></tr>
          <tr><td style="padding: 8px 0; color: #9ca3af;">New Username</td><td style="padding: 8px 0; color: #22c55e; font-weight: bold;">${newUsername}</td></tr>
        </table>
        <div style="margin-top: 20px; padding: 15px; background: #8b5cf610; border: 1px solid #8b5cf633; border-radius: 8px;">
          <p style="color: #8b5cf6; margin: 0; font-weight: bold;">⚡ ACTION REQUIRED</p>
          <p style="color: #d1d5db; margin: 8px 0 0;">Update TradingView access: Revoke from <strong>${oldUsername}</strong>, grant to <strong>${newUsername}</strong></p>
        </div>
      </div>
    `,
  });
}

// ── Customer confirmation: Welcome email ──
export async function sendWelcomeEmail(data: {
  email: string;
  plan: string;
  indicators: string[];
}) {
  const { email, plan, indicators } = data;
  
  await sendEmail({
    to: email,
    subject: `Welcome to ATLAS PRO Suite — ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; padding: 30px; border-radius: 12px;">
        <h2 style="color: #0ea5e9; margin-bottom: 20px;">Welcome to Interakktive! 🎉</h2>
        <p style="color: #d1d5db; line-height: 1.6;">Thank you for subscribing to the <strong style="color: #fff;">${plan.charAt(0).toUpperCase() + plan.slice(1)}</strong> plan.</p>
        <p style="color: #d1d5db; line-height: 1.6;">Your indicators: <strong style="color: #0ea5e9;">${indicators.join(', ')}</strong></p>
        <p style="color: #d1d5db; line-height: 1.6;">We'll grant you TradingView access within <strong style="color: #fff;">4 hours</strong>. You'll receive the indicators as Invite-Only scripts in your TradingView account.</p>
        <div style="margin-top: 20px; padding: 15px; background: #ffffff08; border: 1px solid #ffffff15; border-radius: 8px;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">Need help? Reply to this email or visit <a href="https://www.interakktive.com/dashboard" style="color: #0ea5e9;">your dashboard</a>.</p>
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">Interakktive — Trading Intelligence You Can See</p>
      </div>
    `,
  });
}
