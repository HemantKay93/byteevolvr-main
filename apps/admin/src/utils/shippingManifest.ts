/**
 * Shipping & Logistics Utilities
 * Provides carrier tracking links and official carrier pickup manifest generation
 */

export function getCarrierTrackingUrl(carrier: string, trackingNumber: string): string {
  const norm = (carrier || '').toLowerCase();
  const cleanTrack = encodeURIComponent((trackingNumber || '').trim());

  if (norm.includes('delhivery')) {
    return `https://www.delhivery.com/track/package/${cleanTrack}`;
  }
  if (norm.includes('blue') || norm.includes('bluedart')) {
    return `https://www.bluedart.com/tracking?track=${cleanTrack}`;
  }
  if (norm.includes('fedex')) {
    return `https://www.fedex.com/fedextrack/?trknbr=${cleanTrack}`;
  }
  if (norm.includes('ecom')) {
    return `https://ecomexpress.in/tracking/?awb_field=${cleanTrack}`;
  }
  if (norm.includes('ups')) {
    return `https://www.ups.com/track?tracknum=${cleanTrack}`;
  }
  if (norm.includes('dhl')) {
    return `https://www.dhl.com/en/express/tracking.html?AWB=${cleanTrack}`;
  }
  if (norm.includes('usps')) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${cleanTrack}`;
  }
  if (norm.includes('shiprocket')) {
    return `https://shiprocket.co/tracking/${cleanTrack}`;
  }
  if (norm.includes('speed') || norm.includes('post') || norm.includes('india post')) {
    return `https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/trackconsignment.aspx`;
  }

  // Fallback search
  return `https://www.google.com/search?q=${encodeURIComponent(`${carrier} tracking ${trackingNumber}`)}`;
}

export function printShippingManifest(
  shipments: Array<{
    tracking_number: string;
    order_id: string;
    carrier: string;
    status: string;
    recipient?: string;
    destination?: string;
    weight?: string | number;
    declared_value?: number;
    service_type?: string;
  }>,
  options?: {
    carrier?: string;
    warehouse?: string;
    manifestId?: string;
  }
) {
  const manifestId = options?.manifestId || `MNF-${Date.now().toString().slice(-8)}`;
  const dispatchDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const dispatchTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const warehouse = options?.warehouse || 'Main Central Logistics Hub (DEL-01)';
  const carrierName = options?.carrier || shipments[0]?.carrier || 'All Carriers';

  const totalPackages = shipments.length;
  const totalWeight = shipments.reduce((sum, s) => sum + (Number(s.weight) || 1.2), 0).toFixed(2);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to view and print the shipping manifest.');
    return;
  }

  const manifestHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Carrier Pickup Manifest - ${manifestId}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.4;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0f172a;
      margin: 0;
    }
    .brand-sub {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #64748b;
      margin-top: 4px;
    }
    .manifest-badge {
      text-align: right;
    }
    .manifest-id {
      font-size: 18px;
      font-family: monospace;
      font-weight: 700;
      color: #0284c7;
      margin: 0;
    }
    .manifest-date {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 24px;
      font-size: 12px;
    }
    .meta-item label {
      display: block;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 2px;
    }
    .meta-item value {
      display: block;
      font-weight: 600;
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
      font-size: 12px;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
      text-align: left;
      padding: 8px 10px;
      border-top: 1px solid #cbd5e1;
      border-bottom: 1px solid #cbd5e1;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }
    tr:nth-child(even) td {
      background: #fafafa;
    }
    .mono {
      font-family: monospace;
      font-weight: 700;
    }
    .text-right {
      text-align: right;
    }
    .barcode-sim {
      font-family: "Courier New", monospace;
      letter-spacing: 2px;
      font-size: 11px;
      background: #e2e8f0;
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
    }
    .sign-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-top: 36px;
      page-break-inside: avoid;
    }
    .sign-box {
      border: 1px dashed #94a3b8;
      border-radius: 8px;
      padding: 16px;
      background: #fafafa;
    }
    .sign-box-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #475569;
      margin-bottom: 40px;
    }
    .sign-line {
      border-top: 1px solid #0f172a;
      display: flex;
      justify-content: space-between;
      padding-top: 6px;
      font-size: 11px;
      color: #64748b;
    }
    .footer {
      margin-top: 30px;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      font-size: 10px;
      color: #94a3b8;
      text-align: center;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="brand-title">ByteEvolvr Logistics Hub</h1>
      <div class="brand-sub">Official Outbound Carrier Dispatch Manifest</div>
    </div>
    <div class="manifest-badge">
      <div class="manifest-id">${manifestId}</div>
      <div class="manifest-date">Date: ${dispatchDate} ${dispatchTime}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <label>Dispatch Facility</label>
      <value>${warehouse}</value>
    </div>
    <div class="meta-item">
      <label>Assigned Carrier</label>
      <value>${carrierName}</value>
    </div>
    <div class="meta-item">
      <label>Total Shipments</label>
      <value>${totalPackages} Consignments</value>
    </div>
    <div class="meta-item">
      <label>Total Net Weight</label>
      <value>${totalWeight} KG</value>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 32px;">#</th>
        <th>AWB / Tracking Number</th>
        <th>Order Ref</th>
        <th>Carrier</th>
        <th>Destination / Consignee</th>
        <th class="text-right">Weight (KG)</th>
        <th class="text-right">Barcode Token</th>
      </tr>
    </thead>
    <tbody>
      ${shipments
        .map(
          (s, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td class="mono" style="color: #0369a1;">${s.tracking_number}</td>
          <td class="mono">#${s.order_id}</td>
          <td><strong>${s.carrier}</strong></td>
          <td>${s.recipient || s.destination || 'Direct Domestic Delivery'}</td>
          <td class="text-right">${s.weight || '1.20'}</td>
          <td class="text-right"><span class="barcode-sim">||| ${s.tracking_number.slice(-6)} |||</span></td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="sign-section">
    <div class="sign-box">
      <div class="sign-box-title">1. Dispatched & Sealed By (Warehouse Supervisor)</div>
      <div class="sign-line">
        <span>Signature / Stamp</span>
        <span>Date & Time</span>
      </div>
    </div>
    <div class="sign-box">
      <div class="sign-box-title">2. Acknowledged & Picked Up By (Courier Agent)</div>
      <div class="sign-line">
        <span>Agent Name & Signature</span>
        <span>Vehicle / Staff ID</span>
      </div>
    </div>
  </div>

  <div class="footer">
    Generated automatically by ByteEvolvr Enterprise ERP. This manifest serves as official proof of carrier handover.
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(manifestHtml);
  printWindow.document.close();
}
