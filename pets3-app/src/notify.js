/**
 * 每日学习提醒（Android 本地通知）
 * 用 Capacitor Local Notifications 实现
 */

async function getPlugin() {
  try {
    // LocalNotifications 仅在原生平台（Android/iOS）实现；Web 端调用会抛
    // "not implemented on web"，故先判断平台，Web 上直接返回 null。
    const cap = window.Capacitor;
    if (!cap || typeof cap.isNativePlatform !== 'function' || !cap.isNativePlatform()) {
      return null;
    }
    const mod = await import('@capacitor/local-notifications');
    return mod.LocalNotifications;
  } catch (e) {
    return null;
  }
}

/** 检查通知权限并请求 */
export async function ensurePermission() {
  const p = await getPlugin();
  if (!p) return false;
  try {
    const perm = await p.checkPermissions();
    if (perm.display !== 'granted') {
      const req = await p.requestPermissions();
      return req.display === 'granted';
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 设置每日提醒
 * @param {boolean} enabled
 * @param {string} time 'HH:mm' 格式
 */
export async function setDailyReminder(enabled, time = '20:00') {
  const p = await getPlugin();
  if (!p) return false;
  try {
    await p.cancel({ notifications: [{ id: 1001 }] });
    if (enabled) {
      const [h, m] = time.split(':').map(Number);
      await p.schedule({
        notifications: [{
          id: 1001,
          title: '我想背单词',
          body: '今天的单词还没学，快来打卡吧！',
          schedule: {
            on: { hour: h, minute: m },
            repeats: true,
            allowWhileIdle: true,
          },
          sound: null,
          smallIcon: 'ic_stat_name',
          iconColor: '#3b82f6',
        }],
      });
    }
    return true;
  } catch (e) {
    console.warn('reminder error', e);
    return false;
  }
}
