import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { api } from './api'

// Configure notification handler (show notifications when app is in foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

/**
 * Register for push notifications and return the Expo push token.
 * Saves the token to backend for server-side push.
 */
export async function registerForPushNotifications(uid: string): Promise<string | null> {
  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device')
    return null
  }

  // Check / request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted')
    return null
  }

  // Get Expo push token
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: 'chaintrace-farmer-app', // EAS project ID
  })
  const token = tokenData.data

  // Save token to backend
  try {
    await api.post('/farmer/push-token', { uid, token })
  } catch {
    console.log('Failed to save push token to backend')
  }

  // Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('iot-alerts', {
      name: 'IoT Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00c896',
      sound: 'default',
    })

    await Notifications.setNotificationChannelAsync('batch-updates', {
      name: 'Batch Updates',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    })
  }

  return token
}

/**
 * Schedule a local notification (for testing / demo)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  channelId: string = 'iot-alerts',
  seconds: number = 1,
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      ...(Platform.OS === 'android' ? { channelId } : {}),
    },
    trigger: { seconds, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL },
  })
}

/**
 * Add notification response listener (when user taps notification)
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void,
) {
  return Notifications.addNotificationResponseReceivedListener(callback)
}

/**
 * Add notification received listener (when notification arrives)
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void,
) {
  return Notifications.addNotificationReceivedListener(callback)
}
