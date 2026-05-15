// Email notifications via Resend
// Sends admin alerts for subscription events + customer confirmations

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'Interakktive <support@interakktive.com>';
const ADMIN_EMAIL = 'support@interakktive.com';
const LOGO_URL = 'https://www.interakktive.com/images/logo_final.png';
const SITE_URL = 'https://www.interakktive.com';

// Shared email wrapper with logo header and footer
function emailTemplate(content: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; background-color: #111827;">
      <tr>
        <td align="center" style="padding: 20px;">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1f2937; border-radius: 12px; border: 1px solid #374151;">
            <!-- Logo Header -->
            <tr>
              <td align="center" style="padding: 25px 30px 20px; background-color: #ffffff; border-radius: 12px 12px 0 0;">
                <img src="${LOGO_URL}" alt="Interakktive" width="220" style="display: block; width: 220px; height: auto;" />
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding: 30px; color: #ffffff;">
                ${content}
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td align="center" style="padding: 20px 30px; border-top: 1px solid #374151;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0 0 6px;">Interakktive — Trading Intelligence You Can See</p>
                <p style="color: #6b7280; font-size: 11px; margin: 0;">
                  <a href="${SITE_URL}" style="color: #6b7280; text-decoration: none;">interakktive.com</a> &middot; 
                  <a href="${SITE_URL}/dashboard" style="color: #6b7280; text-decoration: none;">Dashboard</a> &middot; 
                  <a href="${SITE_URL}/pricing" style="color: #6b7280; text-decoration: none;">Pricing</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

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
    html: emailTemplate(`
      <h2 style="color: #0ea5e9; margin: 0 0 20px;">🟢 ${isUpgrade ? 'Plan Upgrade' : 'New Subscription'}</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #9ca3af;">Email</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${email}</td></tr>
        <tr><td style="padding: 8px 0; color: #9ca3af;">TradingView</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${tradingviewUsername}</td></tr>
        <tr><td style="padding: 8px 0; color: #9ca3af;">Plan</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${plan} (${billing})</td></tr>
        <tr><td style="padding: 8px 0; color: #9ca3af;">Indicators</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${indicators.join(', ')}</td></tr>
      </table>
      <div style="margin-top: 20px; padding: 15px; background-color: #1a2e3d; border: 1px solid #1e5a7a; border-radius: 8px;">
        <p style="color: #0ea5e9; margin: 0; font-weight: bold;">⚡ ACTION REQUIRED</p>
        <p style="color: #d1d5db; margin: 8px 0 0;">Grant TradingView access to <strong>${tradingviewUsername}</strong> for: ${indicators.join(', ')}</p>
      </div>
    `),
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
    html: emailTemplate(`
      <h2 style="color: #ef4444; margin: 0 0 20px;">🔴 Subscription Cancelled</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #9ca3af;">Email</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${email}</td></tr>
        <tr><td style="padding: 8px 0; color: #9ca3af;">TradingView</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${tradingviewUsername}</td></tr>
        <tr><td style="padding: 8px 0; color: #9ca3af;">Plan</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${plan}</td></tr>
      </table>
      <div style="margin-top: 20px; padding: 15px; background-color: #2e1a1a; border: 1px solid #7a1e1e; border-radius: 8px;">
        <p style="color: #ef4444; margin: 0; font-weight: bold;">⚡ ACTION REQUIRED</p>
        <p style="color: #d1d5db; margin: 8px 0 0;">Revoke TradingView access for <strong>${tradingviewUsername}</strong> at period end.</p>
      </div>
    `),
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
    html: emailTemplate(`
      <h2 style="color: #f59e0b; margin: 0 0 20px;">🔄 Indicator Swap</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #9ca3af;">Email</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${email}</td></tr>
        <tr><td style="padding: 8px 0; color: #9ca3af;">TradingView</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${tradingviewUsername}</td></tr>
        <tr><td style="padding: 8px 0; color: #9ca3af;">Old</td><td style="padding: 8px 0; color: #ef4444; font-weight: bold;">${oldIndicators.join(', ')}</td></tr>
        <tr><td style="padding: 8px 0; color: #9ca3af;">New</td><td style="padding: 8px 0; color: #22c55e; font-weight: bold;">${newIndicators.join(', ')}</td></tr>
      </table>
      <div style="margin-top: 20px; padding: 15px; background-color: #2e2a1a; border: 1px solid #7a5a1e; border-radius: 8px;">
        <p style="color: #f59e0b; margin: 0; font-weight: bold;">⚡ ACTION REQUIRED</p>
        <p style="color: #d1d5db; margin: 8px 0 0;">Update TradingView access for <strong>${tradingviewUsername}</strong>: Remove ${oldIndicators.filter(i => !newIndicators.includes(i)).join(', ') || 'none'}, Add ${newIndicators.filter(i => !oldIndicators.includes(i)).join(', ') || 'none'}</p>
      </div>
    `),
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
    html: emailTemplate(`
      <h2 style="color: #8b5cf6; margin: 0 0 20px;">✏️ TradingView Username Changed</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #9ca3af;">Email</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${email}</td></tr>
        <tr><td style="padding: 8px 0; color: #9ca3af;">Plan</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${plan}</td></tr>
        <tr><td style="padding: 8px 0; color: #9ca3af;">Old Username</td><td style="padding: 8px 0; color: #ef4444; font-weight: bold;">${oldUsername}</td></tr>
        <tr><td style="padding: 8px 0; color: #9ca3af;">New Username</td><td style="padding: 8px 0; color: #22c55e; font-weight: bold;">${newUsername}</td></tr>
      </table>
      <div style="margin-top: 20px; padding: 15px; background-color: #251a2e; border: 1px solid #4a2e7a; border-radius: 8px;">
        <p style="color: #8b5cf6; margin: 0; font-weight: bold;">⚡ ACTION REQUIRED</p>
        <p style="color: #d1d5db; margin: 8px 0 0;">Update TradingView access: Revoke from <strong>${oldUsername}</strong>, grant to <strong>${newUsername}</strong></p>
      </div>
    `),
  });
}

