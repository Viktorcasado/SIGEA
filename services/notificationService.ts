import { Activity } from '../types';

const STORAGE_KEY = 'sigea_scheduled_notifications';

/**
 * Obtém os IDs de timeout das notificações agendadas do localStorage.
 */
const getScheduledNotifications = (): Record<number, number> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error("Failed to parse scheduled notifications:", e);
    return {};
  }
};

/**
 * Salva os IDs de timeout das notificações agendadas no localStorage.
 */
const saveScheduledNotifications = (notifications: Record<number, number>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.error("Failed to save scheduled notifications:", e);
  }
};


/**
 * Solicita permissão ao usuário para enviar notificações.
 * @returns {Promise<NotificationPermission>} O status da permissão concedida.
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('Este navegador não suporta notificações.');
    return 'denied';
  }
  return await Notification.requestPermission();
};

/**
 * Verifica se uma notificação já foi agendada para uma atividade específica.
 * @param {number} activityId O ID da atividade.
 * @returns {boolean} True se a notificação já estiver agendada.
 */
export const isNotificationScheduled = (activityId: number): boolean => {
    const scheduled = getScheduledNotifications();
    return !!scheduled[activityId];
};

/**
 * Agenda uma notificação local para lembrar o usuário sobre uma atividade.
 * A notificação é disparada 15 minutos antes do horário de início da atividade.
 * @param {Activity} activity - O objeto da atividade para a qual agendar a notificação.
 */
export const scheduleNotificationForActivity = (activity: Activity) => {
  if (Notification.permission !== 'granted') {
    console.log('Permissão para notificações não concedida. Não é possível agendar.');
    return;
  }
  
  if (isNotificationScheduled(activity.id)) {
      console.log(`Notificação para a atividade ${activity.id} já está agendada.`);
      return;
  }

  const startTime = new Date(activity.start_time).getTime();
  const notificationTime = startTime - 15 * 60 * 1000; // 15 minutos antes
  const now = Date.now();

  if (notificationTime <= now) {
    console.log(`A atividade "${activity.title}" já começou ou está prestes a começar. Nenhuma notificação agendada.`);
    return;
  }

  const delay = notificationTime - now;

  const timeoutId = window.setTimeout(() => {
    // FIX: The 'vibrate' property is not a standard part of NotificationOptions and causes a TypeScript error.
    // It has been removed from the options object and is now called separately via navigator.vibrate().
    new Notification('Lembrete de Atividade SIGEA', {
      body: `Sua atividade "${activity.title}" começa em 15 minutos no local: ${activity.location}.`,
      icon: '/favicon.svg', // Verifique se este caminho está correto
    });
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    // Limpa a notificação do storage após ser enviada
    const scheduled = getScheduledNotifications();
    delete scheduled[activity.id];
    saveScheduledNotifications(scheduled);
  }, delay);
  
  // Salva o ID do timeout para referência futura (ex: para cancelar)
  const scheduled = getScheduledNotifications();
  scheduled[activity.id] = timeoutId;
  saveScheduledNotifications(scheduled);

  console.log(`Notificação agendada para a atividade "${activity.title}" em ${new Date(notificationTime).toLocaleString()}`);
};
