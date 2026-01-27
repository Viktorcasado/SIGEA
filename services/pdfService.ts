import { jsPDF } from 'jspdf';
import { Certificate, User } from '../types';

const getBase64ImageFromURL = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (error) => reject(error);
    img.src = url;
  });
};

export const generateCertificatePDF = async (certificate: Certificate, user: User) => {
  try {
    const orientation = certificate.event.cert_orientation || 'landscape';
    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = orientation === 'landscape' ? 297 : 210;
    const pageHeight = orientation === 'landscape' ? 210 : 297;

    if (certificate.event.imageUrl) {
      try {
        const base64Img = await getBase64ImageFromURL(certificate.event.imageUrl);
        doc.addImage(base64Img, 'PNG', 0, 0, pageWidth, pageHeight);
      } catch (e) {
        console.error("Erro na imagem de fundo do PDF:", e);
        doc.setFillColor(248, 248, 250);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
      }
    }

    const xPosPercent = certificate.event.cert_pos_x ?? 50;
    const yPosPercent = certificate.event.cert_pos_y ?? 50;
    const finalX = (xPosPercent / 100) * pageWidth;
    const finalY = (yPosPercent / 100) * pageHeight;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(orientation === 'landscape' ? 28 : 24);
    doc.setTextColor(0, 0, 0);
    doc.text(user.full_name.toUpperCase(), finalX, finalY, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(`CÓDIGO DE AUTENTICIDADE: ${certificate.code}`, 10, pageHeight - 10);

    doc.save(`Certificado_${user.full_name.replace(/\s+/g, '_')}.pdf`);
    return true;
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    throw error;
  }
};