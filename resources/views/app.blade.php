<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        @php
            $seo = config('seo');
            $indexableRoutes = $seo['indexable_routes'] ?? [];
            $isIndexable = collect($indexableRoutes)->contains(fn (string $route): bool => request()->routeIs($route));
            $seoTitle = $isIndexable ? $seo['title'] : config('app.name', 'Laravel');
            $seoDescription = $seo['description'];
            $canonicalUrl = url()->current();
            $seoImage = str_starts_with($seo['image'], 'http') ? $seo['image'] : url($seo['image']);
        @endphp

        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="{{ $seoDescription }}">
        <meta name="keywords" content="{{ implode(', ', $seo['keywords']) }}">
        <meta name="robots" content="{{ $isIndexable ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' : 'noindex, nofollow' }}">
        <link rel="canonical" href="{{ $canonicalUrl }}">

        <meta property="og:site_name" content="{{ $seo['site_name'] }}">
        <meta property="og:type" content="website">
        <meta property="og:title" content="{{ $seoTitle }}">
        <meta property="og:description" content="{{ $seoDescription }}">
        <meta property="og:url" content="{{ $canonicalUrl }}">
        <meta property="og:image" content="{{ $seoImage }}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $seoTitle }}">
        <meta name="twitter:description" content="{{ $seoDescription }}">
        <meta name="twitter:image" content="{{ $seoImage }}">

        @if ($isIndexable)
            <script type="application/ld+json">
                {!! json_encode([
                    chr(64).'context' => 'https://schema.org',
                    chr(64).'type' => 'SoftwareApplication',
                    'name' => $seo['site_name'],
                    'applicationCategory' => 'EducationalApplication',
                    'operatingSystem' => 'Web',
                    'url' => $canonicalUrl,
                    'description' => $seoDescription,
                    'offers' => [
                        chr(64).'type' => 'Offer',
                        'price' => '0',
                        'priceCurrency' => 'USD',
                    ],
                ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}
            </script>
        @endif

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        <link rel="manifest" href="/site.webmanifest">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ $seoTitle }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
