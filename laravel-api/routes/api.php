<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::apiResource('people', \App\Http\Controllers\PersonController::class);
