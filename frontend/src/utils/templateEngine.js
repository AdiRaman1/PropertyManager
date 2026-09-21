// src/utils/templateEngine.js
// Scalable Variable Interpolation & WhatsApp Template Engine for Multi-Property PG Management

export const DEFAULT_TEMPLATES = {
  rent_reminder: `Hello {{tenant_name}},

This is a friendly reminder from {{property_name}} regarding your monthly accommodation rent for Room {{room_number}}.

📌 *Pending Dues:* ₹{{amount_due}}
📅 *Due Date:* {{due_date}}

Kindly complete payment via UPI:
UPI ID: {{upi_id}}
Payment Link: {{payment_link}}

Once paid, your digital rent receipt will be automatically generated.
Thank you! 🙏`,

  cash_receipt: `*OFFICIAL CASH RECEIPT - {{property_name}}* 🏢

Hello {{tenant_name}},
Your monthly room rent payment has been received in PHYSICAL CASH.

💵 *Cash Amount Received:* ₹{{amount_paid}}
👤 *Collected By:* {{collector_name}}
🧾 *Cash Slip Ref:* {{receipt_id}}
🛏️ *Room Number:* {{room_number}}
📅 *Date:* {{payment_date}}
📊 *Remaining Balance:* ₹{{remaining_dues}}

Your payment record is updated in the resident system.
Thank you! 🙏`,

  welcome_chit: `*WELCOME TO {{property_name}}!* 🏡✨

Hello {{tenant_name}},
Welcome to your new home! Here are your room & stay details:

🛏️ *Room Assigned:* Room {{room_number}}
💰 *Monthly Rent:* ₹{{monthly_rent}}
🔐 *Security Deposit:* ₹{{deposit_amount}}
📶 *Wi-Fi Network:* {{wifi_ssid}}
🔑 *Wi-Fi Password:* {{wifi_pass}}
⏰ *Gate Closes:* 10:30 PM
🍽️ *Food Timings:* Breakfast 8-10 AM | Dinner 8-10 PM

For any maintenance complaints or queries, reach out via the resident portal.
Have a pleasant stay! 🙌`
};

export const TEMPLATE_METADATA = [
  {
    key: 'rent_reminder',
    name: 'Monthly Rent Reminder',
    description: 'Sent to tenants with pending or overdue rent balances before/on due date.',
    icon: '🔔',
    supportedTokens: [
      'tenant_name',
      'room_number',
      'amount_due',
      'due_date',
      'property_name',
      'upi_id',
      'payment_link'
    ]
  },
  {
    key: 'cash_receipt',
    name: 'Cash Payment Slip / Chit',
    description: 'Acknowledges physical cash handed over to owner or staff warden.',
    icon: '💵',
    supportedTokens: [
      'tenant_name',
      'room_number',
      'amount_paid',
      'collector_name',
      'receipt_id',
      'payment_date',
      'remaining_dues',
      'property_name'
    ]
  },
  {
    key: 'welcome_chit',
    name: 'Welcome & Move-in Chit',
    description: 'Sent to newly joined residents with room details, Wi-Fi credentials, and house rules.',
    icon: '🏡',
    supportedTokens: [
      'tenant_name',
      'room_number',
      'monthly_rent',
      'deposit_amount',
      'wifi_ssid',
      'wifi_pass',
      'property_name'
    ]
  }
];

export const TOKEN_DEFINITIONS = {
  tenant_name: { label: 'Tenant Name', sample: 'Rahul Sharma', description: "Resident's full name" },
  room_number: { label: 'Room No.', sample: '101', description: 'Assigned room or bed number' },
  amount_due: { label: 'Amount Due', sample: '8,500', description: 'Pending balance dues' },
  amount_paid: { label: 'Amount Paid', sample: '8,500', description: 'Cash or UPI amount received' },
  monthly_rent: { label: 'Monthly Rent', sample: '8,500', description: 'Agreed monthly room tariff' },
  deposit_amount: { label: 'Deposit', sample: '10,000', description: 'Security deposit held' },
  due_date: { label: 'Due Date', sample: '5th of this month', description: 'Monthly rent cut-off date' },
  property_name: { label: 'PG Name', sample: 'Greenwood Heights PG', description: 'Current property name' },
  upi_id: { label: 'UPI ID', sample: 'greenwoodpg@okhdfcbank', description: 'Owner payment VPA' },
  payment_link: { label: 'Payment Link', sample: 'https://mypgmanager.com/pay/t1', description: 'Direct web link to pay' },
  collector_name: { label: 'Collector', sample: 'Aditya Raman (Owner)', description: 'Staff or Owner who took cash' },
  receipt_id: { label: 'Receipt Ref', sample: '#CASH-4821', description: 'Unique payment voucher code' },
  payment_date: { label: 'Date', sample: '04 Sep 2026', description: 'Date of receipt or punch' },
  remaining_dues: { label: 'Remaining Dues', sample: '0', description: 'Outstanding balance after payment' },
  wifi_ssid: { label: 'Wi-Fi Name', sample: 'Greenwood_HighSpeed_5G', description: 'PG Wi-Fi SSID' },
  wifi_pass: { label: 'Wi-Fi Password', sample: 'Greenwood@2026', description: 'PG Wi-Fi Password' }
};

export const SAMPLE_PREVIEW_DATA = {
  tenant_name: 'Rahul Sharma',
  room_number: '101',
  amount_due: '8,500',
  amount_paid: '8,500',
  monthly_rent: '8,500',
  deposit_amount: '10,000',
  due_date: '5th of this month',
  property_name: 'Greenwood Heights PG',
  upi_id: 'greenwoodpg@okhdfcbank',
  payment_link: 'https://mypgmanager.com/pay/t1',
  collector_name: 'Aditya Raman (Owner)',
  receipt_id: '#CASH-4821',
  payment_date: '04 Sep 2026',
  remaining_dues: '0',
  wifi_ssid: 'Greenwood_HighSpeed_5G',
  wifi_pass: 'Greenwood@2026'
};

/**
 * Compiles a template string by replacing {{token}} with contextual values
 * @param {string} template - The raw template with {{variable}} tags
 * @param {object} context - Map of key/value pairs
 * @returns {string} rendered text
 */
export function interpolateTemplate(template, context = {}) {
  if (!template || typeof template !== 'string') return '';
  
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, token) => {
    if (context[token] !== undefined && context[token] !== null) {
      return String(context[token]);
    }
    // If not found in context, return sample data if available or empty string
    return TOKEN_DEFINITIONS[token]?.sample || '';
  });
}

/**
 * Returns the effective template for a property, falling back to system default if not customized
 */
export function getPropertyTemplate(property, templateKey) {
  if (property?.templates && property.templates[templateKey]) {
    return property.templates[templateKey];
  }
  return DEFAULT_TEMPLATES[templateKey] || '';
}
