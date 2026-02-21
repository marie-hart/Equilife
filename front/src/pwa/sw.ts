/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */
import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
self.skipWaiting();
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener("push", (event: PushEvent) => {
  const data = event.data?.json() ?? {};

  const title = data.title || "Notification EquiLife";

  const options: NotificationOptions = {
    body: data.body || "",
    tag: data.tag,
    data: data.data,
    icon: "/logo.png",
    badge: "/logo.png",
  };

  const notificationPromise =
    self.registration.showNotification(title, options);

  const messagePromise = self.clients
    .matchAll({ type: "window" })
    .then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: data.data?.product_id ? "STOCK_ALERT" : "REMINDER",
          payload: data.data,
        });
      });
    });

  event.waitUntil(Promise.all([notificationPromise, messagePromise]));
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();

  const data = event.notification.data;

  let url = "/";

  if (data?.product_id) {
    url = `/products/${data.product_id}`;
  } else if (data?.horse_id) {
    url = `/horses/${data.horse_id}/dashboard`;
  }

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(async (clientsArr) => {
        for (const client of clientsArr) {
          if ("navigate" in client) {
            return client.navigate(url).then((c) => c?.focus());
          }
        }
        return self.clients.openWindow(url);
      })
  );
});