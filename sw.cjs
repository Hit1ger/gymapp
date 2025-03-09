// sw.js
const CACHE_NAME = 'my-gym-cache-v1';

// Перечисляем все файлы, которые хотим кэшировать для офлайн-режима
const urlsToCache = [
  './',                 // корневой путь (если сайт открывается без index.html в конце)
  './index.html',
  './workout-list.html',
  './analytics.html',
  './base.html',
  './current-workout.html',
  './files.html',
  './style.css',
  './exercises.json',
  './training.json',
  './manifest.json',
  './sw.js'            // можно включать, но это не обязательно
];

// ====== Событие установки (install) ======
self.addEventListener('install', event => {
  // Ждём, пока откроется нужный кэш и добавим в него файлы
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// ====== Событие запроса (fetch) ======
self.addEventListener('fetch', event => {
  event.respondWith(
    // Сначала проверяем, есть ли нужный ресурс в кеше
    caches.match(event.request)
      .then(response => {
        if (response) {
          // Если в кеше есть готовый ответ, отдаем его
          return response;
        }
        // Иначе загружаем из сети
        return fetch(event.request);
      })
  );
});
