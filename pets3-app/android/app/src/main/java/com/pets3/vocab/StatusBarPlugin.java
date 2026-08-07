package com.pets3.vocab;

import android.graphics.Color;
import android.os.Build;
import android.view.WindowManager;
import android.view.Window;
import android.view.View;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "StatusBar")
public class StatusBarPlugin extends Plugin {

    @PluginMethod
    public void setColor(PluginCall call) {
        String colorHex = call.getString("color", "#f5f6f8");
        Boolean darkIcons = call.getBoolean("darkIcons", true);

        getActivity().runOnUiThread(() -> {
            try {
                Window window = getActivity().getWindow();

                // 确保可以设置状态栏颜色
                window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
                window.setStatusBarColor(Color.parseColor(colorHex));

                // 设置状态栏图标明暗
                View decorView = window.getDecorView();
                int flags = decorView.getSystemUiVisibility();

                if (darkIcons) {
                    // 浅色背景 + 深色图标
                    flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                } else {
                    // 深色背景 + 浅色图标
                    flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                }
                decorView.setSystemUiVisibility(flags);

                JSObject result = new JSObject();
                result.put("success", true);
                call.resolve(result);
            } catch (Exception e) {
                JSObject result = new JSObject();
                result.put("success", false);
                result.put("error", e.getMessage());
                call.resolve(result);
            }
        });
    }

    @PluginMethod
    public void setBackgroundColor(PluginCall call) {
        setColor(call);
    }
}
