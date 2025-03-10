if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(() => console.log('Service Worker зарегистрирован!'))
        .catch(err => console.log('SW регистрация не вышла:', err));
    });
  }