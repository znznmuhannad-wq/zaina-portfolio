/* =========================================================================
   Portfolio runtime behaviour, lifted VERBATIM out of legacy index.html.
   Carousels, lightbox modal, mute registry, dark-mode, plastic-art book,
   draggable hero card, reveal-on-scroll. Runs in global scope (classic
   script) so inline onclick handlers and cross-module globals work exactly
   as before. Loaded via next/script (afterInteractive).
   ========================================================================= */

        // Smart icon init — only process un-rendered icons
function initIcons(container) {
    const target = container || document;
    lucide.createIcons({ attrs: { class: ['lucide'] }, nameAttr: 'data-lucide' });
};

        // ── Al Ameed Cinema Drag-Scroll ───────────────────────────
        (function() {
            function initAmeedScroll() {
                const viewport = document.getElementById('ameedViewport');
                const track    = document.getElementById('ameedTrack');
                const progress = document.getElementById('ameedProgress');
                const hint     = document.querySelector('.ameed-scroll-hint');
                if (!viewport || !track) return;

                let isDragging = false, startX = 0, scrollLeft = 0, hintHidden = false;

                function getMaxScroll() { return track.scrollWidth - viewport.clientWidth; }
                function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }
                function updateProgress(x) {
                    const max = getMaxScroll();
                    if (max <= 0) return;
                    const pct = clamp((x / max) * 100, 0, 100);
                    progress.style.width = pct + '%';
                    if (!hintHidden && pct > 2) { hint.classList.add('hidden'); hintHidden = true; }
                }

                let currentX = 0, targetX = 0, rafId = null;
                function animate() {
                    currentX += (targetX - currentX) * 0.12;
                    if (Math.abs(targetX - currentX) < 0.3) currentX = targetX;
                    track.style.transform = 'translateX(' + (-currentX) + 'px)';
                    updateProgress(currentX);
                    rafId = Math.abs(targetX - currentX) > 0.2 ? requestAnimationFrame(animate) : null;
                }
                function setTarget(x) {
                    targetX = clamp(x, 0, getMaxScroll());
                    if (!rafId) rafId = requestAnimationFrame(animate);
                }

                viewport.addEventListener('mousedown', e => { isDragging = true; startX = e.pageX; scrollLeft = currentX; viewport.style.cursor = 'grabbing'; });
                window.addEventListener('mousemove',  e => { if (isDragging) setTarget(scrollLeft - (e.pageX - startX)); });
                window.addEventListener('mouseup',    () => { isDragging = false; viewport.style.cursor = 'grab'; });

                let tSX = 0, tSL = 0;
                viewport.addEventListener('touchstart', e => { tSX = e.changedTouches[0].pageX; tSL = currentX; }, { passive: true });
                viewport.addEventListener('touchmove',  e => { setTarget(tSL - (e.changedTouches[0].pageX - tSX)); }, { passive: true });
                viewport.addEventListener('wheel', e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); setTarget(currentX + e.deltaX * 1.5); } }, { passive: false });
            }
            document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', initAmeedScroll) : initAmeedScroll();
        })();

        // ── Generic carousel factory ──────────────────────────────
        function makeCarousel(opts) {
            const { carouselId, trackId, counterId, dotsSelector, prevId, nextId, slideClass, dotClass, autoDelay } = opts;
            const carousel = document.getElementById(carouselId);
            const track    = document.getElementById(trackId);
            const counter  = document.getElementById(counterId);
            const prevBtn  = document.getElementById(prevId);
            const nextBtn  = document.getElementById(nextId);
            const dots     = document.querySelectorAll(dotsSelector + ' .' + dotClass);
            const slides   = track ? track.querySelectorAll('.' + slideClass) : [];
            if (!carousel || !track || !slides.length) return;

            const total = slides.length;
            let current = 0, dragDelta = 0, isDragging = false, touchDelta = 0;

            function goTo(idx, instant) {
                current = (idx + total) % total;
                track.style.transition = instant ? 'none' : 'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)';
                track.style.transform  = 'translateX(' + (-current * 100) + '%)';
                slides.forEach((s, i) => s.classList.toggle('active', i === current));
                dots.forEach((d, i)   => d.classList.toggle('active', i === current));
                if (counter) counter.textContent = (current + 1) + ' / ' + total;
            }

            if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
            if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));
            dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.index)));

            carousel.setAttribute('tabindex', '0');
            carousel.addEventListener('keydown', e => {
                if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
                if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
            });

            carousel.addEventListener('mousedown', e => { isDragging = true; dragDelta = 0; track.dataset.startX = e.pageX; track.classList.add('dragging'); });
            window.addEventListener('mousemove', e => {
                if (!isDragging) return;
                dragDelta = e.pageX - +track.dataset.startX;
                track.style.transition = 'none';
                track.style.transform  = 'translateX(calc(' + (-current * 100) + '% + ' + dragDelta + 'px))';
            });
            window.addEventListener('mouseup', () => {
                if (!isDragging) return;
                isDragging = false; track.classList.remove('dragging');
                if (Math.abs(dragDelta) > 55) goTo(dragDelta < 0 ? current + 1 : current - 1);
                else goTo(current);
                dragDelta = 0;
            });

            carousel.addEventListener('touchstart', e => { touchDelta = 0; track.dataset.touchStartX = e.changedTouches[0].pageX; }, { passive: true });
            carousel.addEventListener('touchmove',  e => {
                touchDelta = e.changedTouches[0].pageX - +track.dataset.touchStartX;
                track.style.transition = 'none';
                track.style.transform  = 'translateX(calc(' + (-current * 100) + '% + ' + touchDelta + 'px))';
            }, { passive: true });
            carousel.addEventListener('touchend', () => {
                if (Math.abs(touchDelta) > 45) goTo(touchDelta < 0 ? current + 1 : current - 1);
                else goTo(current);
                touchDelta = 0;
            });

            if (autoDelay) {
                let timer = setInterval(() => goTo(current + 1), autoDelay);
                carousel.addEventListener('mouseenter', () => clearInterval(timer));
                carousel.addEventListener('mouseleave', () => { timer = setInterval(() => goTo(current + 1), autoDelay); });
            }

            goTo(0, true);
        }

        // ── Init Petra carousel ───────────────────────────────────
        function initPetraCarousel() {
            makeCarousel({ carouselId:'petraCarousel', trackId:'petraTrack', counterId:'petraCounter', dotsSelector:'#petraDots', prevId:'petraPrev', nextId:'petraNext', slideClass:'petra-slide', dotClass:'petra-dot', autoDelay:5000 });
        }

        // ── Init Al Ameed supporting carousel ────────────────────
        function initAmeedCarousel() {
            makeCarousel({ carouselId:'ameedCarousel', trackId:'ameedCarouselTrack', counterId:'ameedCarouselCounter', dotsSelector:'#ameedCarouselDots', prevId:'ameedPrev', nextId:'ameedNext', slideClass:'ameed-slide', dotClass:'ameed-dot', autoDelay:6000 });
        }

        // ── Staggered IntersectionObserver for case blocks + dl cards ──
        function initCardAnimations() {
            if (!('IntersectionObserver' in window)) {
                // Fallback: just show everything
                document.querySelectorAll('.petra-case-block, .petra-dl-card').forEach(el => {
                    el.style.opacity = 1; el.style.transform = 'none';
                });
                return;
            }
            const obs = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12 });

            document.querySelectorAll('.petra-case-block, .petra-dl-card').forEach(el => obs.observe(el));
        }

        document.readyState === 'loading'
            ? document.addEventListener('DOMContentLoaded', () => { initPetraCarousel(); initAmeedCarousel(); initCardAnimations(); })
            : (initPetraCarousel(), initAmeedCarousel(), initCardAnimations());

        function reveal() {
            // Only query elements that haven't been revealed yet to save memory
            document.querySelectorAll(".reveal:not(.active)").forEach(el => {
                if (el.getBoundingClientRect().top < window.innerHeight - 150) {
                    el.classList.add("active");
                }
            });
        }
        
      let rafScheduled = false;
