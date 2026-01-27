
import { jsPDF } from 'jspdf';
import { Certificate, User } from '../types';

/**
 * Converte uma URL de imagem para Base64 de forma assíncrona
 */
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
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = (error) => reject(error);
    img.src = url;
  });
};

/**
 * Gera um PDF do certificado utilizando jsPDF baseado no template do evento
 */
export const generateCertificatePDF = async (certificate: Certificate, user: User) => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Dimensões A4 Landscape em mm
    const pageWidth = 297;
    const pageHeight = 210;

    // 1. Adicionar Imagem de Fundo (Banner do Evento)
    if (certificate.event.imageUrl) {
      try {
        const base64Img = await getBase64ImageFromURL(certificate.event.imageUrl);
        doc.addImage(base64Img, 'PNG', 0, 0, pageWidth, pageHeight);
      } catch (e) {
        console.error("Erro ao carregar imagem de fundo para o PDF:", e);
        // Fallback: Adicionar um fundo institucional padrão ou cor sólida
        doc.setFillColor(248, 248, 250);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
      }
    }

    // 2. Adicionar Nome do Participante (Posicionamento Dinâmico)
    // Usamos as coordenadas salvas no evento ou fallback para o centro
    const xPosPercent = certificate.event.cert_pos_x ?? 50;
    const yPosPercent = certificate.event.cert_pos_y ?? 50;

    const finalX = (xPosPercent / 100) * pageWidth;
    const finalY = (yPosPercent / 100) * pageHeight;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(0, 0, 0); // Preto
    
    // Alinhamento centralizado no ponto X
    const nameText = user.full_name.toUpperCase();
    doc.text(nameText, finalX, finalY, { align: 'center' });

    // 3. Adicionar Metadados/Rodapé (Opcional - Pode estar na imagem)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Código de Validação: ${certificate.code}`, 10, pageHeight - 10);
    doc.text(`Emitido via SIGEA - IFAL`, pageWidth - 10, pageHeight - 10, { align: 'right' });

    // 4. Download do Arquivo
    const fileName = `Certificado_${certificate.eventTitle.replace(/\s+/g, '_')}_${user.full_name.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error("Erro fatal ao gerar PDF:", error);
    throw error;
  }
};
