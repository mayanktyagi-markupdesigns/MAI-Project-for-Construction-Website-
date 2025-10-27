<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MAi Admin Panel - @yield('title')</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            overflow-x: hidden;
            position: relative;
        }

        body::before {
            content: '';
            position: absolute;
            width: 300px;
            height: 300px;
            background: rgba(13, 148, 136, 0.1);
            border-radius: 50%;
            animation: float 15s infinite ease-in-out;
            top: -150px;
            left: -150px;
            z-index: -1;
        }

        body::after {
            content: '';
            position: absolute;
            width: 200px;
            height: 200px;
            background: rgba(6, 78, 59, 0.1);
            border-radius: 50%;
            animation: float 20s infinite ease-in-out reverse;
            bottom: -100px;
            right: -100px;
            z-index: -1;
        }

        .wave {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100px;
            background: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"%3E%3Cpath fill="%230D9488" fill-opacity="0.1" d="M0,128L48,138.7C96,149,192,171,288,170.7C384,171,480,149,576,133.3C672,117,768,107,864,106.7C960,107,1056,117,1152,128C1248,139,1344,149,1392,154.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"%3E%3C/path%3E%3C/svg%3E');
            background-size: cover;
            animation: wave 7s infinite linear;
            z-index: -1;
        }

        @keyframes float {
            0% { transform: translate(0, 0); }
            50% { transform: translate(20px, 20px); }
            100% { transform: translate(0, 0); }
        }

        @keyframes wave {
            0% { transform: translateX(0); }
            100% { transform: translateX(100%); }
        }

        .login-form {
            animation: fadeIn 1s ease-in;
        }

        @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body class="bg-gray-200 flex items-center justify-center min-h-screen relative">
    <div class="wave"></div>
    @yield('content')
    
    @stack('scripts')
</body>
</html>