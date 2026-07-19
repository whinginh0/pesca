// Global Lightbox Functions (defined at top level so they are available immediately)
window.openLightbox = (imgUrl) => {
    const lightboxModal = document.getElementById('lightbox-modal');
    const fullImg = document.getElementById('lightbox-full-img');
    if (fullImg) {
        fullImg.src = imgUrl;
    }
    if (lightboxModal) {
        lightboxModal.classList.add('open');
    }
    document.body.style.overflow = 'hidden';
};

window.closeLightbox = () => {
    const lightboxModal = document.getElementById('lightbox-modal');
    if (lightboxModal) {
        lightboxModal.classList.remove('open');
    }
    document.body.style.overflow = '';
};

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
    
    // Safe localStorage access (avoids crash when cookies/localStorage are blocked or in private/incognito mode)
    function safeGetItem(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    }

    function safeSetItem(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            // Do nothing
        }
    }
    
    /* ==========================================================================
       FAQ ACCORDION INTERACTIVITY
       ========================================================================== */
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const currentItem = question.parentElement;
            
            // Check if current item is already active
            const isActive = currentItem.classList.contains('active');
            
            // Close all other FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Toggle active state for clicked item
            if (!isActive) {
                currentItem.classList.add('active');
            }
        });
    });

    /* ==========================================================================
       UPSELL POPUP LOGIC
       ========================================================================== */
    const btnComprarBasico = document.getElementById('btn-abrir-popup-basico');
    const btnComprarCompleto = document.getElementById('btn-comprar-completo');
    
    const upsellModal = document.getElementById('upsell-modal');
    const btnCloseUpsell = document.getElementById('btn-close-upsell');
    const btnUpsellAccept = document.getElementById('btn-upsell-accept');
    const btnUpsellDecline = document.getElementById('btn-upsell-decline');

    // Open Upsell Modal on click of Basic Plan button
    if (btnComprarBasico) {
        btnComprarBasico.addEventListener('click', (e) => {
            e.preventDefault();
            upsellModal.classList.add('open');
            document.body.style.overflow = 'hidden'; // Stop background scrolling
        });
    }

    const trackingKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'src', 'sck'];

    // Capture UTM parameters from current URL and store them in localStorage
    function captureAndStoreUtms() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            trackingKeys.forEach(key => {
                const value = urlParams.get(key);
                if (value) {
                    safeSetItem(key, value);
                    safeSetItem(`utmify_${key}`, value);
                }
            });
        } catch (e) {
            console.error('Error capturing UTMs:', e);
        }
    }
    captureAndStoreUtms();

    // Helper function to append UTM parameters to checkout URLs
    function getCheckoutUrlWithUtms(baseUrl) {
        try {
            const urlObj = new URL(baseUrl, window.location.origin);
            const trackingParams = {};

            // 1. Load from localStorage (lowest priority)
            trackingKeys.forEach(key => {
                const val = safeGetItem(key) || safeGetItem(`utmify_${key}`);
                if (val) {
                    trackingParams[key] = val;
                }
            });

            // 2. Load from current URL query string (medium priority, overrides localStorage)
            const currentUrlParams = new URLSearchParams(window.location.search);
            trackingKeys.forEach(key => {
                const val = currentUrlParams.get(key);
                if (val) {
                    trackingParams[key] = val;
                }
            });

            // 3. Load from target checkout URL query string (highest priority)
            trackingKeys.forEach(key => {
                if (urlObj.searchParams.has(key)) {
                    trackingParams[key] = urlObj.searchParams.get(key);
                }
            });

            // Set all collected tracking parameters on the target URL
            Object.keys(trackingParams).forEach(key => {
                urlObj.searchParams.set(key, trackingParams[key]);
            });

            return urlObj.toString();
        } catch (e) {
            console.error('Error decorating URL with UTMs:', e);
            return baseUrl;
        }
    }

    function redirectToCheckout(url) {
        const finalUrl = getCheckoutUrlWithUtms(url);
        console.log('Redirecting to checkout:', finalUrl);
        window.location.href = finalUrl;
    }

    // Redirect to Complete Plan directly
    if (btnComprarCompleto) {
        btnComprarCompleto.addEventListener('click', () => {
            redirectToCheckout('https://ggcheckout.app/checkout/v5/hly48H7XtwYLYbBIl4Qv');
        });
    }

    // Modal Action: Close
    const closeUpsell = () => {
        upsellModal.classList.remove('open');
        document.body.style.overflow = ''; // Restore background scrolling
    };

    if (btnCloseUpsell) btnCloseUpsell.addEventListener('click', closeUpsell);
    if (btnUpsellDecline) btnUpsellDecline.addEventListener('click', () => {
        closeUpsell();
        redirectToCheckout('https://ggcheckout.app/checkout/v5/a7XwInaqHfOL0GBTxD7D');
    });

    // Modal Action: Accept Upsell
    if (btnUpsellAccept) {
        btnUpsellAccept.addEventListener('click', () => {
            closeUpsell();
            redirectToCheckout('https://ggcheckout.app/checkout/v5/2ZKfSetPF3rOdy4s3Jfv');
        });
    }

    // Close Modal on clicking outside the modal content
    window.addEventListener('click', (e) => {
        if (e.target === upsellModal) {
            closeUpsell();
        }
    });

    // ==========================================================================
    // Global functions are now defined at the top level outside DOMContentLoaded to ensure they are immediately available.

    function simulateCheckout(planName, price) {
        // Log to console for debugging/verification
        console.log(`[Checkout Triggered] Plano: ${planName} | Preço: R$ ${price.toFixed(2)}`);
        
        // Show interactive notice to user
        const message = `✨ [Simulação de Checkout]\n\nVocê escolheu o "${planName}" por R$ ${price.toFixed(2)}.\n\nEm ambiente de produção, aqui o usuário seria redirecionado para a plataforma de pagamento (Hotmart, Kiwify, etc.).`;
        alert(message);
    }

    // ==========================================================================
    // DYNAMIC COUNTDOWN TIMER (EVERGREEN & PERSISTENT)
    // ==========================================================================
    const hoursVal = document.getElementById('hours');
    const minutesVal = document.getElementById('minutes');
    const secondsVal = document.getElementById('seconds');

    const sHoursVal = document.getElementById('scarcity-hours');
    const sMinutesVal = document.getElementById('scarcity-minutes');
    const sSecondsVal = document.getElementById('scarcity-seconds');

    if ((hoursVal && minutesVal && secondsVal) || (sHoursVal && sMinutesVal && sSecondsVal)) {
        const timerDurationSeconds = (76 * 60) + 2; // 1h 16m 02s = 4562s
        
        let deadline = safeGetItem('pricing_countdown_deadline');
        
        // If deadline is not set or is corrupted, set a new one
        if (!deadline || isNaN(parseInt(deadline))) {
            const newDeadline = new Date().getTime() + (timerDurationSeconds * 1000);
            safeSetItem('pricing_countdown_deadline', newDeadline.toString());
            deadline = newDeadline;
        } else {
            deadline = parseInt(deadline);
        }

        function updateTimer() {
            const now = new Date().getTime();
            let remaining = deadline - now;

            // Reset deadline if it has expired
            if (remaining <= 0) {
                const newDeadline = now + (timerDurationSeconds * 1000);
                safeSetItem('pricing_countdown_deadline', newDeadline.toString());
                deadline = newDeadline;
                remaining = timerDurationSeconds * 1000;
            }

            const totalSeconds = Math.floor(remaining / 1000);
            const hrs = Math.floor(totalSeconds / 3600);
            const mins = Math.floor((totalSeconds % 3600) / 60);
            const secs = totalSeconds % 60;

            const padHrs = hrs.toString().padStart(2, '0');
            const padMins = mins.toString().padStart(2, '0');
            const padSecs = secs.toString().padStart(2, '0');

            // Update main timer
            if (hoursVal) hoursVal.innerText = padHrs;
            if (minutesVal) minutesVal.innerText = padMins;
            if (secondsVal) secondsVal.innerText = padSecs;

            // Update sticky scarcity timer
            if (sHoursVal) sHoursVal.innerText = padHrs;
            if (sMinutesVal) sMinutesVal.innerText = padMins;
            if (sSecondsVal) sSecondsVal.innerText = padSecs;
        }

        // Run immediately once
        updateTimer();
        
        // Update timer every second
        setInterval(updateTimer, 1000);
    }



    /* ==========================================================================
       PROTEÇÕES E SEGURANÇA DA PÁGINA (ANTI-CLONAGEM / ANTI-CÓPIA)
       ========================================================================== */
    
    // 1. Bloqueia Clique com Botão Direito
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // 2. Bloqueia atalhos de Inspecionar Elemento (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S)
    document.addEventListener('keydown', (e) => {
        // F12
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I ou Ctrl+Shift+J ou Ctrl+Shift+C
        if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
            e.preventDefault();
            return false;
        }
        // Ctrl+U (Ver código-fonte)
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
        // Ctrl+S (Salvar página)
        if (e.ctrlKey && e.keyCode === 83) {
            e.preventDefault();
            return false;
        }
        // Ctrl+C / Ctrl+X (Impedir cópias por atalho se houver falhas no user-select)
        if (e.ctrlKey && (e.keyCode === 67 || e.keyCode === 88)) {
            e.preventDefault();
            return false;
        }
    });

    // 3. Proteção contra Print Screen (Escurecimento de Tela)
    const printShield = document.getElementById('print-shield-overlay');

    // Ao pressionar PrintScreen ou atalho de captura do Windows (Win+Shift+S)
    // Nota: O evento keyup pode capturar a tecla 'PrintScreen' (código 44)
    document.addEventListener('keyup', (e) => {
        if (e.keyCode === 44 || e.key === 'PrintScreen') {
            triggerScreenBlackout();
        }
    });

    // Função para escurecer a tela temporariamente
    function triggerScreenBlackout() {
        if (printShield) {
            printShield.style.display = 'block';
            // Tenta copiar algo vazio ou aviso para a área de transferência para anular o print
            navigator.clipboard.writeText("Aviso: Capturas de tela são bloqueadas nesta página.").catch(() => {});
            
            setTimeout(() => {
                printShield.style.display = 'none';
            }, 2500);
        }
    }

});
