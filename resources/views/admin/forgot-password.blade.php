@extends('layouts.auth')

@section('title', 'Forgot Password')

@section('content')
<div class="login-form bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <img src="/mai-beta/logo.png" style="margin-left: auto;margin-right: auto;">
    <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Forgot Password</h2>
    @if ($errors->any())
        <div class="text-red-500 mb-4 text-center">
            {{ $errors->first() }}
        </div>
    @endif
    <form method="POST" action="{{ route('admin.forgot-password') }}">
        @csrf
        <div class="space-y-4">
            <div>
                <label class="block text-gray-700">Email</label>
                <input type="email" name="email" value="{{ old('email') }}" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500" required>
            </div>

            <div class="hidden otpdiv">
                <label class="block text-gray-700">OTP</label>
                <input type="text" name="otp" value="" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500">

            </div>

            <div class="hidden passworddiv">
                <div>
                    <label class="block text-gray-700">New Password</label>
                    <input type="password" name="new_password" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500">
                </div>
                <div>
                    <label class="block text-gray-700">Confirm New Password</label>
                    <input type="password" name="new_password_confirmation" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500">
                </div>
            </div>
            
            
            <button type="button" class="w-full bg-teal-500 text-white py-2 rounded hover:bg-teal-600 animate-pulse sendOtpBtn">Send OTP</button>
            <button type="button" class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 otpdiv verifyOtpBtn" style="display:none;">Verify OTP</button>
            <button type="button" onclick="window.location='{{ route('admin.login') }}'" class="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600">Back to Login</button>
        </div>
    </form>
</div>
@endsection
@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function () {
        const emailInput = document.querySelector('input[name="email"]');
        if (emailInput) {
            emailInput.focus();
        }

        const sendOtpBtn = document.querySelector('.sendOtpBtn');
        const verifyOtpBtn = document.querySelector('.verifyOtpBtn');
        const otpDiv = document.querySelector('.otpdiv');
        const passwordDiv = document.querySelector('.passworddiv');
        const otpInput = document.querySelector('input[name="otp"]');
        let otpSent = false;
        let otpVerified = false;
        let email = '';
        sendOtpBtn.addEventListener('click', function () {
            if (!otpSent) {
                email = emailInput.value;
                if (!email) {
                    alert('Please enter your email.');
                    return;
                }
                fetch('{{ route('admin.forgot-password') }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}'
                    },
                    body: JSON.stringify({ email: email })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        otpSent = true;
                        otpDiv.style.display = 'block';
                        verifyOtpBtn.style.display = 'block';
                        sendOtpBtn.style.display = 'none';
                        alert('OTP sent to your email.');
                    } else {
                        alert(data.message || 'Error sending OTP.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred. Please try again.');
                });
            }
        });

        verifyOtpBtn.addEventListener('click', function () {
            if (otpSent && !otpVerified) {
                const otp = otpInput.value;
                if (!otp) {
                    alert('Please enter the OTP.');
                    return;
                }
                fetch('{{ route('admin.verify-email') }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}'
                    },
                    body: JSON.stringify({ email: email, otp: otp })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        otpVerified = true;
                        passwordDiv.style.display = 'block';
                        verifyOtpBtn.textContent = 'Reset Password';
                        alert('OTP verified. You can now reset your password.');
                    } else {
                        alert(data.message || 'Invalid OTP.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred. Please try again.');
                });
            } else if (otpVerified) {
                const newPassword = document.querySelector('input[name="new_password"]').value;
                const confirmNewPassword = document.querySelector('input[name="new_password_confirmation"]').value;
                if (!newPassword || !confirmNewPassword) {
                    alert('Please enter and confirm your new password.');
                    return;
                }
                if (newPassword !== confirmNewPassword) {
                    alert('Passwords do not match.');
                    return;
                }
                fetch('{{ route('admin.reset-password') }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}'
                    },
                    body: JSON.stringify({ email: email, otp: otpInput.value, new_password: newPassword, new_password_confirmation: confirmNewPassword, is_reset: true })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Password reset successful. You can now log in with your new password.');
                        window.location.href = '{{ route('admin.login') }}';
                    } else {
                        alert(data.message || 'Error resetting password.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred. Please try again.');
                });
            }
        });

    });
</script>
@endpush