window.addEventListener("scroll", () => {
    if (!rafScheduled) {
        rafScheduled = true;
        window.requestAnimationFrame(() => {
            reveal();
            rafScheduled = false;
        });
    }
}, { passive: true });// passive: true prevents scroll blocking
        
        window.addEventListener("load", reveal);
 
        // ── Mobile menu ────────────────────────────────────────────
        document.getElementById('menu-toggle').onclick = () => { document.getElementById('mobile-menu').style.display = 'flex'; };
        document.getElementById('menu-close').onclick  = () => { document.getElementById('mobile-menu').style.display = 'none'; };
        document.querySelectorAll('.mobile-link').forEach(link => {
            link.onclick = () => { document.getElementById('mobile-menu').style.display = 'none'; };
        });
 
        // ── Folder toggle ──────────────────────────────────────────
        function toggleFolder(el) {
            el.classList.toggle('open');
        }

        // ── Section show/hide helpers ──────────────────────────────
        function hideVideoProjects() {
            const section = document.getElementById('video-projects');
            document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                // Pause all carousel videos when closing
                const track = document.getElementById('vcineTrack');
                if (track) track.querySelectorAll('.vcine-vid').forEach(v => v.pause());
                section.classList.add('hidden');
            }, 600);
        }

        // ── Social Media Carousel ──────────────────────────────
        function initSmCarousel() {
            const track   = document.getElementById('smTrack');
            const prevBtn = document.getElementById('smPrev');
            const nextBtn = document.getElementById('smNext');
            if (!track) return;

            let currentX = 0, targetX = 0, rafId = null;
            let isDragging = false, dragStartX = 0, dragStartCX = 0;
            let touchStartX = 0, touchStartCX = 0;

            function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }
            function maxScroll() { return Math.max(0, track.scrollWidth - track.parentElement.clientWidth); }

            function animateTo(x) {
                targetX = clamp(x, 0, maxScroll());
                if (!rafId) rafId = requestAnimationFrame(step);
            }
            function step() {
                const diff = targetX - currentX;
                if (Math.abs(diff) < 0.4) { currentX = targetX; track.style.transform = 'translateX(' + (-currentX) + 'px)'; rafId = null; return; }
                currentX += diff * 0.1;
                track.style.transform = 'translateX(' + (-currentX) + 'px)';
                rafId = requestAnimationFrame(step);
            }

            function cardW() { const c = track.querySelector('.sm-card'); return c ? c.getBoundingClientRect().width + 20 : 300; }

            if (prevBtn) prevBtn.addEventListener('click', () => animateTo(currentX - cardW() * 2));
            if (nextBtn) nextBtn.addEventListener('click', () => animateTo(currentX + cardW() * 2));

            // Mouse drag
            track.addEventListener('mousedown', e => { isDragging = true; dragStartX = e.clientX; dragStartCX = currentX; if (rafId) { cancelAnimationFrame(rafId); rafId = null; } });
            window.addEventListener('mousemove', e => {
                if (!isDragging) return;
                const dx = dragStartX - e.clientX;
                currentX = clamp(dragStartCX + dx, 0, maxScroll());
                track.style.transform = 'translateX(' + (-currentX) + 'px)';
            });
            window.addEventListener('mouseup', () => { if (isDragging) { isDragging = false; targetX = currentX; } });

            // Touch
            track.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; touchStartCX = currentX; if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }, { passive: true });
            track.addEventListener('touchmove', e => {
                const dx = touchStartX - e.changedTouches[0].clientX;
                currentX = clamp(touchStartCX + dx, 0, maxScroll());
                track.style.transform = 'translateX(' + (-currentX) + 'px)';
            }, { passive: true });
            track.addEventListener('touchend', () => { targetX = currentX; });
        }

        function showSocialMediaProjects() {
            const section = document.getElementById('social-media-projects');
            // Hide other open showcase sections
            document.getElementById('video-projects').classList.add('hidden');
            document.getElementById('web-projects').classList.add('hidden');
            document.getElementById('packaging-projects').classList.add('hidden');
            document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                section.classList.remove('hidden');
                reveal();
                section.scrollIntoView({ behavior: 'smooth' });
                // Smart icon init — only process un-rendered icons
function initIcons(container) {
    const target = container || document;
    lucide.createIcons({ attrs: { class: ['lucide'] }, nameAttr: 'data-lucide' });
};
                setTimeout(initSmCarousel, 80);
            }, 400);
        }

        function hideSocialMediaProjects() {
            const section = document.getElementById('social-media-projects');
            document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => { section.classList.add('hidden'); }, 600);
        }

        function showPackagingProjects() {
            const section = document.getElementById('packaging-projects');
            ['video-projects','web-projects','social-media-projects','plastic-art-section'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('hidden');
            });
            document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                section.classList.remove('hidden');
                reveal();
                section.scrollIntoView({ behavior: 'smooth' });
                // Smart icon init — only process un-rendered icons
