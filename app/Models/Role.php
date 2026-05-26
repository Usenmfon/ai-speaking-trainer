<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
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
