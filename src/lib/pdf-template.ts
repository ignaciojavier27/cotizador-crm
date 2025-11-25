import { QuotationPDFData } from '@/types/pdf';

export const generateQuotationHTML = (data: QuotationPDFData): string => {
  const { quotation, company } = data;

  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return '$0';
    
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return 'No especificada';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateSubtotal = (): number => {
    return quotation.details.reduce((total, detail) => {
      return total + (detail.subtotal || detail.quantity * Number(detail.unitPrice));
    }, 0);
  };

  const calculateTax = (): number => {
    return quotation.details.reduce((total, detail) => {
      const subtotal = detail.subtotal || detail.quantity * Number(detail.unitPrice);
      const taxRate = detail.product.taxPercentage ? Number(detail.product.taxPercentage) / 100 : 0.19;
      return total + (detail.lineTax || subtotal * taxRate);
    }, 0);
  };

  const calculateTotal = (): number => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    return subtotal + tax;
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      sent: 'Enviada',
      accepted: 'Aceptada',
      rejected: 'Rechazada',
      expired: 'Expirada'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status: string): string => {
    const classMap: Record<string, string> = {
      sent: 'status-sent',
      accepted: 'status-accepted',
      rejected: 'status-rejected',
      expired: 'status-expired'
    };
    return classMap[status] || 'status-sent';
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = calculateTotal();

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cotización ${quotation.quotationNumber}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #fff;
                font-size: 12px;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 25px 20px;
            }
            
            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 30px;
                border-bottom: 2px solid #2c5aa0;
                padding-bottom: 15px;
            }
            
            .company-info {
                flex: 1;
            }
            
            .company-logo {
                max-width: 120px;
                max-height: 60px;
                margin-bottom: 8px;
            }
            
            .company-name {
                font-size: 16px;
                font-weight: bold;
                color: #2c5aa0;
                margin-bottom: 4px;
            }
            
            .company-details {
                font-size: 10px;
                color: #666;
                line-height: 1.4;
            }
            
            .quotation-info {
                text-align: right;
            }
            
            .quotation-title {
                font-size: 20px;
                font-weight: bold;
                color: #2c5aa0;
                margin-bottom: 8px;
            }
            
            .quotation-number {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 4px;
            }
            
            .date {
                color: #666;
                font-size: 10px;
                margin-bottom: 2px;
            }
            
            .status-badge {
                display: inline-block;
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 9px;
                font-weight: bold;
                text-transform: uppercase;
                margin-top: 5px;
            }
            
            .status-sent {
                background-color: #e3f2fd;
                color: #1565c0;
            }
            
            .status-accepted {
                background-color: #e8f5e8;
                color: #2e7d32;
            }
            
            .status-rejected {
                background-color: #ffebee;
                color: #c62828;
            }
            
            .status-expired {
                background-color: #fff3e0;
                color: #ef6c00;
            }
            
            .client-info {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 6px;
                margin-bottom: 20px;
            }
            
            .section-title {
                font-size: 14px;
                font-weight: bold;
                color: #2c5aa0;
                margin-bottom: 10px;
                border-bottom: 1px solid #e9ecef;
                padding-bottom: 3px;
            }
            
            .client-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                font-size: 10px;
            }
            
            .client-field {
                margin-bottom: 2px;
            }
            
            .products-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
                font-size: 10px;
            }
            
            .products-table th {
                background-color: #2c5aa0;
                color: white;
                padding: 8px 6px;
                text-align: left;
                font-weight: bold;
                border: 1px solid #2c5aa0;
            }
            
            .products-table td {
                padding: 8px 6px;
                border: 1px solid #dee2e6;
            }
            
            .products-table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            
            .text-right {
                text-align: right;
            }
            
            .text-center {
                text-align: center;
            }
            
            .text-left {
                text-align: left;
            }
            
            .totals {
                width: 250px;
                margin-left: auto;
                margin-bottom: 20px;
            }
            
            .total-row {
                display: flex;
                justify-content: space-between;
                padding: 6px 0;
                border-bottom: 1px solid #dee2e6;
                font-size: 11px;
            }
            
            .total-row.final {
                font-weight: bold;
                font-size: 12px;
                color: #2c5aa0;
                border-bottom: 2px solid #2c5aa0;
            }
            
            .notes {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 6px;
                margin-bottom: 20px;
                font-size: 10px;
            }
            
            .terms {
                background-color: #fff3cd;
                padding: 12px;
                border-radius: 6px;
                margin-bottom: 20px;
                font-size: 9px;
                border-left: 4px solid #ffc107;
            }
            
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 15px;
                border-top: 1px solid #dee2e6;
                color: #666;
                font-size: 9px;
            }
            
            .product-name {
                font-weight: bold;
                margin-bottom: 2px;
            }
            
            .product-details {
                color: #666;
                font-size: 9px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="company-info">
                    ${company.logoUrl ? `<img src="${company.logoUrl}" alt="${company.name}" class="company-logo">` : ''}
                    <div class="company-name">${company.name}</div>
                    <div class="company-details">
                        ${company.rut ? `<div>RUT: ${company.rut}</div>` : ''}
                        ${company.address ? `<div>${company.address}</div>` : ''}
                        ${company.phone ? `<div>Tel: ${company.phone}</div>` : ''}
                        ${company.contactEmail ? `<div>Email: ${company.contactEmail}</div>` : ''}
                    </div>
                </div>
                <div class="quotation-info">
                    <div class="quotation-title">COTIZACIÓN</div>
                    <div class="quotation-number">${quotation.quotationNumber}</div>
                    <div class="date">Fecha: ${formatDate(quotation.createdAt)}</div>
                    <div class="date">Válida hasta: ${formatDate(quotation.expiresAt)}</div>
                    <div class="status-badge ${getStatusClass(quotation.status)}">
                        ${getStatusText(quotation.status)}
                    </div>
                </div>
            </div>
            
            <div class="client-info">
                <div class="section-title">INFORMACIÓN DEL CLIENTE</div>
                <div class="client-details">
                    <div class="client-field"><strong>Nombre/Razón Social:</strong> ${quotation.client.name}</div>
                    ${quotation.client.clientCompany ? `<div class="client-field"><strong>Empresa:</strong> ${quotation.client.clientCompany}</div>` : ''}
                    ${quotation.client.email ? `<div class="client-field"><strong>Email:</strong> ${quotation.client.email}</div>` : ''}
                    ${quotation.client.phone ? `<div class="client-field"><strong>Teléfono:</strong> ${quotation.client.phone}</div>` : ''}
                    ${quotation.client.referenceContact ? `<div class="client-field"><strong>Contacto:</strong> ${quotation.client.referenceContact}</div>` : ''}
                </div>
            </div>
            
            <div class="section-title">DETALLE DE PRODUCTOS/SERVICIOS</div>
            <table class="products-table">
                <thead>
                    <tr>
                        <th width="40%">Producto/Servicio</th>
                        <th width="10%" class="text-center">Cantidad</th>
                        <th width="20%" class="text-right">Precio Unitario</th>
                        <th width="15%" class="text-right">IVA</th>
                        <th width="15%" class="text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${quotation.details.map((detail) => {
                      const subtotal = detail.subtotal || detail.quantity * Number(detail.unitPrice);
                      const taxRate = detail.product.taxPercentage ? Number(detail.product.taxPercentage) : 19;
                      const taxAmount = detail.lineTax || subtotal * (taxRate / 100);
                      
                      return `
                        <tr>
                            <td>
                                <div class="product-name">${detail.product.name}</div>
                                ${detail.product.description ? `<div class="product-details">${detail.product.description}</div>` : ''}
                                ${detail.product.brand ? `<div class="product-details">Marca: ${detail.product.brand}</div>` : ''}
                            </td>
                            <td class="text-center">${detail.quantity}</td>
                            <td class="text-right">${formatCurrency(Number(detail.unitPrice))}</td>
                            <td class="text-right">${formatCurrency(taxAmount)}</td>
                            <td class="text-right">${formatCurrency(subtotal)}</td>
                        </tr>
                      `;
                    }).join('')}
                </tbody>
            </table>
            
            <div class="totals">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(subtotal)}</span>
                </div>
                <div class="total-row">
                    <span>IVA:</span>
                    <span>${formatCurrency(tax)}</span>
                </div>
                <div class="total-row final">
                    <span>TOTAL:</span>
                    <span>${formatCurrency(total)}</span>
                </div>
            </div>
            
            ${quotation.internalNotes ? `
            <div class="notes">
                <div class="section-title">NOTAS INTERNAS</div>
                <p>${quotation.internalNotes}</p>
            </div>
            ` : ''}
            
            <div class="terms">
                <div class="section-title">TÉRMINOS Y CONDICIONES</div>
                <p>• Esta cotización es válida por 30 días a partir de la fecha de emisión</p>
                <p>• Los precios incluyen IVA (19%) según normativa chilena</p>
                <p>• Tiempo de entrega sujeto a disponibilidad de stock</p>
                <p>• Formas de pago: Transferencia bancaria, cheque a fecha, efectivo</p>
                <p>• Jurisdicción: Santiago de Chile</p>
            </div>
            
            <div class="footer">
                <p>${company.name} - ${company.rut || ''} - ${company.address || ''} - ${company.phone || ''}</p>
                <p>Gracias por su preferencia</p>
            </div>
        </div>
    </body>
    </html>
  `;
};