<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Person extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'birth_date',
        'cin_series',
        'cin_number',
        'id_issue_date',
        'id_expiry_date',
        'address',
        'city',
        'county',
        'national_id',
        'email',
        'phone',
        'id_photo_path',
        'notes',
    ];
}
