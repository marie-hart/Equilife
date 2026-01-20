/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */
import { clientsClaim } from "workbox-core";
import { precacheAndRoute } from "workbox-precaching";

type ServiceWorkerWithManifest = ServiceWorkerGlobalScope & {
  __WB_MANIFEST: unknown[];
};

const sw = self as unknown as ServiceWorkerWithManifest;

// Take control immediately on update to avoid stale app shells.
sw.skipWaiting();
clientsClaim();

// Workbox inject manifest placeholder.
// eslint-disable-next-line no-underscore-dangle
precacheAndRoute(sw.__WB_MANIFEST);

sw.addEventListener("push", (event: PushEvent) => {
  const data = event.data?.json() ?? {};
  const title = data.title || "Rappel";
  const options: NotificationOptions = {
    body: data.body || "Rappel à traiter",
    tag: data.tag,
    data: data.data,
    icon: "/pwa-icon.svg",
    badge: "/pwa-icon.svg",
  };

  event.waitUntil(sw.registration.showNotification(title, options));
});

sw.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  const url = "/";

  event.waitUntil(
    sw.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      const existing = clientsArr.find((client) => client.url.includes(url));
      if (existing && "focus" in existing) return existing.focus();
      return sw.clients.openWindow(url);
    })
  );
});
