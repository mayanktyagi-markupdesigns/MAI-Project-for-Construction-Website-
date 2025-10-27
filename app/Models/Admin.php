<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Mail;

class Admin extends Authenticatable
{
    protected $guard = 'admin';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'email',
        'password',
        'last_login',
        'email_verified_at',
        'otp',
        'otp_expires_at',
        'remember_token',
        'name',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login' => 'datetime',
    ];
    
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
}
