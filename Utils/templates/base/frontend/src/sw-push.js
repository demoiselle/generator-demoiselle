'use strict';

self.addEventListener('push', function(event) {
    console.log('Received a push message', event);

    if (!event.data) {
      return;
    }

    var message = event.data.json();

    var title = 'Título!';
    var body = 'Conteudo da notificação';
    var icon = 'assets/logo-symbol.png';

    var data = {
      message: message
    };

    event.waitUntil(
      self.registration.showNotification(title, {
        body: body,
        icon: icon,
        // tag: tag,
        data: data
      })
    );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  var clickResponsePromise = Promise.resolve();

  // do what you want with event.notification.data

  event.waitUntil(clickResponsePromise);
});