function initIcons(container) {
    const target = container || document;
    lucide.createIcons({ attrs: { class: ['lucide'] }, nameAttr: 'data-lucide' });
};
                // Init packaging carousel
                makeCarousel({ carouselId:'packagingCarousel', trackId:'packagingTrack', counterId:'packCounter', dotsSelector:'#packDots', prevId:'packPrev', nextId:'packNext', slideClass:'petra-slide', dotClass:'petra-dot', autoDelay:5000 });
            }, 400);
        }
        function hidePackagingProjects() {
            document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => { document.getElementById('packaging-projects').classList.add('hidden'); }, 600);
        }

        function showWebProjects() {
            const section = document.getElementById('web-projects');
            document.getElementById('video-projects').classList.add('hidden');
            document.getElementById('social-media-projects').classList.add('hidden');
            document.getElementById('plastic-art-section').classList.add('hidden');
            document.getElementById('packaging-projects').classList.add('hidden');
            document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                section.classList.remove('hidden');
                // Lazy-load the external preview iframes only when the section is
                // first opened (avoids loading full third-party sites on page load).
                section.querySelectorAll('iframe[data-src]').forEach(f => {
                    if (!f.getAttribute('src') || f.getAttribute('src') === 'about:blank') {
                        f.setAttribute('src', f.getAttribute('data-src'));
                    }
                });
                reveal();
                section.scrollIntoView({ behavior: 'smooth' });
            }, 400);
        }

        function hideWebProjects() {
            const section = document.getElementById('web-projects');
            document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => { section.classList.add('hidden'); }, 600);
        }

        // ── Portfolio folder filter ────────────────────────────────
        document.querySelectorAll('.filter-btn-folder').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.filter-btn-folder').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.getAttribute('data-filter');
                document.querySelectorAll('.folder-wrap').forEach(wrap => {
                    if (filter === 'all' || wrap.dataset.cat === filter) {
                        wrap.classList.remove('hidden');
                    } else {
                        wrap.classList.add('hidden');
                    }
                });
            };
        });

        // ── MODAL / LIGHTBOX SYSTEM ───────────────────────────────
        const videoSources = [
            'https://files.catbox.moe/pa8t76.mp4',
            'https://files.catbox.moe/2o1zfh.mp4',
            'https://files.catbox.moe/g2efjs.mov',
            'https://files.catbox.moe/jm1myj.mov',
            'https://files.catbox.moe/1gt1z1.mp4',
            'https://files.catbox.moe/yh28as.mov',
            'https://files.catbox.moe/efjltu.mov',
            'https://files.catbox.moe/93ka56.mov',
            'https://files.catbox.moe/wd82z3.mov',
            'https://files.catbox.moe/22ulfd.mov',
            'https://files.catbox.moe/x1vkd5.mov',
            'https://files.catbox.moe/sgsour.mov',
            'https://files.catbox.moe/93n59s.mov',
            'https://files.catbox.moe/g48z06.mov',
            'https://files.catbox.moe/czr2jr.mov',
            'https://files.catbox.moe/2pe51e.mov',
        ];

        // Web projects data — used by the modal iframe viewer
        const webProjects = [
            {
                url:   'https://lamsaa-z.netlify.app/',
                title: 'Lamsaa',
                desc:  'A virtual home furniture store designed and developed by me. Built using HTML, CSS, and JavaScript. I handled the UX/UI design and front-end development.',
            },
            {
                url:   'https://yousef-salman.com/',
                title: 'Yousef Salman Portfolio',
                desc:  'A portfolio website designed and developed by me with backend integration and database functionality. I handled the UX/UI design and full development process.',
            },
            {
                url:   window.location.href.split('#')[0],
                title: 'Z Creative Studio',
                desc:  'My personal creative portfolio — designed and developed entirely by me, from concept to code.',
            },
        ];

        let modalCurrentIndex = 0;
        window.modalCurrentType = 'video'; // exposed for mute system
        let modalCurrentType = 'video'; // 'video' | 'image' | 'web'
        let modalCurrentSet = videoSources;

        function openModal(type, index, set) {
            modalCurrentType = type;
            window.modalCurrentType = type;
            modalCurrentIndex = index;

            const video   = document.getElementById('modal-video');
            const img     = document.getElementById('modal-img');
            const iframe  = document.getElementById('modal-iframe');
            const navEl   = document.getElementById('modal-nav');

            // Hide all media elements first
            video.style.display  = 'none';
            img.style.display    = 'none';
            iframe.style.display = 'none';
            iframe.src = '';

            // Web bar (title + link) — only shown for web type
            const webBar   = document.getElementById('modal-web-bar');
            const webTitle = document.getElementById('modal-web-title');
            const webLink  = document.getElementById('modal-web-link');

            if (type === 'video') {
                modalCurrentSet = videoSources;
                loadModalVideo(videoSources[index]);
                video.style.display  = 'block';
                navEl.style.display  = modalCurrentSet.length > 1 ? 'flex' : 'none';
                webBar.style.display = 'none';

            } else if (type === 'image') {
                const imgSet = set === 'web' ? [] : [];
                modalCurrentSet = imgSet;
                img.src = imgSet[index] || '';
                img.style.display    = 'block';
                navEl.style.display  = modalCurrentSet.length > 1 ? 'flex' : 'none';
                webBar.style.display = 'none';

            } else if (type === 'web') {
                modalCurrentSet = webProjects;
                iframe.src           = webProjects[index].url;
                iframe.style.display = 'block';
                navEl.style.display  = webProjects.length > 1 ? 'flex' : 'none';
                webTitle.textContent = webProjects[index].title;
                webLink.href         = webProjects[index].url;
                webBar.style.display = 'flex';
            }

            updateModalCounter();
            document.getElementById('showcase-modal').classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function loadModalVideo(src) {
            const video = document.getElementById('modal-video');
            video.pause();
            document.getElementById('modal-video-src').src = src;
            video.load();
            video.play().catch(() => {});
        }

        function loadModalImage(src) {
            document.getElementById('modal-img').src = src;
        }

        function updateModalCounter() {
            document.getElementById('modal-counter').textContent =
                (modalCurrentIndex + 1) + ' / ' + modalCurrentSet.length;
        }

        function modalNav(dir) {
            const video  = document.getElementById('modal-video');
            const iframe = document.getElementById('modal-iframe');
            if (modalCurrentType === 'video') video.pause();

            modalCurrentIndex = (modalCurrentIndex + dir + modalCurrentSet.length) % modalCurrentSet.length;

            if (modalCurrentType === 'video') {
                loadModalVideo(modalCurrentSet[modalCurrentIndex]);
            } else if (modalCurrentType === 'image') {
                loadModalImage(modalCurrentSet[modalCurrentIndex]);
            } else if (modalCurrentType === 'web') {
                iframe.src = webProjects[modalCurrentIndex].url;
                document.getElementById('modal-web-title').textContent = webProjects[modalCurrentIndex].title;
                document.getElementById('modal-web-link').href         = webProjects[modalCurrentIndex].url;
            }
            updateModalCounter();
        }

        function closeModal() {
            const modal  = document.getElementById('showcase-modal');
            const video  = document.getElementById('modal-video');
            const iframe = document.getElementById('modal-iframe');
            video.pause();
            iframe.src = ''; // stop iframe loading
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }

        function handleModalBackdropClick(e) {
            if (e.target === document.getElementById('showcase-modal')) {
                closeModal();
            }
        }

        // Close on Escape key
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowRight') { if (document.getElementById('showcase-modal').classList.contains('open')) modalNav(1); }
            if (e.key === 'ArrowLeft')  { if (document.getElementById('showcase-modal').classList.contains('open')) modalNav(-1); }
        });

        // Touch swipe for modal navigation
      let modalTouchStartX = 0;
