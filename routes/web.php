<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Inertia\Inertia;


Route::get('/', function(){
    return Inertia::render('guest');
})->middleware('guest')->name('guest.home');

Route::get('/home', function(){
    return Inertia::render('home');
})->middleware(['auth', 'verified']);