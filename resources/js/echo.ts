import { configureEcho } from '@laravel/echo-react';

const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY as string | undefined;

configureEcho(
    pusherKey
        ? {
              broadcaster: 'pusher',
              key: pusherKey,
              cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
              forceTLS:
                  (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
              wsHost: import.meta.env.VITE_PUSHER_HOST || undefined,
              wsPort: Number(import.meta.env.VITE_PUSHER_PORT ?? 80),
              wssPort: Number(import.meta.env.VITE_PUSHER_PORT ?? 443),
              enabledTransports: ['ws', 'wss'],
          }
        : {
              broadcaster: 'null',
          },
);
