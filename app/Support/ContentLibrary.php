<?php

namespace App\Support;

use App\Models\ContentItem;
use Illuminate\Support\Collection;

class ContentLibrary
{
    /**
     * Get active content rows for a page section.
     *
     * @return Collection<int, ContentItem>
     */
    public function section(string $page, string $section): Collection
    {
        return ContentItem::query()
            ->active()
            ->where('page', $page)
            ->where('section', $section)
            ->ordered()
            ->get();
    }

    /**
     * Get active content rows as plain arrays.
     *
     * @return array<int, array<string, mixed>>
     */
    public function list(string $page, string $section): array
    {
        return $this->section($page, $section)
            ->map(fn (ContentItem $item): array => $item->toContentArray())
            ->values()
            ->all();
    }

    /**
     * Get a single active content row.
     *
     * @return array<string, mixed>|null
     */
    public function item(string $page, string $section, string $key): ?array
    {
        $item = ContentItem::query()
            ->active()
            ->where('page', $page)
            ->where('section', $section)
            ->where('item_key', $key)
            ->first();

        return $item?->toContentArray();
    }
}
