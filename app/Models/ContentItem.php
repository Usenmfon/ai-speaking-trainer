<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'page',
    'section',
    'item_key',
    'title',
    'description',
    'value',
    'metadata',
    'sort_order',
    'is_active',
])]
class ContentItem extends Model
{
    use HasUuids;

    /**
     * Scope active content.
     *
     * @param  Builder<ContentItem>  $query
     * @return Builder<ContentItem>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope ordered content.
     *
     * @param  Builder<ContentItem>  $query
     * @return Builder<ContentItem>
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('title');
    }

    /**
     * Get a serializable content payload for Inertia.
     *
     * @return array<string, mixed>
     */
    public function toContentArray(): array
    {
        return [
            'key' => $this->item_key,
            'title' => $this->title,
            'description' => $this->description,
            'value' => $this->value,
            ...($this->metadata ?? []),
        ];
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
