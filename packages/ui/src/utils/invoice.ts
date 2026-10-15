import { numberToWords } from './numberToWords';

export const printInvoice = (rawOrder: any, rawItems: any[] = [], cmsData?: any) => {
  // eslint-disable-line complexity
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  // Normalize order object
  const order = rawOrder?.order || rawOrder?.data || rawOrder || {};

  // Normalize items array
  const items: any[] =
    Array.isArray(rawItems) && rawItems.length > 0
      ? rawItems
      : Array.isArray(order.order_items) && order.order_items.length > 0
        ? order.order_items
        : Array.isArray(order.items) && order.items.length > 0
          ? order.items
          : [];

  // Calculate items total as reliable fallback
  const calculatedItemsTotal = items.reduce((sum: number, it: any) => {
    const unitPrice = Number(it.unit_price ?? it.price ?? 0);
    const qty = Number(it.quantity ?? it.qty ?? 1);
    const lineTotal = Number(it.total_price ?? unitPrice * qty);
    return sum + (isNaN(lineTotal) ? 0 : lineTotal);
  }, 0);

  const totalAmountNum = Number(order.total_amount ?? order.totalAmount ?? order.total);
  const totalAmount =
    !isNaN(totalAmountNum) && totalAmountNum > 0 ? totalAmountNum : calculatedItemsTotal;

  let subtotal = Number(order.subtotal);
  let taxAmount = Number(order.tax_amount ?? order.taxAmount ?? order.tax);

  if (isNaN(subtotal) || subtotal <= 0) {
    if (!isNaN(taxAmount) && taxAmount > 0 && totalAmount > taxAmount) {
      subtotal = totalAmount - taxAmount;
    } else if (calculatedItemsTotal > 0) {
      subtotal = calculatedItemsTotal;
    } else {
      subtotal = totalAmount;
    }
  }

  if (isNaN(taxAmount) || taxAmount < 0) {
    if (totalAmount > subtotal) {
      taxAmount = totalAmount - subtotal;
    } else {
      taxAmount = 0;
    }
  }

  const cgst = taxAmount > 0 ? taxAmount / 2 : 0;
  const sgst = taxAmount > 0 ? taxAmount / 2 : 0;

  const rawWords = totalAmount > 0 ? numberToWords(Math.floor(totalAmount)) : '';
  const cleanWords = rawWords.replace(/Only\s*$/i, '').trim();
  const totalInWords = cleanWords ? `Amount in words: ${cleanWords} Rupees Only` : '';

  const invoiceNumber =
    order.order_number ||
    order.orderNumber ||
    order.invoice_number ||
    order.invoiceNumber ||
    order.id ||
    `POS-${Date.now().toString().slice(-6)}`;

  let invoiceDateStr = new Date().toLocaleDateString('en-IN');
  const rawDate = order.created_at || order.createdAt || order.date || order.order_date;
  if (rawDate) {
    const parsedDate = new Date(rawDate);
    if (!isNaN(parsedDate.getTime())) {
      invoiceDateStr = parsedDate.toLocaleDateString('en-IN');
    }
  }

  // Extract settings from cmsData array or object
  const contact = Array.isArray(cmsData)
    ? cmsData.find((s) => s.section_key === 'contact')?.content || {}
    : cmsData || {};

  const template = Array.isArray(cmsData)
    ? cmsData.find((s) => s.section_key === 'invoice_template')?.content || {}
    : {};

  const layout = template.layout || 'classic';
  const primaryColor = template.primaryColor || '#004ac6';
  const showLogo = template.showLogo !== false; // default true
  const showSignatory = template.showSignatory !== false; // default true

  const isMinimalist = layout === 'minimalist';
  const isModern = layout === 'modern';

  // Handle address normalization
  let address: any = null;
  if (order.addresses && Array.isArray(order.addresses) && order.addresses.length > 0) {
    address = order.addresses[0];
  } else if (order.addresses && typeof order.addresses === 'object') {
    address = order.addresses;
  } else if (order.shipping_address) {
    address =
      typeof order.shipping_address === 'string'
        ? JSON.parse(order.shipping_address)
        : order.shipping_address;
  } else if (order.shippingAddress) {
    address =
      typeof order.shippingAddress === 'string'
        ? JSON.parse(order.shippingAddress)
        : order.shippingAddress;
  }

  const invoiceHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Tax Invoice - ${invoiceNumber}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        :root {
          --primary-color: ${primaryColor};
        }
        body { 
          font-family: 'Inter', sans-serif; 
          padding: 40px; 
          color: #1a1a1a; 
          line-height: 1.4; 
          font-size: 12px;
          background: #fff;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          ${isMinimalist ? 'border: none; padding: 20px;' : 'border: 1px solid #eee; padding: 40px; box-shadow: 0 0 10px rgba(0,0,0,0.05);'}
        }
        .header { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 30px; 
          ${isMinimalist ? 'border-bottom: 1px solid #e5e7eb;' : isModern ? `background: var(--primary-color); color: #fff; padding: 20px; border-radius: 10px; margin: -20px -20px 30px -20px;` : `border-bottom: 2px solid var(--primary-color);`}
          padding-bottom: ${isModern ? '20px' : '20px'};
        }
        .company-info h1 { 
          margin: 0; 
          font-size: 28px; 
          color: ${isModern ? '#fff' : 'var(--primary-color)'}; 
          font-weight: 700;
        }
        .company-info p { margin: 4px 0; color: ${isModern ? '#f3f4f6' : '#4b5563'}; }
        
        .invoice-details { text-align: right; }
        .invoice-details h2 { 
          margin: 0 0 10px 0; 
          font-size: 20px; 
          text-transform: uppercase; 
          color: ${isModern ? '#fff' : 'var(--primary-color)'};
          letter-spacing: 1px;
        }
        .detail-row { display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 4px; }
        .detail-label { color: ${isModern ? '#e5e7eb' : '#6b7280'}; font-weight: 500; }
        .detail-value { font-weight: 600; color: ${isModern ? '#fff' : '#111827'}; }

        .address-section { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 40px; 
          margin-bottom: 30px; 
        }
        .address-box h3 { 
          font-size: 10px; 
          text-transform: uppercase; 
          letter-spacing: 1px; 
          color: #6b7280; 
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 5px;
          margin-bottom: 10px;
        }
        .address-content p { margin: 2px 0; font-size: 13px; }
        .address-content .name { font-weight: 700; font-size: 14px; margin-bottom: 4px; }

        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 30px; 
        }
        .items-table th { 
          background: ${isMinimalist ? 'transparent' : isModern ? 'var(--primary-color)' : '#f9fafb'}; 
          color: ${isMinimalist ? '#374151' : isModern ? '#fff' : '#374151'}; 
          text-align: left; 
          padding: 12px 10px; 
          border-bottom: ${isMinimalist ? '1px solid #e5e7eb' : 'none'};
          border-top: ${isMinimalist ? '1px solid #e5e7eb' : 'none'};
          font-weight: 600;
          text-transform: uppercase;
          font-size: 11px;
        }
        .items-table td { 
          padding: 12px 10px; 
          border-bottom: 1px solid #f3f4f6;
          vertical-align: top;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }

        .summary-section { 
          display: flex; 
          justify-content: flex-end; 
          margin-bottom: 40px;
        }
        .summary-table { width: 300px; }
        .summary-row { display: flex; justify-content: space-between; padding: 6px 0; }
        .summary-row.total { 
          border-top: ${isMinimalist ? '1px solid #e5e7eb' : '2px solid var(--primary-color)'}; 
          margin-top: 10px; 
          padding-top: 10px;
          font-size: 16px;
          font-weight: 700;
          color: ${isMinimalist ? '#111827' : 'var(--primary-color)'};
        }
        .amount-in-words { 
          margin-top: -30px;
          font-style: italic;
          color: #6b7280;
          font-size: 11px;
          margin-bottom: 40px;
        }

        .footer { 
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .terms { max-width: 60%; font-size: 10px; color: #9ca3af; }
        .signature { text-align: center; }
        .sig-line { border-bottom: 1px solid #111827; width: 150px; margin-bottom: 10px; }
        .sig-text { font-weight: 600; font-size: 11px; }

        @media print {
          body { padding: 0; }
          .invoice-container { border: none; box-shadow: none; max-width: 100%; padding: 0; margin: 0;}
          .header { ${isModern ? '-webkit-print-color-adjust: exact; print-color-adjust: exact;' : ''} }
          .items-table th { ${isModern ? '-webkit-print-color-adjust: exact; print-color-adjust: exact;' : ''} }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="company-info">
            <h1>${showLogo ? '<span style="margin-right: 8px;">■</span>' : ''}${contact?.storeName || 'ByteEvolvr'}</h1>
            <p>${contact?.email || 'hello@byteevolvr.com'}</p>
            <p>${(contact?.address || 'Chaltakonda, Routhkhanda, Near Kali Mata Mandir\nJoypur, Bankura, West Bengal - 722138').replace(/\n/g, '<br/>')}</p>
            <p>GSTIN: ${contact?.gstNumber || '19AABCU9603R1ZN'} | PAN: ${contact?.panNumber || 'AABCU9603R'}</p>
          </div>
          <div class="invoice-details">
            <h2>Tax Invoice</h2>
            <div class="detail-row">
              <span class="detail-label">Invoice No:</span>
              <span class="detail-value">${invoiceNumber}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${invoiceDateStr}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Place of Supply:</span>
              <span class="detail-value">${address?.state || 'Maharashtra (27)'}</span>
            </div>
          </div>
        </div>

        <div class="address-section">
          <div class="address-box">
            <h3>Billed To</h3>
            <div class="address-content">
              <p class="name">${order.customer_name || address?.name || 'Customer'}</p>
              <p>${order.customer_email || address?.email || ''}</p>
              ${address && address.phone ? `<p>Phone: ${address.phone}</p>` : ''}
              ${address && address.state ? `<p>POS: ${address.state}</p>` : ''}
            </div>
          </div>
          <div class="address-box">
            <h3>Shipping Address</h3>
            <div class="address-content">
              ${
                address
                  ? `
                <p class="name">${address.full_name || address.name || order.customer_name || 'Customer'}</p>
                <p>${address.line_1 || ''}</p>
                ${address.line_2 ? `<p>${address.line_2}</p>` : ''}
                <p>${[address.city, address.state].filter(Boolean).join(', ')}${address.postal_code ? ` - ${address.postal_code}` : ''}</p>
                ${address.phone ? `<p>Mobile: ${address.phone}</p>` : ''}
              `
                  : `
                <p>Counter Sale / Pickup</p>
              `
              }
            </div>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>Description</th>
              <th class="text-center" style="width: 60px;">Qty</th>
              <th class="text-right" style="width: 100px;">Rate</th>
              <th class="text-right" style="width: 100px;">Taxable Value</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map((item: any, i: number) => {
                const productName = item.product_name || item.name || item.title || 'Product Item';
                const sku = item.sku || 'N/A';
                const qty = Number(item.quantity ?? item.qty ?? 1);
                const unitPrice = Number(item.unit_price ?? item.price ?? 0);
                const lineTotal = Number(item.total_price ?? unitPrice * qty);
                return `
              <tr>
                <td class="text-center">${i + 1}</td>
                <td>
                  <div style="font-weight: 600;">${productName}</div>
                  <div style="font-size: 10px; color: #6b7280;">SKU: ${sku}</div>
                </td>
                <td class="text-center">${qty}</td>
                <td class="text-right">${unitPrice.toFixed(2)}</td>
                <td class="text-right">${lineTotal.toFixed(2)}</td>
              </tr>
            `;
              })
              .join('')}
          </tbody>
        </table>

        <div class="summary-section">
          <div class="summary-table">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>₹${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span>CGST (9%)</span>
              <span>₹${cgst.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span>SGST (9%)</span>
              <span>₹${sgst.toFixed(2)}</span>
            </div>
            ${
              order.shipping_amount > 0
                ? `
              <div class="summary-row">
                <span>Shipping</span>
                <span>₹${Number(order.shipping_amount).toFixed(2)}</span>
              </div>
            `
                : ''
            }
            <div class="summary-row total">
              <span>Total</span>
              <span>₹${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        ${totalInWords ? `<div class="amount-in-words">${totalInWords}</div>` : ''}

        <div class="footer">
          <div class="terms">
            <p style="font-weight: 700; color: #4b5563; margin-bottom: 4px;">Terms & Conditions</p>
            <p>1. Goods once sold will not be taken back or exchanged.</p>
            <p>2. Any dispute subject to Mumbai Jurisdiction.</p>
            <p>3. This is a computer generated invoice and requires no physical signature.</p>
          </div>
          ${
            showSignatory
              ? `
          <div class="signature">
            <div class="sig-line"></div>
            <p class="sig-text">Authorized Signatory</p>
          </div>
          `
              : ''
          }
        </div>
      </div>
      <script>
        window.onload = () => {
          setTimeout(() => {
            window.print();
            // window.close(); // Optional: close window after printing
          }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(invoiceHtml);
  printWindow.document.close();
};
