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

precacheAndRoute(sw.__WB_MANIFEST);

sw.addEventListener("push", (event: PushEvent) => {
    const data = event.data?.json() ?? {};
    const title = data.title || "Rappel EquiLife";
    const options: NotificationOptions = {
        body: data.body || "Rappel à traiter",
        tag: data.tag,
        data: data.data,
        icon: "/logo.svg",
        badge: "/logo.svg",
    };

    const notificationPromise = sw.registration.showNotification(title, options);

    // ENVOYER L'INFO À L'APP (si elle est ouverte quelque part)
    const messagePromise = sw.clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((client) => {
            client.postMessage({
                type: "PUSH_RECEIVED",
                reminder: data.data 
            });
        });
    });

    event.waitUntil(Promise.all([notificationPromise, messagePromise]));
});

sw.addEventListener("notificationclick", (event: NotificationEvent) => {
    event.notification.close();
    
    // Récupérer l'ID du cheval depuis les données de la notif
    const horseId = event.notification.data.horse_id;
    const url = `/horses/${horseId}/dashboard`;

    event.waitUntil(
        sw.clients.matchAll({ type: "window", includeUncontrolled: true })
            .then(async (clientsArr) => {
                // Si une fenêtre est déjà ouverte, on y va et on change l'URL
                for (const client of clientsArr) {
                    if ("navigate" in client) {
                        return client.navigate(url).then(c => c?.focus());
                    }
                }
                // Sinon on ouvre une nouvelle fenêtre
                return sw.clients.openWindow(url);
            })
    );
});
