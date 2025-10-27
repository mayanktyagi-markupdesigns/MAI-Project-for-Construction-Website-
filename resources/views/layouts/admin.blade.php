<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MAi Admin Panel - @yield('title')</title>
    <script src="https://cdn.tailwindcss.com"></script>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"> 
    
    
    

    <!-- Summernote CSS -->
    <link href="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-lite.min.css" rel="stylesheet">
    
    <style>
        /* Gradient background with subtle texture */
        body {
            background: linear-gradient(135deg, #f0f2f5 0%, #e0e7ff 100%);
            min-height: 100vh;
            overflow-x: hidden;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* Sidebar with dynamic gradient and shadow */
        #sidebar {
            background: linear-gradient(180deg, #2a2f4a 0%, #1e2a44 100%);
            box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease, width 0.3s ease;
            height: 100vh;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 35;
            color: #ffffff;
            width: 16rem;
        }

        /* Sidebar navigation links with icons */
        .sidebar-nav a {
            display: flex;
            align-items: center;
            padding: 0.75rem 1.25rem;
            color: #d1d5db;
            transition: all 0.3s ease;
        }

        .sidebar-nav a:hover,
        .sidebar-nav a.active {
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
            transform: translateX(5px);
        }

        .sidebar-nav a svg {
            margin-right: 0.75rem;
            width: 1.25rem;
            height: 1.25rem;
        }

        /* Animated hamburger menu */
        #menu-toggle {
            transition: transform 0.3s ease;
        }

        #menu-toggle.active .bar:nth-child(2) {
            opacity: 0;
        }

        #menu-toggle.active .bar:nth-child(1) {
            transform: translateY(8px) rotate(45deg);
        }

        #menu-toggle.active .bar:nth-child(3) {
            transform: translateY(-8px) rotate(-45deg);
        }

        @media (max-width: 768px) {
            #sidebar {
                transform: translateX(-100%);
                width: 15rem;
            }
            #sidebar.open {
                transform: translateX(0);
            }
            .main-content {
                margin-top: 11% !important;
                margin-left: 0 !important;
                margin-left: 0;
                padding-top: 5rem; /* Increased to account for header */
            }
            .brand-text{
                display: none;
            }
        }

        .main-content {
            margin-top: 4%;
            margin-left: 16rem;
            padding: 5rem 1.5rem 2rem 1.5rem; /* Adjusted padding-top to clear header */
            transition: margin-left 0.3s ease;
            min-height: calc(100vh - 4rem);
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(8px);
            border-radius: 0.75rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        /* Gradient header with shadow */
        header {
            background: linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            position: fixed;
            width: 100%;
            z-index: 40;
            top: 0;
            height: 4rem;
        }

        header .logo {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(45deg, #60a5fa, #93c5fd);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .user-info img {
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            object-fit: cover;
        }
        
        
    </style>
    
    <!-- jQuery CDN -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Summernote JS -->
    <script src="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-lite.min.js"></script>
    
</head>
<body class="flex flex-col min-h-screen">
    <!-- Header -->
    <header class="flex items-center justify-between px-6">
        <div class="flex items-center">
            <button id="menu-toggle" class="md:hidden p-2 text-white focus:outline-none">
                <span class="bar w-6 h-0.5 bg-white block mb-1"></span>
                <span class="bar w-6 h-0.5 bg-white block mb-1"></span>
                <span class="bar w-6 h-0.5 bg-white block"></span>
            </button>
            <img src="{{config('app.url')}}/logo.png" style="width:40px" />
            <h1 class="logo ml-4 text-xl brand-text">MAi Admin</h1>
        </div>
        <div class="user-info">
            <span class="text-white">{{ Auth::guard('admin')->user()->email ?? 'Admin User' }}</span>
            <a href="{{ route('admin.logout') }}" class="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full transition-colors">Logout</a>
        </div>
    </header>

    <!-- Sidebar -->
    <aside id="sidebar" class="text-white fixed h-full pt-16">
        <nav class="sidebar-nav mt-6 space-y-1">
            <a href="{{ route('admin.dashboard') }}" class="{{ Request::is('admin/dashboard') ? 'active' : '' }}">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7m-7 7l-2 2m0 0l-7 7 7-7"/>
                </svg>
                Dashboard
            </a>
            <a href="{{ route('admin.users') }}" class="{{ Request::is('admin/users') ? 'active' : '' }}">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z"/>
                </svg>
                Users
            </a>
            <a href="{{ route('admin.projects') }}" class="{{ Request::is('admin/projects') ? 'active' : '' }}">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                Projects
            </a>
            <a href="{{ route('admin.document-logs') }}" class="{{ Request::is('admin/logs/documents') ? 'active' : '' }}">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Document Logs
            </a>
            <a href="{{ route('admin.ai-summary') }}" class="{{ Request::is('admin/ai-summary') ? 'active' : '' }}">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.749 3.749 0 0012 17.755a3.749 3.749 0 10-2.625-1.045l-.548-.547z"/>
                </svg>
                AI Summary
            </a>
            <a href="{{ route('admin.early-access.index') }}" class="{{ Request::is('admin/early-access.*') ? 'active' : '' }}">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.749 3.749 0 0012 17.755a3.749 3.749 0 10-2.625-1.045l-.548-.547z"/>
                </svg>
                Early Access Requests
            </a>
            <a href="{{ route('admin.contact-us.index') }}" class="{{ Request::is('admin/contact-us.*') ? 'active' : '' }}">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.749 3.749 0 0012 17.755a3.749 3.749 0 10-2.625-1.045l-.548-.547z"/>
                </svg>
                Contact Us Messages
            </a>
        
            <a href="{{ route('admin.about-content.index') }}" class="{{ Request::is('admin/about-content*') ? 'active' : '' }}">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3h4M9 7h1"/>
                </svg>
                About Content
            </a>
            <a href="{{ route('admin.blogs.index') }}" class="{{ Request::is('admin/blogs*') ? 'active' : '' }}">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3h4M9 7h1"/>
                </svg>
                Blogs
            </a>
            <a href="{{ route('admin.settings') }}" class="{{ Request::is('admin/settings') ? 'active' : '' }}">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Settings
            </a>
        </nav>
    </aside>

    <!-- Main Content -->
    <main class="main-content flex-1 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6" >
        @yield('content')
    </main>

   {{-- @stack('modals') --}}
    
    <script>
    
        document.getElementById('menu-toggle').addEventListener('click', function() {
            this.classList.toggle('active');
            document.getElementById('sidebar').classList.toggle('open');
            const main = document.querySelector('.main-content');
            if (document.getElementById('sidebar').classList.contains('open')) {
                main.style.marginLeft = '15rem';
            } else {
                main.style.marginLeft = '0';
            }
        });

        // Highlight active link
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            if (link.classList.contains('active')) {
                link.style.background = 'rgba(255, 255, 255, 0.15)';
            }
        });
    </script>
</body>
</html>