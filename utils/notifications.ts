import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    
    if (!projectId) {
      console.log('Project ID not found');
    }
    
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: projectId || 'nf5zyqxttwhnx7sm1pnfb',
      })
    ).data;
    
    console.log('Push notification token:', token);
  } catch (error) {
    console.error('Error getting push token:', error);
  }

  return token;
}

export async function scheduleCallNotification(
  callerNumber: string,
  callerName?: string,
  summary?: string
): Promise<string> {
  if (Platform.OS === 'web') {
    console.log('[Notifications] Skipping notification on web platform');
    return 'web-not-supported';
  }
  
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Appel terminé - ${callerName || callerNumber}`,
      body: summary || "Votre agent IA a reçu un appel. Consultez l'historique pour plus de détails.",
      data: { callerNumber, callerName, summary },
      sound: true,
      badge: 1,
    },
    trigger: null,
  });

  return identifier;
}

export async function scheduleCallCompletedNotification(
  callerNumber: string,
  callerName: string,
  aiSummary: string
): Promise<string> {
  if (Platform.OS === 'web') {
    console.log('[Notifications] Skipping notification on web platform');
    return 'web-not-supported';
  }
  
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Appel terminé - ${callerName}`,
      body: `Résumé AI: ${aiSummary}`,
      data: { callerNumber, callerName, aiSummary, type: 'call_completed' },
      sound: true,
      badge: 1,
    },
    trigger: null,
  });

  return identifier;
}

export async function clearAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
  await Notifications.setBadgeCountAsync(0);
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleAIAgentActivationNotification(
  activationDate: string,
  startTime: string,
  endTime: string,
  vapiPhoneNumber: string,
  countryCode: string
): Promise<string> {
  if (Platform.OS === 'web') {
    console.log('[Notifications] Skipping notification scheduling on web platform');
    return 'web-not-supported';
  }
  
  const [day, month, year] = activationDate.split('/');
  const [hours, minutes] = startTime.split(':');
  
  const triggerDate = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hours),
    parseInt(minutes)
  );

  const cleanedVirtualNumber = vapiPhoneNumber.replace(/[\s\-\.\(\)]/g, '');
  
  let ccfCode = '*61*';
  if (countryCode === '+212') {
    ccfCode = '**61*';
  } else if (countryCode === '+1') {
    ccfCode = '*61*';
  }
  
  const virtualNumber = cleanedVirtualNumber;
  const deepLink = `tel:${ccfCode}${virtualNumber}#`;

  const trigger: Notifications.NotificationTriggerInput = { 
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds: Math.floor((triggerDate.getTime() - Date.now()) / 1000),
    repeats: false 
  };

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🤖 Activation de l\'Agent IA programmée',
      body: `Il est temps d'activer votre transfert d'appel. Appuyez pour composer le code : ${ccfCode}${virtualNumber}#`,
      data: { 
        type: 'ai_agent_activation',
        deepLink,
        vapiPhoneNumber,
        countryCode,
        startTime,
        endTime
      },
      sound: true,
      badge: 1,
    },
    trigger,
  });

  console.log(`[Notifications] Scheduled AI activation for ${activationDate} at ${startTime}`);
  return identifier;
}

export async function scheduleAIAgentDeactivationNotification(
  activationDate: string,
  endTime: string,
  countryCode: string
): Promise<string> {
  if (Platform.OS === 'web') {
    console.log('[Notifications] Skipping deactivation notification scheduling on web platform');
    return 'web-not-supported';
  }
  
  const [day, month, year] = activationDate.split('/');
  const [hours, minutes] = endTime.split(':');
  
  const triggerDate = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hours),
    parseInt(minutes)
  );

  let deactivationCode = '#61#';
  if (countryCode === '+212') {
    deactivationCode = '##61#';
  } else if (countryCode === '+1') {
    deactivationCode = '#61#';
  } else {
    deactivationCode = '##002#';
  }
  
  const deepLink = `tel:${deactivationCode}`;

  const trigger: Notifications.NotificationTriggerInput = { 
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds: Math.floor((triggerDate.getTime() - Date.now()) / 1000),
    repeats: false 
  };

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔴 Désactivation de l\'Agent IA programmée',
      body: `La période d'activation est terminée. Appuyez pour annuler le transfert d'appel : ${deactivationCode}`,
      data: { 
        type: 'ai_agent_deactivation',
        deepLink,
        countryCode
      },
      sound: true,
      badge: 1,
    },
    trigger,
  });

  console.log(`[Notifications] Scheduled AI deactivation for ${activationDate} at ${endTime}`);
  return identifier;
}
