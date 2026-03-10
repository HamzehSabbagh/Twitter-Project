<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'unique:users,username' ,'max:30'],
            'picture' => ['nullable', 'image', 'mimes:webp,jpeg,jpg,png', 'max:2048'],
            'cover' => ['nullable', 'image', 'mimes:webp,jpeg,jpg,png', 'max:4096'],
            'email' => ['required', 'email', 'unique:users,email', 'max:255', 'string'],
            'birth_date' => ['required', 'date', 'before_or_equal:' .now()->subYears(18)->toDateString()],
            'location' => ['nullable', 'string', 'max:100'],
            'bio' => ['nullable', 'string', 'max:160'],
            'password' => $this->passwordRules(),
        ])->validate();

        $picture = null;
        $cover = null;
        $pictureMime = null;
        $coverMime = null;

        if (request()->hasFile('picture')){
            $file = request()->file('picture');
            $picture = file_get_contents($file->getRealPath());
            $pictureMime = $file->getMimeType();
        }

        if (request()->hasFile('cover')){
            $file = request()->file('cover');
            $cover = file_get_contents($file->getRealPath());
            $coverMime = $file->getMimeType();
        }

        $defaultRole = Role::query()->firstOrCreate(
            ['name' => 'user'],
        );


        return User::create([
            'first_name' => $input['first_name'],
            'last_name' => $input['last_name'],
            'username' => $input['username'],
            'email' => $input['email'],
            'password' => $input['password'],
            'role_id' => $defaultRole->id,
            'picture' => $picture,
            'picture_mime' => $pictureMime,
            'cover' => $cover,
            'cover_mime' => $coverMime,
            'location' => $input['location'] ?? null,
            'bio' => $input['bio'] ?? null,
            'birth_date' => $input['birth_date']
        ]);
    }
}
