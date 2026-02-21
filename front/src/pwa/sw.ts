/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */
import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

type ServiceWorkerWithManifest = ServiceWorkerGlobalScope & {
    __WB_MANIFEST: unknown[];
};

// const sw = self as unknown as ServiceWorkerWithManifest;
declare let self: ServiceWorkerGlobalScope
cleanupOutdatedCaches();

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST || [])

self.addEventListener("push", (event: PushEvent) => {
    const data = event.data?.json() ?? {};
    const title = data.title || "Rappel EquiLife";
    const options: NotificationOptions = {
        body: data.body || "Rappel à traiter",
        tag: data.tag,
        data: data.data,
        icon: "/logo.png",
        badge: "/logo.png",
    };

    const notificationPromise = self.registration.showNotification(title, options);

    // ENVOYER L'INFO À L'APP (si elle est ouverte quelque part)
    const messagePromise = self.clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((client) => {
            client.postMessage({
                type: "PUSH_RECEIVED",
                reminder: data.data 
            });
        });
    });

    event.waitUntil(Promise.all([notificationPromise, messagePromise]));
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
    event.notification.close();
    
    // Récupérer l'ID du cheval depuis les données de la notif
    const horseId = event.notification.data.horse_id;
    const url = `/horses/${horseId}/dashboard`;

    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true })
            .then(async (clientsArr) => {
                // Si une fenêtre est déjà ouverte, on y va et on change l'URL
                for (const client of clientsArr) {
                    if ("navigate" in client) {
                        return client.navigate(url).then(c => c?.focus());
                    }
                }
                // Sinon on ouvre une nouvelle fenêtre
                return self.clients.openWindow(url);
            })
    );
});
