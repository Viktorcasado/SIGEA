
import { Attendee } from '../types';

/**
 * Exporta a lista de participantes para um arquivo CSV
 * @param attendees Lista de participantes (inscritos)
 * @param eventTitle Título do evento para o nome do arquivo
 */
export const exportAttendeesToCSV = (attendees: Attendee[], eventTitle: string) => {
  // 1. Cabeçalhos das colunas
  const headers = ['Nome Completo', 'Identificação/Matrícula', 'Tipo de Usuário', 'Status de Presença'];

  // 2. Mapeamento dos dados (escapando vírgulas se necessário)
  const rows = attendees.map(attendee => [
    `"${attendee.name.replace(/"/g, '""')}"`,
    `"${attendee.id}"`,
    `"${attendee.user_type || 'N/A'}"`,
    `"${attendee.status === 'Present' ? 'Presente' : 'Ausente'}"`
  ]);

  // 3. Construção do conteúdo CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // 4. Criação do Blob com BOM para suporte a acentos no Excel
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // 5. Trigger do download no navegador
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const fileName = `Inscritos_${eventTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Limpeza de memória
  URL.revokeObjectURL(url);
};
