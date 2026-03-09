
// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Прелоадер
    const preloader = document.querySelector('.preloader');
    
    setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }, 2000);

    // Элементы навигации
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.querySelector('.navbar');
    const body = document.body;

    // Переменные для плеера
    let currentSong = 0;
    let isPlaying = false;
    let progressInterval;
    
    // Данные песен
    const songs = [
        {
            title: 'Лесник',
            album: 'Камнем по голове (1996)',
            duration: '3:42',
            lyrics: 'Много лет назад у леса в чаще...'
        },
        {
            title: 'Кукла колдуна',
            album: 'Акустический альбом (1999)',
            duration: '4:20',
            lyrics: 'Кукла колдуна, кукла колдуна...'
        },
        {
            title: 'Прыгну со скалы',
            album: 'Как в старой сказке (2000)',
            duration: '3:18',
            lyrics: 'Прыгну со скалы, прыгну со скалы...'
        },
        {
            title: 'Леший',
            album: 'Камнем по голове (1996)',
            duration: '2:55',
            lyrics: 'В чаще леса, где темно...'
        },
        {
            title: 'Дурак и молния',
            album: 'Жаль, нет ружья (2001)',
            duration: '4:12',
            lyrics: 'Дурак сидел на пне и ждал...'
        },
        {
            title: 'Мастер',
            album: 'Будь как дома, путник (2002)',
            duration: '4:45',
            lyrics: 'Мастер кукол сидел в мастерской...'
        },
        {
            title: 'Мёртвый анархист',
            album: 'Камнем по голове (1996)',
            duration: '3:08',
            lyrics: 'В могиле братской, под Москвой...'
        },
        {
            title: 'Ели мясо мужики',
            album: 'Жаль, нет ружья (2001)',
            duration: '3:55',
            lyrics: 'Ели мясо мужики, пивом запивали...'
        }
    ];

    // ИнициализацияЫ
    initAnimations();
    initPlayer();
    initSlider();
    
    // Мобильное меню
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }

    // Закрытие меню при клике на ссылку
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                smoothScroll(targetSection);
            }
            
            if (navMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // Функция переключения меню
    function toggleMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
    }

    // Плавный скролл
    function smoothScroll(target) {
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 1000;
        let start = null;

        function animation(currentTime) {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const progress = Math.min(timeElapsed / duration, 1);
            
            window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        requestAnimationFrame(animation);
    }

    // Эффект при скролле
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        updateActiveNavLink();
        checkVisibility();
    });

    // Обновление активной ссылки
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section');
        let current = '';
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    // Инициализация анимаций
    function initAnimations() {
        const animatedElements = document.querySelectorAll(
            '.member, .album-card, .song-card, .lyrics-card'
        );
        
        animatedElements.forEach(el => {
            el.classList.add('fade-in');
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(el => observer.observe(el));
    }

    function checkVisibility() {
        const fadeElements = document.querySelectorAll('.fade-in');
        fadeElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
            
            if (isVisible) {
                el.classList.add('visible');
            }
        });
    }

    // Инициализация плеера
    function initPlayer() {
        const playBtn = document.querySelector('.play');
        const prevBtn = document.querySelector('.prev');
        const nextBtn = document.querySelector('.next');
        const songCards = document.querySelectorAll('.song-card');
        const playButtons = document.querySelectorAll('.play-song');
        const progressBar = document.querySelector('.progress-bar-player');
        const progressFill = document.querySelector('.progress-fill');
        const currentTimeEl = document.querySelector('.current');
        const totalTimeEl = document.querySelector('.total');
        const songTitleEl = document.querySelector('.song-title');
        const songAlbumEl = document.querySelector('.song-album');

        // Устанавливаем общую длительность для первого трека
        totalTimeEl.textContent = songs[0].duration;

        // Обработчики для кнопок плеера
        if (playBtn) {
            playBtn.addEventListener('click', togglePlay);
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', prevSong);
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', nextSong);
        }

        // Обработчики для карточек песен
        songCards.forEach((card, index) => {
            card.addEventListener('click', () => {
                playSong(index);
            });
        });

        playButtons.forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                playSong(index);
            });
        });

        // Прогресс-бар
        if (progressBar) {
            progressBar.addEventListener('click', (e) => {
                const rect = progressBar.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                updateProgress(percent * 100);
            });
        }

        function togglePlay() {
            isPlaying = !isPlaying;
            playBtn.textContent = isPlaying ? '⏸️' : '▶️';
            
            if (isPlaying) {
                startProgress();
            } else {
                stopProgress();
            }
        }

        function startProgress() {
            let progress = 0;
            progressInterval = setInterval(() => {
                progress += 0.5;
                if (progress <= 100) {
                    updateProgress(progress);
                } else {
                    nextSong();
                }
            }, 1000);
        }

        function stopProgress() {
            clearInterval(progressInterval);
        }

        function updateProgress(percent) {
            progressFill.style.width = `${percent}%`;
            
            // Обновляем текущее время
            const totalSeconds = timeToSeconds(songs[currentSong].duration);
            const currentSeconds = Math.floor((percent / 100) * totalSeconds);
            currentTimeEl.textContent = secondsToTime(currentSeconds);
        }

        function playSong(index) {
            currentSong = index;
            songTitleEl.textContent = songs[index].title;
            songAlbumEl.textContent = songs[index].album;
            totalTimeEl.textContent = songs[index].duration;
            currentTimeEl.textContent = '0:00';
            progressFill.style.width = '0%';
            
            // Подсвечиваем активную песню
            songCards.forEach((card, i) => {
                if (i === index) {
                    card.style.background = 'rgba(139, 0, 0, 0.2)';
                    card.style.borderColor = 'var(--blood-red)';
                } else {
                    card.style.background = 'rgba(0, 0, 0, 0.3)';
                    card.style.borderColor = 'transparent';
                }
            });

            if (!isPlaying) {
                togglePlay();
            } else {
                stopProgress();
                startProgress();
            }

            // Показываем уведомление
            showNotification(`Сейчас играет: ${songs[index].title}`);
        }

        function prevSong() {
            currentSong = (currentSong - 1 + songs.length) % songs.length;
            playSong(currentSong);
        }

        function nextSong() {
            currentSong = (currentSong + 1) % songs.length;
            playSong(currentSong);
        }

        function timeToSeconds(time) {
            const [minutes, seconds] = time.split(':').map(Number);
            return minutes * 60 + seconds;
        }

        function secondsToTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
    }

    // Инициализация слайдера текстов
    function initSlider() {
        const lyricsCards = document.querySelectorAll('.lyrics-card');
        const dots = document.querySelectorAll('.dot');
        const prevBtn = document.querySelector('.slider-btn.prev');
        const nextBtn = document.querySelector('.slider-btn.next');
        let currentSlide = 0;

        function showSlide(index) {
            lyricsCards.forEach(card => card.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            lyricsCards[index].classList.add('active');
            dots[index].classList.add('active');
            currentSlide = index;
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % lyricsCards.length;
            showSlide(currentSlide);
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + lyricsCards.length) % lyricsCards.length;
            showSlide(currentSlide);
        }

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', prevSlide);
            nextBtn.addEventListener('click', nextSlide);
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => showSlide(index));
        });

        // Автоматическое перелистывание
        setInterval(nextSlide, 8000);
    }

    // Функция показа уведомлений
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--blood-red);
            color: var(--parchment);
            padding: 15px 25px;
            border-radius: 10px;
            font-size: 1rem;
            z-index: 9999;
            animation: slideIn 0.3s ease forwards;
            border: 1px solid var(--old-gold);
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Эффект свечи
    const candle = document.querySelector('.memory-candle');
    if (candle) {
        setInterval(() => {
            const flame = candle.querySelector('.candle-flame');
            if (flame) {
                flame.style.transform = `translateX(-50%) scale(${1 + Math.random() * 0.3})`;
            }
        }, 100);
    }

    // Добавляем CSS анимации
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }

        .fade-in {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .fade-in.visible {
            opacity: 1;
            transform: translateY(0);
        }

        .hamburger {
            display: none;
            cursor: pointer;
            z-index: 100;
        }

        .bar {
            display: block;
            width: 25px;
            height: 3px;
            margin: 5px 0;
            background: var(--parchment);
            transition: all 0.3s ease;
        }

        .hamburger.active .bar:nth-child(2) {
            opacity: 0;
        }

        .hamburger.active .bar:nth-child(1) {
            transform: translateY(8px) rotate(45deg);
        }

        .hamburger.active .bar:nth-child(3) {
            transform: translateY(-8px) rotate(-45deg);
        }
    `;

    document.head.appendChild(style);

    // Медиа-запросы для мобильного меню
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    function handleMobileChange(e) {
        if (e.matches) {
            document.querySelector('.hamburger').style.display = 'block';
        } else {
            document.querySelector('.hamburger').style.display = 'none';
            navMenu.classList.remove('active');
            body.style.overflow = 'auto';
        }
    }
    
    mediaQuery.addListener(handleMobileChange);
    handleMobileChange(mediaQuery);

    // Создание падающих листьев/черепов
    function createFallingElement() {
        const elements = ['🍂', '🕯️', '💀', '🦇'];
        const element = document.createElement('div');
        element.innerHTML = elements[Math.floor(Math.random() * elements.length)];
        element.style.cssText = `
            position: fixed;
            top: -20px;
            left: ${Math.random() * 100}vw;
            font-size: ${20 + Math.random() * 20}px;
            opacity: ${0.2 + Math.random() * 0.3};
            z-index: 1;
            pointer-events: none;
            animation: fall ${8 + Math.random() * 7}s linear forwards;
        `;
        
        document.body.appendChild(element);
        
        setTimeout(() => {
            element.remove();
        }, 15000);
    }

    // Запускаем падение элементов
    setInterval(createFallingElement, 2000);

    // Добавляем анимацию падения
    const fallStyle = document.createElement('style');
    fallStyle.textContent = `
        @keyframes fall {
            to {
                transform: translateY(100vh) rotate(360deg);
            }
        }
    `;
    document.head.appendChild(fallStyle);

    // Сохранение текущей песни в localStorage
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('lastSong', currentSong);
    });

    // Восстановление последней песни
    const lastSong = localStorage.getItem('lastSong');
    if (lastSong !== null) {
        currentSong = parseInt(lastSong);
        // Можно восстановить песню, но не включать автоматически
    }
});