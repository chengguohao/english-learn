/**
 * 每日学习提醒（Android 本地通知）
 * 用 Capacitor Local Notifications 实现
 *
 * 注意：不使用动态 import('@capacitor/local-notifications')，
 * 因为 vite-plugin-singlefile + inlineDynamicImports 打包后
 * 在 Android WebView 中无法正确解析。
 * 改用 Capacitor 官方推荐的 window.Capacitor.Plugins 直接访问。
 */

/** 获取 LocalNotifications 插件实例（仅原生平台可用） */
function getPlugin() {
  try {
    const cap = window.Capacitor;
    if (!cap || !cap.isNativePlatform || !cap.isNativePlatform()) {
      return null; // Web 端不可用
    }
    // 优先从 Capacitor.Plugins 取（原生注入）
    if (cap.Plugins && cap.Plugins.LocalNotifications) {
      return cap.Plugins.LocalNotifications;
    }
    return null;
  } catch (e) {
    return null;
  }
}

/** 检查通知权限并请求 */
export async function ensurePermission() {
  const p = getPlugin();
  if (!p) return false;
  try {
    const perm = await p.checkPermissions();
    if (perm.display !== 'granted') {
      const req = await p.requestPermissions();
      return req.display === 'granted';
    }
    return true;
  } catch (e) {
    console.warn('checkPermission error', e);
    return false;
  }
}

/**
 * 设置每日提醒
 * @param {boolean} enabled
 * @param {string} time 'HH:mm' 格式
 */
export async function setDailyReminder(enabled, time = '20:00') {
  const p = getPlugin();
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