let modalTouchStartY = 0;
document.getElementById('modal-media-container').addEventListener('touchstart', e => {
    modalTouchStartX = e.changedTouches[0].screenX;
    modalTouchStartY = e.changedTouches[0].screenY;
}, { passive: true });
document.getElementById('modal-media-container').addEventListener('touchend', e => {
    const dx = e.changedTouches[0].screenX - modalTouchStartX;
    const dy = e.changedTouches[0].screenY - modalTouchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 44) {
        if (document.getElementById('showcase-modal').classList.contains('open')) {
            modalNav(dx < 0 ? 1 : -1);
        }
    }
}, { passive: true });
        document.getElementById('modal-media-container').addEventListener('touchend', e => {
            const dx = e.changedTouches[0].screenX - touchStartX;
            const dy = e.changedTouches[0].screenY - touchStartY;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 44) {
                if (document.getElementById('showcase-modal').classList.contains('open')) {
                    modalNav(dx < 0 ? 1 : -1);
                }
            }
        }, { passive: true });

        // Hover-preview: play muted on mouse enter, pause on leave (desktop only)
        if (window.matchMedia('(hover: hover)').matches) {
            document.querySelectorAll('.video-thumb-wrap video').forEach(v => {
                const wrap = v.closest('.video-thumb-wrap');
                wrap.addEventListener('mouseenter', () => { v.play().catch(() => {}); });
                wrap.addEventListener('mouseleave', () => { v.pause(); v.currentTime = 0; });
            });
        }

        // ── Social Media Design — Idle Float ────
        // Hover/Parallax JS removed. The floating effect is now entirely handled
        // by the CSS @keyframes (smdFloat1, smdFloat2, etc.) applied to the cards.

        // ── UNIVERSAL MUTE / UNMUTE SYSTEM ───────────────────────
        (function() {
            // SVG markup for the two icon states (reused by factory)
            const ICON_MUTED = `<svg class="icon-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
            const ICON_LIVE  = `<svg class="icon-unmuted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;

            // Global registry — ensures only one video is unmuted at a time
            let currentUnmuted = null; // { video, btn }

            function muteAll() {
                if (currentUnmuted) {
                    currentUnmuted.video.muted = true;
                    if (currentUnmuted.btn) {
                        currentUnmuted.btn.setAttribute('data-muted', 'true');
                        currentUnmuted.btn.setAttribute('aria-label', 'Unmute video');
                    }
                    currentUnmuted = null;
                }
            }

            // Exposed globally so HTML onclick="toggleMute(this)" works
            window.toggleMute = function(btn) {
                const container = btn.closest('[data-muted]') === btn ? btn.parentElement : btn.parentElement;
                // Find the video in the same container
                const video = container.querySelector('video') || document.getElementById('modal-video');
                if (!video) return;

                const isMuted = btn.getAttribute('data-muted') === 'true';

                if (isMuted) {
                    // Unmuting: first mute any currently unmuted video
                    if (currentUnmuted && currentUnmuted.video !== video) {
                        muteAll();
                    }
                    video.muted = false;
                    btn.setAttribute('data-muted', 'false');
                    btn.setAttribute('aria-label', 'Mute video');
                    currentUnmuted = { video, btn };
                    // Ensure it's playing
                    video.play().catch(() => {});
                } else {
                    video.muted = true;
                    btn.setAttribute('data-muted', 'true');
                    btn.setAttribute('aria-label', 'Unmute video');
                    currentUnmuted = null;
                }
            };

            // Factory: create a mute button and inject into a container element
            window.makeMuteBtn = function(container) {
                if (container.querySelector('.vid-mute-btn')) return; // already has one
                const btn = document.createElement('button');
                btn.className = 'vid-mute-btn';
                btn.setAttribute('data-muted', 'true');
                btn.setAttribute('aria-label', 'Unmute video');
                btn.innerHTML = ICON_MUTED + ICON_LIVE;
                btn.onclick = function() { window.toggleMute(this); };
                container.appendChild(btn);
                return btn;
            };

            // Auto-mute when a vcine slide changes — hook into manageVideo logic
            // by patching it after initVideoCinema runs (see bottom of script)
            window._muteOnSlideChange = function() { muteAll(); };

            // Modal mute button — show/hide depending on whether modal shows a video
            const modalMuteBtn = document.getElementById('modalMuteBtn');
            const modalVideo   = document.getElementById('modal-video');

            // Patch openModal to show/hide mute btn and reset mute state
            const _origOpenModal = window.openModal;
            window.openModal = function(type, index, set) {
                // Reset any unmuted video on modal open
                muteAll();
                _origOpenModal(type, index, set);
                if (modalMuteBtn) {
                    if (type === 'video') {
                        // Modal video starts unmuted by default in modals
                        modalVideo.muted = false;
                        modalMuteBtn.setAttribute('data-muted', 'false');
                        modalMuteBtn.setAttribute('aria-label', 'Mute video');
                        modalMuteBtn.style.display = 'flex';
                        currentUnmuted = { video: modalVideo, btn: modalMuteBtn };
                    } else {
                        modalMuteBtn.style.display = 'none';
                    }
                }
            };

            // Patch closeModal to also mute
            const _origCloseModal = window.closeModal;
            window.closeModal = function() {
                muteAll();
                _origCloseModal();
                if (modalMuteBtn) modalMuteBtn.style.display = 'none';
            };

            // Patch modalNav to reset mute on slide change in modal
            const _origModalNav = window.modalNav;
            window.modalNav = function(dir) {
                muteAll();
                _origModalNav(dir);
                if (modalMuteBtn && document.getElementById('showcase-modal').classList.contains('open')) {
                    const type = window.modalCurrentType;
                    if (type === 'video') {
                        modalVideo.muted = false;
                        modalMuteBtn.setAttribute('data-muted', 'false');
                        modalMuteBtn.setAttribute('aria-label', 'Mute video');
                        modalMuteBtn.style.display = 'flex';
                        currentUnmuted = { video: modalVideo, btn: modalMuteBtn };
                    } else {
                        modalMuteBtn.style.display = 'none';
                    }
                }
            };

            // Petra autoplay video — btn is already in HTML, just expose the video ref
            // (No extra injection needed — button is hardcoded in the wrap)

            // Inject mute btns into vcine items AFTER initVideoCinema runs.
            // We hook into the showVideoProjects open event.
            const _origShow = window.showVideoProjects;
            window.showVideoProjects = function() {
                _origShow();
                // After the carousel inits (100ms delay + 200ms buffer)
                setTimeout(() => {
                    const track = document.getElementById('vcineTrack');
                    if (!track) return;
                    track.querySelectorAll('.vcine-item').forEach(item => {
                        if (!item.querySelector('.vid-mute-btn')) {
                            window.makeMuteBtn(item);
                        }
                    });
                }, 350);
            };
        })();

        // ── PLASTIC ART SKETCHBOOK ────────────────────────────────
        (function() {
            const ARTWORKS = [
                'https://i.ibb.co/nsY4Q0mw/Whats-App-Image-2026-05-06-at-12-12-33-PM-3.jpg',
                'https://i.ibb.co/S1ksXTv/Whats-App-Image-2026-05-06-at-12-12-38-PM-7.jpg',
                'https://i.ibb.co/Fkkwf7Fp/Whats-App-Image-2026-05-06-at-12-12-38-PM-6.jpg',
                'https://i.ibb.co/hJJBGswy/Whats-App-Image-2026-05-06-at-12-12-38-PM-5.jpg',
                'https://i.ibb.co/8DK2s27X/Whats-App-Image-2026-05-06-at-12-12-38-PM-4.jpg',
                'https://i.ibb.co/Lhz0qzm6/Whats-App-Image-2026-05-06-at-12-12-38-PM-3.jpg',
                'https://i.ibb.co/QvhJhRRV/Whats-App-Image-2026-05-06-at-12-12-37-PM-6.jpg',
                'https://i.ibb.co/SX9sQCR6/Whats-App-Image-2026-05-06-at-12-12-37-PM-5.jpg',
                'https://i.ibb.co/CLyC6vd/Whats-App-Image-2026-05-06-at-12-12-37-PM-4.jpg',
                'https://i.ibb.co/4n5H9017/Whats-App-Image-2026-05-06-at-12-12-37-PM-3.jpg',
                'https://i.ibb.co/W4ZJWR9v/Whats-App-Image-2026-05-06-at-12-12-37-PM-2.jpg',
                'https://i.ibb.co/mFRh8F0L/Whats-App-Image-2026-05-06-at-12-12-36-PM-6.jpg',
                'https://i.ibb.co/1GH7NRb4/Whats-App-Image-2026-05-06-at-12-12-36-PM-5.jpg',
                'https://i.ibb.co/hh1dy5S/Whats-App-Image-2026-05-06-at-12-12-36-PM-4.jpg',
                'https://i.ibb.co/7PZgtXf/Whats-App-Image-2026-05-06-at-12-12-36-PM-3.jpg',
                'https://i.ibb.co/wZJQLy5R/Whats-App-Image-2026-05-06-at-12-12-36-PM-2.jpg',
                'https://i.ibb.co/fVgx7F1P/Whats-App-Image-2026-05-06-at-12-12-36-PM-1.jpg',
                'https://i.ibb.co/VpQXh6sk/Whats-App-Image-2026-05-06-at-12-12-35-PM-12.jpg',
                'https://i.ibb.co/b5BY4LD7/Whats-App-Image-2026-05-06-at-12-12-35-PM-11.jpg',
                'https://i.ibb.co/yB45WPXy/Whats-App-Image-2026-05-06-at-12-12-35-PM-10.jpg',
                'https://i.ibb.co/mFc4mdTd/Whats-App-Image-2026-05-06-at-12-12-35-PM-9.jpg',
                'https://i.ibb.co/G3PZ4wNW/Whats-App-Image-2026-05-06-at-12-12-35-PM-8.jpg',
                'https://i.ibb.co/NdfwHG5B/Whats-App-Image-2026-05-06-at-12-12-35-PM-7.jpg',
                'https://i.ibb.co/xKkb71Q1/Whats-App-Image-2026-05-06-at-12-12-35-PM-6.jpg',
                'https://i.ibb.co/hJp3374n/Whats-App-Image-2026-05-06-at-12-12-34-PM-6.jpg',
                'https://i.ibb.co/hRnQ1Czj/Whats-App-Image-2026-05-06-at-12-12-34-PM-5.jpg',
                'https://i.ibb.co/bkg1RMK/Whats-App-Image-2026-05-06-at-12-12-34-PM-3.jpg',
            ];
            const TOTAL = ARTWORKS.length;

            let current  = 0;
            let animating = false;
            let pages    = [];
            let inited   = false;

            // Build spiral rings
            function buildSpiral() {
                const spiral = document.getElementById('paSpiral');
                if (!spiral || spiral.children.length > 0) return;
                for (let i = 0; i < 12; i++) {
                    const r = document.createElement('div');
                    r.className = 'pa-spiral-ring';
                    spiral.appendChild(r);
                }
            }

            // Build all page elements once
            function buildPages() {
                const stack = document.getElementById('paPagesStack');
                if (!stack) return;
                stack.innerHTML = '';
                pages = [];
                ARTWORKS.forEach((src, i) => {
                    const pg = document.createElement('div');
                    pg.className = 'pa-page';
                    pg.style.zIndex = i === 0 ? 10 : 1;
                    pg.style.opacity = i === 0 ? 1 : 0;
                    const img = document.createElement('img');
                    img.src = src;
                    img.loading = i < 3 ? 'eager' : 'lazy';
                    img.alt = 'Artwork ' + (i + 1);
                    img.draggable = false;
                    pg.appendChild(img);
                    stack.appendChild(pg);
                    pages.push(pg);
                });
            }

            function updateCounter() {
                const el = document.getElementById('paCounter');
                if (el) el.textContent = (current + 1) + ' / ' + TOTAL;
            }

            function flipTo(nextIndex, direction) {
                if (animating || nextIndex === current) return;
                if (nextIndex < 0 || nextIndex >= TOTAL) return;
                animating = true;

                const outPage  = pages[current];
                const inPage   = pages[nextIndex];
                const isForward = direction === 'next';

                // Prepare incoming page: make it visible but behind
                inPage.style.opacity = 1;
                inPage.style.zIndex  = 9;

                // Outgoing page: on top, animate out
                outPage.style.zIndex = 10;
                outPage.classList.add(isForward ? 'pa-flip-out' : 'pa-flip-out-back');
                inPage.classList.add(isForward  ? 'pa-flip-in'  : 'pa-flip-in-back');

                setTimeout(() => {
                    // Clean up
                    outPage.classList.remove('pa-flip-out', 'pa-flip-out-back');
                    inPage.classList.remove('pa-flip-in', 'pa-flip-in-back');
                    outPage.style.zIndex  = 1;
                    outPage.style.opacity = 0;
                    inPage.style.zIndex   = 10;
                    inPage.style.opacity  = 1;
                    current   = nextIndex;
                    animating = false;
                    updateCounter();
                }, 500);
            }

            function init() {
                if (inited) return;
                inited = true;
                buildSpiral();
                buildPages();
                updateCounter();

                // Prev / Next buttons
                const prevBtn = document.getElementById('paPrev');
                const nextBtn = document.getElementById('paNext');
                if (prevBtn) prevBtn.addEventListener('click', () => flipTo(current - 1, 'prev'));
                if (nextBtn) nextBtn.addEventListener('click', () => flipTo(current + 1, 'next'));

                // Corner hint — flip forward
                const corner = document.getElementById('paCornerHint');
                if (corner) corner.addEventListener('click', () => flipTo(current + 1, 'next'));

                // Keyboard
                const section = document.getElementById('plastic-art-section');
                if (section) {
                    section.setAttribute('tabindex', '0');
                    section.addEventListener('keydown', e => {
                        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); flipTo(current + 1, 'next'); }
                        if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); flipTo(current - 1, 'prev'); }
                    });
                }

                // Touch swipe on the book
                const book = document.getElementById('paBook');
                if (book) {
                    let tX = 0;
                    book.addEventListener('touchstart', e => { tX = e.changedTouches[0].clientX; }, { passive: true });
                    book.addEventListener('touchend',   e => {
                        const dx = e.changedTouches[0].clientX - tX;
                        if (Math.abs(dx) > 40) {
                            if (dx < 0) flipTo(current + 1, 'next');
                            else        flipTo(current - 1, 'prev');
                        }
                    }, { passive: true });
                }
            }

            // Show / hide
            window.showPlasticArt = function() {
                const section = document.getElementById('plastic-art-section');
                // Close other open sections
                ['video-projects','web-projects','social-media-projects'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.classList.add('hidden');
                });
                document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                    section.classList.remove('hidden');
                    reveal();
                    section.scrollIntoView({ behavior: 'smooth' });
                    // Smart icon init — only process un-rendered icons
