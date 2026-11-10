import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { createClient } from '@supabase/supabase-js';

window.supabase = { createClient };

if (Capacitor.isNativePlatform()) {
  window.TJSDATES_NATIVE = Object.freeze({
    publicOrigin: 'https://tjsdates.vercel.app',
    getCurrentPosition(success, failure, options) {
      Geolocation.getCurrentPosition(options).then(success, failure);
    },
  });

  if (Capacitor.getPlatform() === 'android') {
    App.addListener('backButton', ({ canGoBack }) => {
      const profileOptions = document.getElementById('tjsProfileSheet');
      if (profileOptions) {
        profileOptions.remove();
        return;
      }
      if (document.querySelector('#modal:not(.hidden)')) {
        window.closeModal();
        return;
      }
      const page = document.querySelector('#app:not(.hidden) main.content > section:not(.hidden)');
      if (page && page.id !== 'page-discover') {
        window.go('discover');
        return;
      }
      if (document.querySelector('#auth:not(.hidden)')) {
        window.showLanding();
        return;
      }
      if (canGoBack) window.history.back();
      else App.minimizeApp();
    });
  }
}
