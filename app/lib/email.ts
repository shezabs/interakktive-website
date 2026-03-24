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

// ── Customer email: Cancellation confirmed ──
export async function sendCancellationEmail(data: {
  email: string;
  plan: string;
  accessUntil: string;
}) {
  const { email, plan, accessUntil } = data;
  const dateStr = new Date(accessUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  
  await sendEmail({
    to: email,
    subject: `Your ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan has been cancelled`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; padding: 30px; border-radius: 12px;">
        <h2 style="color: #f59e0b; margin-bottom: 20px;">Subscription Cancelled</h2>
        <p style="color: #d1d5db; line-height: 1.6;">Your <strong style="color: #fff;">${plan.charAt(0).toUpperCase() + plan.slice(1)}</strong> plan has been cancelled.</p>
        <p style="color: #d1d5db; line-height: 1.6;">You still have full access to your indicators until <strong style="color: #fff;">${dateStr}</strong>.</p>
        <p style="color: #d1d5db; line-height: 1.6;">After that date, your TradingView access will be revoked.</p>
        <div style="margin-top: 20px; padding: 15px; background: #0ea5e908; border: 1px solid #0ea5e933; border-radius: 8px;">
          <p style="color: #0ea5e9; margin: 0; font-weight: bold;">Changed your mind?</p>
          <p style="color: #d1d5db; margin: 8px 0 0;">You can reactivate anytime before ${dateStr} from your <a href="https://www.interakktive.com/dashboard" style="color: #0ea5e9;">dashboard</a>.</p>
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">Interakktive — Trading Intelligence You Can See</p>
      </div>
    `,
  });
}

// ── Customer email: Swap confirmed ──
export async function sendSwapEmail(data: {
  email: string;
  newIndicators: string[];
  nextSwapDate: string;
}) {
  const { email, newIndicators, nextSwapDate } = data;
  const dateStr = new Date(nextSwapDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  
  await sendEmail({
    to: email,
    subject: `Indicator swap confirmed — ${newIndicators.join(' + ')}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; padding: 30px; border-radius: 12px;">
        <h2 style="color: #0ea5e9; margin-bottom: 20px;">Indicator Swap Confirmed 🔄</h2>
        <p style="color: #d1d5db; line-height: 1.6;">Your indicators have been updated to:</p>
        <p style="color: #0ea5e9; font-size: 18px; font-weight: bold; margin: 15px 0;">${newIndicators.join(' + ')}</p>
        <p style="color: #d1d5db; line-height: 1.6;">We'll update your TradingView access within <strong style="color: #fff;">4 hours</strong>.</p>
        <p style="color: #d1d5db; line-height: 1.6;">Your next swap will be available on <strong style="color: #fff;">${dateStr}</strong>.</p>
        <div style="margin-top: 20px; padding: 15px; background: #ffffff08; border: 1px solid #ffffff15; border-radius: 8px;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">Need help? Reply to this email or visit <a href="https://www.interakktive.com/dashboard" style="color: #0ea5e9;">your dashboard</a>.</p>
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">Interakktive — Trading Intelligence You Can See</p>
      </div>
    `,
  });
}

// ── Customer email: Upgrade confirmed ──
export async function sendUpgradeEmail(data: {
  email: string;
  newPlan: string;
  indicators: string[];
}) {
  const { email, newPlan, indicators } = data;
  
  await sendEmail({
    to: email,
    subject: `Upgraded to ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)} — ATLAS PRO Suite`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; padding: 30px; border-radius: 12px;">
        <h2 style="color: #0ea5e9; margin-bottom: 20px;">Plan Upgraded! 🚀</h2>
        <p style="color: #d1d5db; line-height: 1.6;">You've been upgraded to the <strong style="color: #fff;">${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)}</strong> plan.</p>
        <p style="color: #d1d5db; line-height: 1.6;">Your indicators: <strong style="color: #0ea5e9;">${indicators.join(', ')}</strong></p>
        <p style="color: #d1d5db; line-height: 1.6;">We'll update your TradingView access within <strong style="color: #fff;">4 hours</strong>.</p>
        <p style="color: #d1d5db; line-height: 1.6;">Any unused time from your previous plan has been credited toward this subscription.</p>
        <div style="margin-top: 20px; padding: 15px; background: #ffffff08; border: 1px solid #ffffff15; border-radius: 8px;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">Need help? Reply to this email or visit <a href="https://www.interakktive.com/dashboard" style="color: #0ea5e9;">your dashboard</a>.</p>
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">Interakktive — Trading Intelligence You Can See</p>
      </div>
    `,
  });
}

// ── Customer email: Payment failed ──
export async function sendPaymentFailedEmail(data: {
  email: string;
  plan: string;
}) {
  const { email, plan } = data;
  
  await sendEmail({
    to: email,
    subject: `Payment failed — Action required for your ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; padding: 30px; border-radius: 12px;">
        <h2 style="color: #ef4444; margin-bottom: 20px;">Payment Failed ⚠️</h2>
        <p style="color: #d1d5db; line-height: 1.6;">We were unable to process the payment for your <strong style="color: #fff;">${plan.charAt(0).toUpperCase() + plan.slice(1)}</strong> plan.</p>
        <p style="color: #d1d5db; line-height: 1.6;">Please update your payment method to avoid losing access to your indicators.</p>
        <div style="margin-top: 20px; text-align: center;">
          <a href="https://www.interakktive.com/dashboard" style="display: inline-block; padding: 12px 30px; background: linear-gradient(to right, #0ea5e9, #d946ef); color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Update Payment Method</a>
        </div>
        <p style="color: #9ca3af; font-size: 13px; margin-top: 20px; line-height: 1.6;">If you believe this is an error, reply to this email and we'll help you sort it out.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">Interakktive — Trading Intelligence You Can See</p>
      </div>
    `,
  });
}

// ── Customer email: Subscription expired ──
export async function sendExpiredEmail(data: {
  email: string;
  plan: string;
}) {
  const { email, plan } = data;
  
  await sendEmail({
    to: email,
    subject: `Your ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan has expired`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; padding: 30px; border-radius: 12px;">
        <h2 style="color: #6b7280; margin-bottom: 20px;">Subscription Ended</h2>
        <p style="color: #d1d5db; line-height: 1.6;">Your <strong style="color: #fff;">${plan.charAt(0).toUpperCase() + plan.slice(1)}</strong> plan has now expired and your TradingView access has been revoked.</p>
        <p style="color: #d1d5db; line-height: 1.6;">We hope the ATLAS PRO indicators helped your trading. If you'd like to resubscribe, you can do so anytime.</p>
        <div style="margin-top: 20px; text-align: center;">
          <a href="https://www.interakktive.com/pricing" style="display: inline-block; padding: 12px 30px; background: linear-gradient(to right, #0ea5e9, #d946ef); color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">View Plans</a>
        </div>
        <p style="color: #9ca3af; font-size: 13px; margin-top: 20px; line-height: 1.6;">Questions? Reply to this email — we're here to help.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">Interakktive — Trading Intelligence You Can See</p>
      </div>
    `,
  });
}
