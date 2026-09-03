<?php

namespace App\Models;

use Laravel\Sanctum\PersonalAccessToken as SanctumToken;
use MongoDB\Laravel\Eloquent\DocumentModel;

// Sanctum'un kendi token modeli SQL icin yazilmis. MongoDB'de calismasi
// icin belge modeline ceviriyoruz (AppServiceProvider icinde tanitiliyor).
class PersonalAccessToken extends SanctumToken
{
    use DocumentModel;

    protected $connection = 'mongodb';
    protected $collection = 'personal_access_tokens';
    protected $primaryKey = '_id';
    protected $keyType = 'string';
}
