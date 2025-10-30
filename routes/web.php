<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// React App Route - serves the React SPA for all non-API routes
// This must be LAST because it catches all routes not matched above
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
