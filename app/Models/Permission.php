<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission as SpatiePermission;

class Permission extends SpatiePermission
{
    use HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * Generate a UUIDv7 primary key.
     */
    public function newUniqueId(): string
    {
        return (string) Str::uuid7();
    }
}
