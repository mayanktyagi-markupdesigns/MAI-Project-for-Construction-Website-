<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Mail;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'otp',
        'otp_expires_at',
        'google_access_token', 'google_refresh_token', 'google_token_expires_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function sendForgotPasswordOtp()
    {
        $otp = rand(1000, 9999);
        $this->otp = $otp;
        // $this->otp_expires_at = now()->addMinutes(10);
        $this->otp_expires_at = now()->addMinutes(15);
        $this->save();

        // Send email
        Mail::to($this->email)->send(new \App\Mail\ForgotPasswordOtp($otp));

        return $otp; 
    }
    
    public function projects()
    {
        return $this->hasMany(Project::class);
    }
}
