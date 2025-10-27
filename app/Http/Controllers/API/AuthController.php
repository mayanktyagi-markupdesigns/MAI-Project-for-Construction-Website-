<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try{
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|confirmed|min:6',
                // Optional onboarding fields (as per FRD 3.1.3)
                'years_in_industry' => 'nullable',
                'project_types' => 'nullable|string', // e.g., 'Construction,Engineering'
                'task_wish' => 'nullable|string',
                'work_preference' => 'nullable',
                'voice_enabled' => 'nullable',
                'communication_style' => 'nullable',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'years_in_industry' => $request->years_in_industry,
                'project_types' => $request->project_types,
                'task_wish' => $request->task_wish,
                'work_preference' => $request->work_preference,
                'voice_enabled' => $request->voice_enabled ?? false,
                'communication_style' => $request->communication_style,
                'email_verified_at' => date('Y-m-d H:i:s'),
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'User registered successfully. Complete onboarding if needed.',
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ], 201);
        }catch(\Exception $e){
            return response()->json(['success' => false, 'message' => $e->getMessage()]);
        }
        
    }

    /**
     * Login user and return token.
     */
    public function login(Request $request)
    {
        try{
            $validator = Validator::make($request->all(), [
                'email' => 'required|string|email',
                'password' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            if (!Auth::attempt($request->only('email', 'password'))) {
                return response()->json(['message' => 'Invalid login credentials'], 401);
            }

            $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;
            
            // Retrieve the token instance to get creation time
            $tokenInstance = PersonalAccessToken::findToken($token);
            $createdAt = $tokenInstance->created_at;

            // Get expiration time from Sanctum config (in minutes)
            $expirationMinutes = config('sanctum.expiration');
            $expiresAt = $expirationMinutes
                ? $createdAt->copy()->addMinutes($expirationMinutes)
                : null;

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
                'created_at' => $createdAt->toIso8601String(), // ISO 8601 format
                'expires_at' => $expiresAt ? $expiresAt->toIso8601String() : null,
            ]);
        }catch(\Exception $e){
            return response()->json(['success' => false, 'message' => $e->getMessage()]);
        }
        
    }

    /**
     * Send password reset link.
     */
    // public function forgotPassword(Request $request)
    // {
    //     try{
    //         $validator = Validator::make($request->all(), [
    //             'email' => 'required|email',
    //         ]);

    //         if ($validator->fails()) {
    //             return response()->json(['errors' => $validator->errors()], 422);
    //         }

    //         $status = Password::sendResetLink(
    //             $request->only('email')
    //         );

    //         return response()->json([
    //             'message' => __($status),
    //         ], $status === Password::RESET_LINK_SENT ? 200 : 400);
    //     }catch(\Exception $e){
    //         return response()->json(['success' => false, 'message' => $e->getMessage()]);
    //     }

        
    // }

    public function forgotPassword(Request $request)
    {
        try{
            $request->validate([
                'email' => 'required|email',
                'is_email_verify' => 'nullable',
            ]);

            if($request->is_email_verify){
                $otp = rand(1000, 9999);
                Cache::put('email_verification_'.$request->email, $otp, now()->addMinutes(15));
                Mail::to($request->email)->send(new \App\Mail\EmailVerification($otp));
                return response()->json(['success' => true, 'message' => __('auth.verification-email-sent')]);
            }
    
            $user = User::where('email', $request->email)->first();
    
            if ($user) {
                $otp = $user->sendForgotPasswordOtp();
            }

            return response()->json(['success' => true, 'message' => __('auth.forgot-success'), 'otp' => $otp ?? null]);

        }catch(\Exception $e){
            return response()->json(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function changePassword(Request $request){
        try {
            $request->validate([
                'old_password' => 'required',
                'password' => 'required|confirmed|min:6',
            ]);

            $client = $request->user();

            if (!$client) {
                return response()->json(['success' => false, 'message' => 'Account not found'], 404);
            }

            if (!Hash::check($request->old_password, $client->password)) {
                return response()->json(['success' => false, 'message' => 'Authentication failed! Please try again.']);
            }

            // Update the password
            $client->password = Hash::make($request->password);
            $client->save();

            return response()->json(['success' => true, 'message' => 'Password reset successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    // Reset Password
    public function resetPassword(Request $request)
    {
        try{
            $request->validate([
                'email' => 'required|email',
                'password' => 'required|confirmed|min:6',
                // 'otp' => 'required',
            ]);
    
            $customer = User::where('email', $request->email)->first();
    
            if (!$customer) {
                return response()->json(['error' => __('auth.invalid_credentials')]);
            }
    
            if (!$customer->otp || now()->gt($customer->otp_expires_at)) {
                return response()->json(['error' => __('auth.invalid_or_expired_otp')]);
            }
    
            // Update the password
            $customer->password = Hash::make($request->password);
            $customer->otp = null; // Clear OTP after reset
            $customer->otp_expires_at = null; // Clear OTP expiration
            $customer->save();
    
            return response()->json(['success' => true, 'message' => 'Password reset successfully.']);
        }catch(\Exception $e){
            return response()->json(['success' => false, 'message' => $e->getMessage()]);
        }
        
    }

    public function verifyEmailOtp(Request $request)
    {
        try{
            $request->validate([
                'email' => 'required|email',
                'otp'   => 'required|digits:4',
                'is_reset' => 'nullable', // Optional, to handle reset flow
            ]);
            
            if(!$request->is_reset){
                $cachedOtp = Cache::get('email_verification_'.$request->email);
                if (!$cachedOtp || $cachedOtp != $request->otp) {
                    return response()->json(['success' => false, 'message' => __('auth.invalid_or_expired_otp')]);
                }
                Cache::forget('email_verification_'.$request->email);

                return response()->json(['success' => true, 'message' => __('auth.email_verified_success')]);
            }

            $customer = User::where('email', $request->email)->first();

            if (!$customer) {
                return response()->json(['success' => false, 'message' => __('auth.invalid_credentials')]);
            }

            if ($customer->otp !== $request->otp || now()->gt($customer->otp_expires_at)) {
                return response()->json(['success' => false, 'message' => __('auth.invalid_or_expired_otp')]);
            }

            if ($request->is_reset) {

                return response()->json(['success' => true, 'message' => __('auth.email_verified_success')]);

            }else{
                $customer->email_verified_at = now();
                $customer->otp = null;
                $customer->otp_expires_at = null;
                $customer->status = 'active';
                $customer->save();
            }
            

            return response()->json(['success' => true, 'message' => __('auth.email_verified_success')]);
        }
        catch(\Exception $e){
            return response()->json(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    /**
     * Get current authenticated user (me).
     */
    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json(['success'=> true, 'user' => $user]);
    }
}
