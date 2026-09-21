// backend/src/routes/api.routes.js
import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { enforceTenantScoping } from '../middleware/tenantIsolation.js';

const router = Router();

// 1. Health Check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'pg-manager-backend',
    version: '1.0.0'
  });
});

// 2. Properties API (Scoped to Organization)
router.get('/properties', (req, res) => {
  res.json({
    data: [
      { id: 'prop-1', name: 'Greenwood Heights PG', address: 'Koramangala 4th Block, Bengaluru', upiId: 'greenwoodpg@okhdfcbank' },
      { id: 'prop-2', name: 'Sunrise Student Hostel', address: 'HSR Layout Sector 2, Bengaluru', upiId: 'sunrisehostel@okaxis' }
    ]
  });
});

// 3. Property Message Templates API (Per-Property Scoped)
router.get('/properties/:propertyId/templates', (req, res) => {
  const { propertyId } = req.params;
  res.json({
    propertyId,
    templates: {
      rent_reminder: `Hello {{tenant_name}},\n\nThis is a friendly reminder from {{property_name}} regarding your monthly accommodation rent for Room {{room_number}}.\n\n📌 *Pending Dues:* ₹{{amount_due}}\n📅 *Due Date:* {{due_date}}\n\nKindly complete payment via UPI:\nUPI ID: {{upi_id}}\nPayment Link: {{payment_link}}\n\nOnce paid, your digital rent receipt will be automatically generated.\nThank you! 🙏`,
      cash_receipt: `*OFFICIAL CASH RECEIPT - {{property_name}}* 🏢\n\nHello {{tenant_name}},\nYour monthly room rent payment has been received in PHYSICAL CASH.\n\n💵 *Cash Amount Received:* ₹{{amount_paid}}\n👤 *Collected By:* {{collector_name}}\n🧾 *Cash Slip Ref:* {{receipt_id}}\n🛏️ *Room Number:* {{room_number}}\n📅 *Date:* {{payment_date}}\n📊 *Remaining Balance:* ₹{{remaining_dues}}\n\nYour payment record is updated in the resident system.\nThank you! 🙏`,
      welcome_chit: `*WELCOME TO {{property_name}}!* 🏡✨\n\nHello {{tenant_name}},\nWelcome to your new home! Here are your stay details:\n\n🛏️ *Room:* Room {{room_number}}\n💰 *Monthly Rent:* ₹{{monthly_rent}}\n🔐 *Deposit:* ₹{{deposit_amount}}\n📶 *Wi-Fi:* {{wifi_ssid}}\n🔑 *Password:* {{wifi_pass}}\n⏰ *Gate Closes:* 10:30 PM\n\nHave a great stay! 🙌`
    }
  });
});

// Update Property Templates
router.put('/properties/:propertyId/templates', (req, res) => {
  const { propertyId } = req.params;
  const { templates } = req.body;
  res.json({
    success: true,
    propertyId,
    updatedTemplates: templates,
    updatedAt: new Date().toISOString()
  });
});

// 4. Double-Entry Rent Ledger & Cash Punch API
router.post('/ledger/cash-punch', (req, res) => {
  const { tenantId, tenantName, roomNumber, amount, collectorName, propertyId } = req.body;
  
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Valid payment amount is required' });
  }

  const slipId = '#CASH-' + Math.floor(1000 + Math.random() * 9000);
  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const cashTransaction = {
    id: 'pay-' + Date.now(),
    slipId,
    propertyId: propertyId || 'prop-1',
    tenantId,
    tenantName,
    roomNumber,
    amount: Number(amount),
    paymentMode: 'Cash',
    collector: collectorName || 'Aditya Raman (Owner)',
    date: todayStr,
    status: 'Confirmed',
    doubleEntryLog: {
      debit: 'CASH_DRAWER',
      credit: 'ACCOUNTS_RECEIVABLE',
      amount: Number(amount)
    }
  };

  res.status(201).json({
    success: true,
    message: 'Cash payment acknowledged & double-entry ledger updated',
    transaction: cashTransaction
  });
});

// 5. Cloudflare R2 Presigned Upload URL Generator (Zero Egress, Free-Tier KYC)
router.post('/storage/presigned-upload-url', (req, res) => {
  const { filename, fileType, tenantId } = req.body;
  const cleanFilename = `${tenantId || 'kyc'}-${Date.now()}-${filename || 'document.webp'}`;
  
  res.json({
    uploadUrl: `https://mock-r2-upload.mypgmanager.com/${cleanFilename}?token=presigned_demo_token`,
    publicUrl: `https://vault.mypgmanager.com/documents/${cleanFilename}`,
    maxSizeBytes: 5242880, // 5 MB limit
    recommendedFormat: 'webp'
  });
});

export default router;
