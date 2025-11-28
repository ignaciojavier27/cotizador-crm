import nodemailer from 'nodemailer';

interface SendQuotationEmailParams {
    to: string;
    clientName: string;
    quotationNumber: string;
    pdfBuffer: Buffer;
    companyName: string;
}

export async function sendQuotationEmail({
    to,
    clientName,
    quotationNumber,
    pdfBuffer,
    companyName,
}: SendQuotationEmailParams) {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: `"${companyName}" <${process.env.SMTP_FROM}>`,
            to,
            subject: `Nueva Cotización ${quotationNumber} - ${companyName}`,
            html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Hola ${clientName},</h2>
          <p>Adjunto encontrarás la cotización <strong>${quotationNumber}</strong> solicitada.</p>
          <p>Si tienes alguna duda o consulta, no dudes en responder a este correo.</p>
          <br>
          <p>Atentamente,</p>
          <p><strong>${companyName}</strong></p>
        </div>
      `,
            attachments: [
                {
                    filename: `Cotizacion-${quotationNumber}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                },
            ],
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error enviando correo:', error);
        // Include the original error message in the thrown error
        if (error instanceof Error) {
            throw new Error(`No se pudo enviar el correo electrónico: ${error.message}`);
        }
        throw new Error('No se pudo enviar el correo electrónico: Error desconocido');
    }
}