// ── Customer email: Welcome ──
export async function sendWelcomeEmail(data: {
  email: string;
  plan: string;
  indicators: string[];
}) {
  const { email, plan, indicators } = data;
  
  await sendEmail({
    to: email,
    subject: `Welcome to ATLAS PRO Suite — ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
    html: emailTemplate(`
      <h2 style="color: #0ea5e9; margin: 0 0 20px;">Welcome to Interakktive! 🎉</h2>
      <p style="color: #d1d5db; line-height: 1.6;">Thank you for subscribing to the <strong style="color: #fff;">${plan.charAt(0).toUpperCase() + plan.slice(1)}</strong> plan.</p>
      <p style="color: #d1d5db; line-height: 1.6;">Your indicators: <strong style="color: #0ea5e9;">${indicators.join(', ')}</strong></p>
      <p style="color: #d1d5db; line-height: 1.6;">We'll grant you TradingView access within <strong style="color: #fff;">4 hours</strong>. You'll receive the indicators as Invite-Only scripts in your TradingView account.</p>
      <div style="margin-top: 20px; padding: 15px; background-color: #283040; border: 1px solid #374151; border-radius: 8px;">
        <p style="color: #9ca3af; margin: 0; font-size: 14px;">Need help? Reply to this email or visit <a href="${SITE_URL}/dashboard" style="color: #0ea5e9;">your dashboard</a>.</p>
      </div>
    `),
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
    html: emailTemplate(`
      <h2 style="color: #f59e0b; margin: 0 0 20px;">Subscription Cancelled</h2>
      <p style="color: #d1d5db; line-height: 1.6;">Your <strong style="color: #fff;">${plan.charAt(0).toUpperCase() + plan.slice(1)}</strong> plan has been cancelled.</p>
      <p style="color: #d1d5db; line-height: 1.6;">You still have full access to your indicators until <strong style="color: #fff;">${dateStr}</strong>.</p>
      <p style="color: #d1d5db; line-height: 1.6;">After that date, your TradingView access will be revoked.</p>
      <div style="margin-top: 20px; padding: 15px; background-color: #1a2a35; border: 1px solid #1e5a7a; border-radius: 8px;">
        <p style="color: #0ea5e9; margin: 0; font-weight: bold;">Changed your mind?</p>
        <p style="color: #d1d5db; margin: 8px 0 0;">You can reactivate anytime before ${dateStr} from your <a href="${SITE_URL}/dashboard" style="color: #0ea5e9;">dashboard</a>.</p>
      </div>
    `),
  });
}

// ── Customer email: Swap confirmed ──
export async function sendSwapEmail(data: {
  email: string;
  newIndicators: string[];
  nextSwapDate: string;
}) {
  const { email, newIndicators, nextSwapDate } = data;
  const dateStr = nextSwapDate ? new Date(nextSwapDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'next month';
  
  await sendEmail({
    to: email,
    subject: `Indicator swap confirmed — ${newIndicators.join(' + ')}`,
    html: emailTemplate(`
      <h2 style="color: #0ea5e9; margin: 0 0 20px;">Indicator Swap Confirmed 🔄</h2>
      <p style="color: #d1d5db; line-height: 1.6;">Your indicators have been updated to:</p>
      <p style="color: #0ea5e9; font-size: 18px; font-weight: bold; margin: 15px 0;">${newIndicators.join(' + ')}</p>
      <p style="color: #d1d5db; line-height: 1.6;">We'll update your TradingView access within <strong style="color: #fff;">4 hours</strong>.</p>
      <p style="color: #d1d5db; line-height: 1.6;">Your next swap will be available on <strong style="color: #fff;">${dateStr}</strong>.</p>
      <div style="margin-top: 20px; padding: 15px; background-color: #283040; border: 1px solid #374151; border-radius: 8px;">
        <p style="color: #9ca3af; margin: 0; font-size: 14px;">Need help? Reply to this email or visit <a href="${SITE_URL}/dashboard" style="color: #0ea5e9;">your dashboard</a>.</p>
      </div>
    `),
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
    html: emailTemplate(`
      <h2 style="color: #0ea5e9; margin: 0 0 20px;">Plan Upgraded! 🚀</h2>
      <p style="color: #d1d5db; line-height: 1.6;">You've been upgraded to the <strong style="color: #fff;">${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)}</strong> plan.</p>
      <p style="color: #d1d5db; line-height: 1.6;">Your indicators: <strong style="color: #0ea5e9;">${indicators.join(', ')}</strong></p>
      <p style="color: #d1d5db; line-height: 1.6;">We'll update your TradingView access within <strong style="color: #fff;">4 hours</strong>.</p>
      <p style="color: #d1d5db; line-height: 1.6;">Any unused time from your previous plan has been credited toward this subscription.</p>
      <div style="margin-top: 20px; padding: 15px; background-color: #283040; border: 1px solid #374151; border-radius: 8px;">
        <p style="color: #9ca3af; margin: 0; font-size: 14px;">Need help? Reply to this email or visit <a href="${SITE_URL}/dashboard" style="color: #0ea5e9;">your dashboard</a>.</p>
      </div>
    `),
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
    html: emailTemplate(`
      <h2 style="color: #ef4444; margin: 0 0 20px;">Payment Failed ⚠️</h2>
      <p style="color: #d1d5db; line-height: 1.6;">We were unable to process the payment for your <strong style="color: #fff;">${plan.charAt(0).toUpperCase() + plan.slice(1)}</strong> plan.</p>
      <p style="color: #d1d5db; line-height: 1.6;">Please update your payment method to avoid losing access to your indicators.</p>
      <div style="margin-top: 20px; text-align: center;">
        <a href="${SITE_URL}/dashboard" style="display: inline-block; padding: 12px 30px; background: linear-gradient(to right, #0ea5e9, #d946ef); color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Update Payment Method</a>
      </div>
      <p style="color: #9ca3af; font-size: 13px; margin-top: 20px; line-height: 1.6;">If you believe this is an error, reply to this email and we'll help you sort it out.</p>
    `),
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
    html: emailTemplate(`
      <h2 style="color: #6b7280; margin: 0 0 20px;">Subscription Ended</h2>
      <p style="color: #d1d5db; line-height: 1.6;">Your <strong style="color: #fff;">${plan.charAt(0).toUpperCase() + plan.slice(1)}</strong> plan has now expired and your TradingView access has been revoked.</p>
      <p style="color: #d1d5db; line-height: 1.6;">We hope the ATLAS PRO indicators helped your trading. If you'd like to resubscribe, you can do so anytime.</p>
      <div style="margin-top: 20px; text-align: center;">
        <a href="${SITE_URL}/pricing" style="display: inline-block; padding: 12px 30px; background: linear-gradient(to right, #0ea5e9, #d946ef); color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">View Plans</a>
      </div>
      <p style="color: #9ca3af; font-size: 13px; margin-top: 20px; line-height: 1.6;">Questions? Reply to this email — we're here to help.</p>
    `),
  });
}

// ── Customer email: Signup Welcome (non-subscription) ──
export async function sendSignupWelcomeEmail(data: {
  email: string;
  name?: string;
}) {
  const { email, name } = data;
  const greeting = name ? `Hi ${name}` : 'Welcome';

  await sendEmail({
    to: email,
    subject: 'Welcome to Interakktive — Trading Intelligence You Can See',
    html: emailTemplate(`
      <h2 style="color: #0ea5e9; margin: 0 0 20px;">${greeting}! 👋</h2>
      <p style="color: #d1d5db; line-height: 1.6;">Thanks for creating your Interakktive account. You now have access to:</p>
      <ul style="color: #d1d5db; line-height: 1.8; padding-left: 20px;">
        <li><strong style="color: #fff;">9 free diagnostic indicators</strong> on TradingView — no subscription needed</li>
        <li><strong style="color: #fff;">Documentation & guides</strong> for all ATLAS indicators</li>
        <li>Your personal <strong style="color: #fff;">dashboard</strong> to manage your account</li>
      </ul>
      <p style="color: #d1d5db; line-height: 1.6;">Ready for premium intelligence? The <strong style="color: #0ea5e9;">ATLAS PRO Suite</strong> gives you CIPHER PRO, PHANTOM PRO, PULSE PRO, and RADAR PRO — the most comprehensive trading intelligence system on TradingView.</p>
      <div style="margin-top: 20px; text-align: center;">
        <a href="${SITE_URL}/pricing" style="display: inline-block; padding: 12px 30px; background: linear-gradient(to right, #0ea5e9, #d946ef); color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Explore ATLAS PRO</a>
      </div>
      <div style="margin-top: 20px; padding: 15px; background-color: #283040; border: 1px solid #374151; border-radius: 8px;">
        <p style="color: #9ca3af; margin: 0; font-size: 14px;">Your dashboard: <a href="${SITE_URL}/dashboard" style="color: #0ea5e9;">interakktive.com/dashboard</a></p>
      </div>
    `),
  });

  // Admin notification
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `🆕 New signup: ${email}`,
    html: emailTemplate(`
      <h2 style="color: #0ea5e9; margin: 0 0 15px;">New Account Created</h2>
      <p style="color: #d1d5db;"><strong style="color: #fff;">Email:</strong> ${email}</p>
      <p style="color: #d1d5db;"><strong style="color: #fff;">Name:</strong> ${name || 'Not provided'}</p>
      <p style="color: #d1d5db;"><strong style="color: #fff;">Method:</strong> OAuth/Google or Email signup</p>
      <p style="color: #9ca3af; font-size: 13px; margin-top: 15px;">No subscription yet — just created an account.</p>
    `),
  });
}

// ============================================================================
// AFFILIATE PROGRAM
// ============================================================================

export async function notifyAffiliateApplication(data: {
  email: string;
  fullName: string;
  tvUsername: string | null;
  promotionUrls: string;
  audienceSize: string;
  niche: string;
  pitch: string;
  customerPlan: string | null;
  customerStatus: string | null;
  applicationId: string;
}) {
  const {
    email, fullName, tvUsername, promotionUrls,
    audienceSize, niche, pitch, customerPlan, customerStatus, applicationId,
  } = data;

  const audienceLabel: Record<string, string> = {
    'under_500': 'Under 500',
    '500_5k':    '500 — 5K',
    '5k_50k':    '5K — 50K',
    '50k_500k':  '50K — 500K',
    '500k_plus': '500K+',
  };

  const nicheLabel: Record<string, string> = {
    'forex':       'Forex',
    'crypto':      'Crypto',
    'indices':     'Indices',
    'commodities': 'Commodities',
    'mixed':       'Mixed',
    'educational': 'Educational',
    'other':       'Other',
  };

  // Admin notification email
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `🤝 AFFILIATE APPLICATION: ${fullName} (${email})`,
    html: emailTemplate(`
      <h2 style="color: #fbbf24; margin: 0 0 20px;">🤝 New Affiliate Application</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #9ca3af; width: 35%;">Name</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${fullName}</td></tr>
        <tr><td style="padding: 8px 0; color: #9ca3af;">Email</td><td style="padding: 8px 0; color: #fff; font-weight: bold;">${email}</td></tr>
        <tr><td style="padding: 8px 0; color: #9ca3af;">TradingView Username</td><td style="padding: 8px 0; color: #fff;">${tvUsername || '—'}</td></tr>
        <tr><td style="padding: 8px 0; color: #9ca3af;">Customer Plan</td><td style="padding: 8px 0; color: #fff;">${customerPlan || 'unknown'} (${customerStatus || 'unknown'})</td></tr>
        <tr><td style="padding: 8px 0; color: #9ca3af;">Audience Size</td><td style="padding: 8px 0; color: #fff;">${audienceLabel[audienceSize] || audienceSize}</td></tr>
        <tr><td style="padding: 8px 0; color: #9ca3af;">Niche</td><td style="padding: 8px 0; color: #fff;">${nicheLabel[niche] || niche}</td></tr>
      </table>

      <div style="margin-top: 20px;">
        <p style="color: #9ca3af; margin: 0 0 6px;">Where they'd promote</p>
        <div style="padding: 12px; background-color: #0f172a; border: 1px solid #374151; border-radius: 8px; color: #d1d5db; white-space: pre-wrap; font-size: 13px;">${escapeHtml(promotionUrls)}</div>
      </div>

      <div style="margin-top: 20px;">
        <p style="color: #9ca3af; margin: 0 0 6px;">Their pitch</p>
        <div style="padding: 12px; background-color: #0f172a; border: 1px solid #374151; border-radius: 8px; color: #d1d5db; white-space: pre-wrap; font-size: 13px;">${escapeHtml(pitch)}</div>
      </div>

      <div style="margin-top: 20px; padding: 15px; background-color: #1f1810; border: 1px solid #92400e; border-radius: 8px;">
        <p style="color: #fbbf24; margin: 0; font-weight: bold;">⚡ NEXT STEP</p>
        <p style="color: #d1d5db; margin: 8px 0 0;">Review at <a href="${SITE_URL}/admin/affiliates" style="color: #fbbf24;">/admin/affiliates</a> — approve or reject. Application ID: ${applicationId}</p>
      </div>
    `),
  });

  // Applicant confirmation email
  await sendEmail({
    to: email,
    subject: 'Application received — Interakktive Affiliate Program',
    html: emailTemplate(`
      <h2 style="color: #fbbf24; margin: 0 0 20px;">Thanks for applying, ${escapeHtml(fullName.split(' ')[0])}.</h2>
      <p style="color: #d1d5db; line-height: 1.6;">We've received your application to join the Interakktive Affiliate Program.</p>
      <p style="color: #d1d5db; line-height: 1.6;">We review every application personally — usually within 48 hours. You'll hear back at this email address with our decision.</p>

      <div style="margin: 24px 0; padding: 16px; background-color: #0f172a; border: 1px solid #374151; border-radius: 8px;">
        <p style="color: #9ca3af; margin: 0 0 6px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Application summary</p>
        <p style="color: #fff; margin: 0; font-size: 14px;"><strong>Name:</strong> ${escapeHtml(fullName)}</p>
        <p style="color: #fff; margin: 4px 0 0; font-size: 14px;"><strong>Audience:</strong> ${audienceLabel[audienceSize] || audienceSize} · ${nicheLabel[niche] || niche}</p>
      </div>

      <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin-top: 24px;">If you don't hear from us within 5 business days, reply to this email and we'll chase the application internally.</p>
      <p style="color: #9ca3af; font-size: 13px;">— The Interakktive team</p>
    `),
  });
}

// Tiny HTML-escape helper used inside affiliate notification (user-supplied text)
function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