function initIcons(container) {
    const target = container || document;
    lucide.createIcons({ attrs: { class: ['lucide'] }, nameAttr: 'data-lucide' });
};
                    init();
                }, 400);
            };

            window.hidePlasticArt = function() {
                const section = document.getElementById('plastic-art-section');
                document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => { section.classList.add('hidden'); }, 600);
            };
        })();

        // ── Performance: pause CSS animations when off-screen ────
        (function() {
            if (!('IntersectionObserver' in window)) return;
            const obs = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const cards = entry.target.querySelectorAll('.smd-card');
                    cards.forEach(c => {
                        c.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
                    });
                });
            }, { threshold: 0.05 });
            const smdSection = document.getElementById('social-design-hero');
            if (smdSection) obs.observe(smdSection);
        })();

        // ── Dark Mode Toggle ──────────────────────────────────────
        (function() {
            const root    = document.documentElement;
            const btn     = document.getElementById('dm-toggle');
            const STORAGE = 'zcreative-theme';

            function applyTheme(dark) {
                root.setAttribute('data-theme', dark ? 'dark' : 'light');
            }

            // Restore saved preference; default is always light
            const saved = localStorage.getItem(STORAGE);
            if (saved === 'dark') {
                applyTheme(true);
            }

            if (btn) {
                btn.addEventListener('click', () => {
                    const isDark = root.getAttribute('data-theme') === 'dark';
                    applyTheme(!isDark);
                    localStorage.setItem(STORAGE, isDark ? 'light' : 'dark');
                });
            }
        })();

        // ── Cinematic Video Carousel ──────────────────────────────
        function initVideoCinema() {
            const track    = document.getElementById('vcineTrack');
            const counter  = document.getElementById('vcineCounter');
            const dotsWrap = document.getElementById('vcineDots');
            const prevBtn  = document.getElementById('vcinePrev');
            const nextBtn  = document.getElementById('vcineNext');
            if (!track) return;

            // ── 1. Collect real items and total ──────────────────
            const realItems = Array.from(track.querySelectorAll('.vcine-item'));
            const total     = realItems.length;
            if (!total) return;

            // ── 2. Build dots for real items only ────────────────
            if (dotsWrap) {
                dotsWrap.innerHTML = '';
                realItems.forEach((_, i) => {
                    const d = document.createElement('button');
                    d.className = 'vcine-dot' + (i === 0 ? ' active' : '');
                    d.setAttribute('aria-label', 'Video ' + (i + 1));
                    d.addEventListener('click', () => jumpTo(i));
                    dotsWrap.appendChild(d);
                });
            }

            // ── 3. Clone BUFFER items at each end for seamless loop ──
            // Cloning 3 from each side gives enough coverage at any speed.
            const BUFFER = Math.min(3, total);
            const headClones = []; // clones of last BUFFER items → prepended
            const tailClones = []; // clones of first BUFFER items → appended

            for (let i = total - BUFFER; i < total; i++) {
                const cl = realItems[i].cloneNode(true);
                cl.setAttribute('data-clone', 'head');
                cl.setAttribute('data-real', i);
                headClones.push(cl);
            }
            for (let i = 0; i < BUFFER; i++) {
                const cl = realItems[i].cloneNode(true);
                cl.setAttribute('data-clone', 'tail');
                cl.setAttribute('data-real', i);
                tailClones.push(cl);
            }

            // Prepend heads (in order: tail-of-real first, so last clone is adjacent to item 0)
            headClones.forEach(cl => track.insertBefore(cl, track.firstChild));
            // Append tails
            tailClones.forEach(cl => track.appendChild(cl));

            // ── 4. All items (clones + real + clones) ────────────
            const allItems = Array.from(track.querySelectorAll('.vcine-item'));

            // The real item[0] is now at index BUFFER inside allItems
            let realIndex   = 0;          // which real slide we're "on" (0–total-1)
            let allIndex    = BUFFER;     // which allItems index is currently centered

            // ── 5. Measurement helpers ───────────────────────────
            function iw()  {
                // Measure from the first real item (past the head clones) for accuracy.
                const el = allItems[BUFFER] || allItems[0];
                return el ? el.getBoundingClientRect().width : 260;
            }
            function gap() { return parseFloat(window.getComputedStyle(track).gap) || 16; }
            function sw()  { return track.parentElement ? track.parentElement.getBoundingClientRect().width : window.innerWidth; }

            // Offset that centres allItems[idx] in the stage
            function offsetFor(idx) {
                const w = iw(), g = gap(), s = sw();
                return -(idx * (w + g)) + (s / 2 - w / 2);
            }

            // ── 6. Animation state ───────────────────────────────
            let currentOffset = 0, targetOffset = 0;
            let rafId = null;
            let isDragging = false, dragStartX = 0, dragDelta = 0;
            let tSX = 0, tD = 0;
            let loopSilent = false; // true while we're silently repositioning for loop

            function animate() {
                const diff = targetOffset - currentOffset;
                if (Math.abs(diff) < 0.35) {
                    currentOffset = targetOffset;
                    track.style.transform = 'translateX(' + currentOffset + 'px)';
                    rafId = null;
                    // After settling, silently reposition if we're on a clone
                    checkLoop();
                    return;
                }
                currentOffset += diff * 0.12;
                track.style.transform = 'translateX(' + currentOffset + 'px)';
                rafId = requestAnimationFrame(animate);
            }

            function animateTo(target) {
                targetOffset = target;
                if (!rafId) rafId = requestAnimationFrame(animate);
            }

            // ── 7. Silent repositioning for infinite loop ─────────
            function checkLoop() {
                // If we landed on a head clone → jump to the equivalent real item
                if (allIndex < BUFFER) {
                    const realEquiv = allIndex + total; // corresponding real item index in allItems
                    loopSilent = true;
                    allIndex   = realEquiv;
                    currentOffset = targetOffset = offsetFor(allIndex);
                    track.style.transform = 'translateX(' + currentOffset + 'px)';
                    loopSilent = false;
                }
                // If we landed on a tail clone → jump to the equivalent real item
                if (allIndex >= BUFFER + total) {
                    const realEquiv = allIndex - total;
                    loopSilent = true;
                    allIndex   = realEquiv;
                    currentOffset = targetOffset = offsetFor(allIndex);
                    track.style.transform = 'translateX(' + currentOffset + 'px)';
                    loopSilent = false;
                }
            }

            // ── 8. Update visual state ────────────────────────────
            function updateClasses() {
                // active class on the centred allItem
                allItems.forEach((el, i) => el.classList.toggle('vcine-active', i === allIndex));
                // dots reflect realIndex
                const dots = dotsWrap ? dotsWrap.querySelectorAll('.vcine-dot') : [];
                dots.forEach((d, i) => d.classList.toggle('active', i === realIndex));
                if (counter) counter.textContent = (realIndex + 1) + ' / ' + total;
            }

            function manageVideo() {
                // Mute any globally unmuted video when slide changes
                if (window._muteOnSlideChange) window._muteOnSlideChange();
                // Play only the centred item's video; pause all others
                allItems.forEach((el, i) => {
                    const v = el.querySelector('.vcine-vid');
                    if (!v) return;
                    if (i === allIndex) v.play().catch(() => {});
                    else v.pause();
                });
            }

            // ── 9. Navigate ───────────────────────────────────────
          function goBy(delta) {
            allIndex   += delta;
            realIndex   = ((allIndex - BUFFER) % total + total) % total;
            updateClasses();
            loadVideoSrc(allIndex);
            manageVideo();
            animateTo(offsetFor(allIndex));
        }

          function jumpTo(ri) {
            allIndex  = ri + BUFFER;
            realIndex = ri;
            updateClasses();
            loadVideoSrc(allIndex);
            manageVideo();
            animateTo(offsetFor(allIndex));
        }

            // ── 10. Click non-active items to focus them ──────────
            allItems.forEach((el, i) => {
                el.addEventListener('click', e => {
                    if (e.target.closest('.vcine-open-btn')) return;
                    if (i !== allIndex) { e.preventDefault(); goBy(i - allIndex); }
                });
            });

            if (prevBtn) prevBtn.addEventListener('click', () => goBy(-1));
            if (nextBtn) nextBtn.addEventListener('click', () => goBy(1));

            // ── 11. Keyboard ──────────────────────────────────────
            const stage = track.parentElement;
            if (stage) {
                stage.setAttribute('tabindex', '0');
                stage.addEventListener('keydown', e => {
                    if (e.key === 'ArrowLeft')  { e.preventDefault(); goBy(-1); }
                    if (e.key === 'ArrowRight') { e.preventDefault(); goBy(1); }
                });
            }

            // ── 12. Mouse drag ────────────────────────────────────
            track.addEventListener('mousedown', e => {
                if (e.target.closest('.vcine-open-btn')) return;
                isDragging = true; dragStartX = e.clientX; dragDelta = 0;
                if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
            });
            window.addEventListener('mousemove', e => {
                if (!isDragging) return;
                dragDelta = e.clientX - dragStartX;
                track.style.transform = 'translateX(' + (currentOffset + dragDelta) + 'px)';
            });
            window.addEventListener('mouseup', () => {
                if (!isDragging) return;
                isDragging = false;
                const threshold = iw() * 0.26;
                if (Math.abs(dragDelta) > threshold) goBy(dragDelta < 0 ? 1 : -1);
                else animateTo(offsetFor(allIndex));
                dragDelta = 0;
            });

            // ── 13. Touch ─────────────────────────────────────────
            track.addEventListener('touchstart', e => {
                tSX = e.changedTouches[0].clientX; tD = 0;
                if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
            }, { passive: true });
            track.addEventListener('touchmove', e => {
                tD = e.changedTouches[0].clientX - tSX;
                track.style.transform = 'translateX(' + (currentOffset + tD) + 'px)';
            }, { passive: true });
            track.addEventListener('touchend', () => {
                if (Math.abs(tD) > iw() * 0.2) goBy(tD < 0 ? 1 : -1);
                else animateTo(offsetFor(allIndex));
                tD = 0;
            });

            // ── 14. Resize recalc ─────────────────────────────────
            let rTimer;
            window.addEventListener('resize', () => {
                clearTimeout(rTimer);
                rTimer = setTimeout(() => {
                    currentOffset = targetOffset = offsetFor(allIndex);
                    track.style.transform = 'translateX(' + currentOffset + 'px)';
                }, 100);
            });

          // ── Lazy video source loader — injects src only for current ± 1 ──
        function loadVideoSrc(allIdx) {
            const toLoad = [allIdx - 1, allIdx, allIdx + 1];
            toLoad.forEach(i => {
                const el = allItems[i];
                if (!el) return;
                const src = el.getAttribute('data-src') ||
                    (realItems[((i - BUFFER) % total + total) % total] || el).getAttribute('data-src');
                const vid = el.querySelector('.vcine-vid');
                if (vid && src && !vid.querySelector('source')) {
                    const s = document.createElement('source');
                    s.src  = src;
                    s.type = 'video/mp4';
                    vid.appendChild(s);
                    vid.load();
                }
            });
        }

        // ── 15. Init — defer by two rAFs so layout is fully painted ──
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                currentOffset = targetOffset = offsetFor(allIndex);
                track.style.transform = 'translateX(' + currentOffset + 'px)';
                updateClasses();
                loadVideoSrc(allIndex);
                manageVideo();
            });
        });
        }

        // Override showVideoProjects to init carousel each time
        function showVideoProjects() {
            const section = document.getElementById('video-projects');
            document.getElementById('web-projects').classList.add('hidden');
            document.getElementById('social-media-projects').classList.add('hidden');
            document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                section.classList.remove('hidden');
                reveal();
                section.scrollIntoView({ behavior: 'smooth' });
                // Smart icon init — only process un-rendered icons
function initIcons(container) {
    const target = container || document;
    lucide.createIcons({ attrs: { class: ['lucide'] }, nameAttr: 'data-lucide' });
};
                // Remove any clones injected by a previous initVideoCinema call
                const track = document.getElementById('vcineTrack');
                if (track) track.querySelectorAll('[data-clone]').forEach(el => el.remove());
                setTimeout(initVideoCinema, 100);
            }, 400);
        }

        // ── PROJECT COMPACT CARDS SHOW/HIDE LOGIC ──
        window.toggleProjectShowcase = function(projectType) {
            const grid = document.getElementById('project-cards-grid');
            const container = document.getElementById('detailed-project-showcase');
            const petraDetails = document.getElementById('details-petra');
            const ameedDetails = document.getElementById('details-ameed');
            
            // Hide the grid selection view
            grid.classList.add('hidden');
            // Show the main details wrapper
            container.classList.remove('hidden');

            if (projectType === 'petra') {
                ameedDetails.classList.add('hidden');
                petraDetails.classList.remove('hidden');
                
                // Play video if it exists
                const pVid = document.getElementById('petraCaseVideo');
                if (pVid) pVid.play().catch(() => {});
                
            } else if (projectType === 'ameed') {
                petraDetails.classList.add('hidden');
                ameedDetails.classList.remove('hidden');
                
                // Pause petra video if it was running
                const pVid = document.getElementById('petraCaseVideo');
                if (pVid) pVid.pause();
            }

            // CRITICAL: Trigger resize event to force dynamic layout elements
            // (like track width, layout boundaries, container height) to compute accurately.
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
                // Force reveal observer checklist update
                if (typeof reveal === 'function') reveal();
                
                // Smooth scroll to the featured study section header
                document.getElementById('highlighted-projects').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 60);
        };

   window.hideProjectShowcase = function() {
    const grid = document.getElementById('project-cards-grid');
    const container = document.getElementById('detailed-project-showcase');
    const petraDetails = document.getElementById('details-petra');
    const ameedDetails = document.getElementById('details-ameed');
    
    // Pause AND reset video on exit to free memory
    const pVid = document.getElementById('petraCaseVideo');
    if (pVid) { pVid.pause(); pVid.currentTime = 0; pVid.src = ''; pVid.load(); }
            
            // Revert views
            container.classList.add('hidden');
            petraDetails.classList.add('hidden');
            ameedDetails.classList.add('hidden');
            grid.classList.remove('hidden');
            
            // Scroll smoothly back to top of the block
            document.getElementById('highlighted-projects').scrollIntoView({ behavior: 'smooth', block: 'start' });
        };

        // ── DRAGGABLE HERO CARD (SPRING EFFECT) ────────────────────
        (function() {
            const cardWrap = document.getElementById('draggable-card-wrap');
            if (!cardWrap) return;

            let isDragging = false;
            let startX = 0, startY = 0;

            // منع سلوك السحب الافتراضي للصور حتى لا يتعارض مع سحب البطاقة
            cardWrap.querySelectorAll('img').forEach(img => img.draggable = false);

            const onGrab = (e) => {
                isDragging = true;
                // استخدام طريقة أكثر دقة للتعرف على اللمس أو الماوس
                startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
                startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
                
                cardWrap.style.transition = 'none';
                // الحل السحري: إزالة الأنيميشن بالكامل للسماح للجافاسكريبت بالتحكم في الـ transform
                cardWrap.style.animation = 'none'; 
                cardWrap.style.cursor = 'grabbing';
            };

            const onMove = (e) => {
                if (!isDragging) return;
                
                const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
                const y = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
                
                const dx = x - startX;
                const dy = y - startY;
                
                // 1. الاحتكاك: جعل الكرت يقاوم السحب ليعطي إحساس بالوزن
                const pullX = dx * 0.4;
                const pullY = dy > 0 ? dy * 0.35 : dy * 0.5;
                
                // 2. تأرجح البندول: ميلان يعتمد على السحب الأفقي
                const rotation = -3 + (dx * 0.04);
                
                // 3. التمدد (المط): يتمدد الكرت عندما تسحبه للأسفل
                let scaleX = 1;
                let scaleY = 1;
                
                if (dy > 0) {
                    const tension = Math.min(dy, 400); 
                    scaleY = 1 + (tension * 0.0008);
                    scaleX = 1 - (tension * 0.0003); 
                }
                
                cardWrap.style.transform = `translate(${pullX}px, ${pullY}px) rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`;
            };

            const onRelease = () => {
                if (!isDragging) return;
                isDragging = false;
                cardWrap.style.cursor = 'grab';
                
                // الارتداد للخلف بشكل مرن
                cardWrap.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
                cardWrap.style.transform = `translate(0px, 0px) rotate(-3deg) scale(1, 1)`;
                
                // إعادة تشغيل أنيميشن الطفو التلقائي بعد الاستقرار
                setTimeout(() => {
                    if (!isDragging) {
                        cardWrap.style.transition = '';
                        cardWrap.style.animation = ''; // إرجاع الأنيميشن للعمل بناءً على كلاس الـ CSS
                    }
                }, 800);
            };

            cardWrap.addEventListener('mousedown', onGrab);
            cardWrap.addEventListener('touchstart', onGrab, {passive: true});
            window.addEventListener('mousemove', onMove);
            window.addEventListener('touchmove', onMove, {passive: true});
            window.addEventListener('mouseup', onRelease);
            window.addEventListener('touchend', onRelease);
        })();
        
    