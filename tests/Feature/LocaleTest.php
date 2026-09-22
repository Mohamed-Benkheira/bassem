<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('user can switch locale to english via post route', function () {
    $response = $this->from('/')->post(route('locale.update'), [
        'locale' => 'en',
    ]);

    $response->assertRedirect('/');
    $response->assertSessionHas('locale', 'en');
});

test('user can switch locale to french via post route', function () {
    $response = $this->withSession(['locale' => 'en'])
        ->from('/')
        ->post(route('locale.update'), [
            'locale' => 'fr',
        ]);

    $response->assertRedirect('/');
    $response->assertSessionHas('locale', 'fr');
});

test('invalid locale is ignored', function () {
    $response = $this->withSession(['locale' => 'fr'])
        ->from('/')
        ->post(route('locale.update'), [
            'locale' => 'es',
        ]);

    $response->assertRedirect('/');
    $this->assertEquals('fr', session('locale'));
});

test('user can switch locale via get route', function () {
    $response = $this->from('/')->get(route('locale.switch', ['locale' => 'en']));

    $response->assertRedirect('/');
    $response->assertSessionHas('locale', 'en');
});

test('inertia receives current locale in shared props', function () {
    $response = $this->withSession(['locale' => 'en'])->get('/');

    $response->assertInertia(fn (Assert $page) => $page
        ->component('welcome')
        ->where('locale', 'en')
    );
});
