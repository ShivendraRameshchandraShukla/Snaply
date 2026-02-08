document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    fetchData();
    initPreloader();
    initThreeJS();
    // initScrollAnimation(); // Moved to inside fetchData() to ensure content is loaded
    initFormLogic();
    initMobileMenu();
});

// --- Theme Logic ---
function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    const icon = toggleBtn.querySelector('i');
    const body = document.body;
    
    // Check saved preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        icon.classList.replace('bi-sun', 'bi-moon');
    }

    toggleBtn.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        const isLight = body.classList.contains('light-mode');
        
        // Update Icon
        if (isLight) {
            icon.classList.replace('bi-sun', 'bi-moon');
            localStorage.setItem('theme', 'light');
        } else {
            icon.classList.replace('bi-moon', 'bi-sun');
            localStorage.setItem('theme', 'dark');
        }
    });
}

// --- Mobile Menu Logic ---
function initMobileMenu() {
    const btn = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if(!btn || !navLinks) return;
    
    btn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = btn.querySelector('i');
        if(navLinks.classList.contains('active')) {
            icon.classList.replace('bi-list', 'bi-x-lg');
        } else {
            icon.classList.replace('bi-x-lg', 'bi-list');
        }
    });

    // Close when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            btn.querySelector('i').classList.replace('bi-x-lg', 'bi-list');
        });
    });
}

// --- Preloader Logic ---
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const textEl = document.getElementById('preloader-text');
    const heroContent = document.querySelector('.hero-content');
    
    // Initial state: Hide hero content so it can reveal later
    if(heroContent) gsap.set(heroContent.children, { opacity: 0 });

    const timeline = gsap.timeline({
        onComplete: () => {
            gsap.to(preloader, {
                opacity: 0,
                duration: 0.8,
                onComplete: () => {
                    preloader.style.display = 'none';
                    revealHero();
                }
            });
        }
    });

    const words = ["STAND OUT", "BE HEARD", "BE SEEN"];

    words.forEach(word => {
        timeline.to(textEl, {
            duration: 0.1,
            opacity: 0,
            onComplete: () => { textEl.textContent = word; }
        })
        .to(textEl, {
            duration: 0.5,
            opacity: 1,
            ease: "power2.out"
        })
        .to(textEl, {
            duration: 0.3,
            opacity: 0,
            delay: 0.4,
            ease: "power2.in"
        });
    });
}

function revealHero() {
    const elements = document.querySelectorAll('.hero-content .accent-text, .hero-content h1, .hero-content p, .hero-content #hero-cta-container');
    
    gsap.to(elements, {
        opacity: 1,
        y: 0,
        duration: 1.5,
        stagger: 0.3,
        ease: "power3.out"
    });
}

// --- Data Fetching ---
async function fetchData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        // 1. Meta / Nav
        const brandNameText = data.brand_name.replace(/<[^>]*>?/gm, '');
        const taglineText = data.tagline.replace(/<[^>]*>?/gm, '');
        document.title = `${brandNameText} | ${taglineText}`;
        document.getElementById('nav-logo').innerHTML = `<a href="#hero" style="text-decoration:none; color:inherit;">${data.brand_name}</a>`;
        
        // 2. Hero
        // 2. Hero
        document.getElementById('hero-tagline').innerHTML = data.tagline;
        
        // --- Hero Animation (Be SEEN / Be HEARD) ---
        const heroHeadline = document.getElementById('hero-headline');
        // Initial State
        heroHeadline.innerHTML = `BE <span id="hero-dynamic-text">SEEN</span>`;
        
        // Animation Loop
        const dynamicText = document.getElementById('hero-dynamic-text');
        const words = ["SEEN", "HEARD"];
        let wordIndex = 0;
        
        // Clear any existing interval to prevent duplicates on potential re-runs
        if (window.heroInterval) clearInterval(window.heroInterval);
        
        window.heroInterval = setInterval(() => {
            wordIndex = (wordIndex + 1) % words.length;
            
            // Simple GSAP Fade/Slide effect
            gsap.to(dynamicText, {
                opacity: 0,
                y: -20,
                duration: 0.5,
                onComplete: () => {
                    dynamicText.textContent = words[wordIndex];
                    gsap.fromTo(dynamicText, 
                        { opacity: 0, y: 20 }, 
                        { opacity: 1, y: 0, duration: 0.5 }
                    );
                }
            });
        }, 2500); // Change every 2.5 seconds

        document.getElementById('hero-intro').innerHTML = data.intro_text;

        const ctaContainer = document.getElementById('hero-cta-container');
        // Clear first (in case of re-runs)
        ctaContainer.innerHTML = '';
        data.cta_buttons.forEach((txt, idx) => {
            const btn = document.createElement('a');
            btn.href = '#contact';
            // Make first button primary, others secondary
            btn.className = idx === 0 ? 'cta-btn' : 'cta-btn secondary';
            // Add icon for primary
            if(idx === 0) btn.innerHTML = `${txt} <i class="bi bi-arrow-right" style="margin-left:8px;"></i>`;
            else btn.textContent = txt;
            
            ctaContainer.appendChild(btn);
        });

        // 3. Features (Categories)
        document.getElementById('features-title').innerHTML = data.features_section.title;
        document.getElementById('features-desc').innerHTML = data.features_section.description;

        const featuresContainer = document.querySelector('.features-container');
        featuresContainer.innerHTML = '';
        Object.entries(data.features_section.categories).forEach(([key, items]) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'feature-category';
            
            const title = key.replace(/_/g, ' '); 
            
            categoryDiv.innerHTML = `
                <h3>${title}</h3>
                <ul class="feature-list">
                    ${items.map(i => `<li>${i}</li>`).join('')}
                </ul>
            `;
            featuresContainer.appendChild(categoryDiv);
        });

        // 4. Process
        document.getElementById('process-title').innerHTML = data.process_section.title;
        document.getElementById('process-desc').innerHTML = data.process_section.description;
        
        const timeline = document.querySelector('.timeline');
        timeline.innerHTML = '';
        data.process_section.steps.forEach(step => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.innerHTML = `
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <h4>0${step.id} | ${step.name}</h4>
                    <p>${step.description}</p>
                </div>
            `;
            timeline.appendChild(item);
        });

        // 5. Pricing
        document.getElementById('pricing-title').innerHTML = data.pricing_section.title;
        document.getElementById('pricing-desc').innerHTML = data.pricing_section.description;
        
        const pricingGrid = document.querySelector('.pricing-grid');
        const oneTimeGrid = document.querySelector('.one-time-grid');
        const toggle = document.getElementById('currency-toggle');
        const labelAED = document.getElementById('label-aed');
        const labelINR = document.getElementById('label-inr');

        const renderPricing = (currency) => {
            // Render Monthly Plans
            pricingGrid.innerHTML = '';
            data.pricing_section.monthly_plans.forEach(plan => {
                const card = document.createElement('div');
                card.className = 'pricing-card';
                
                let priceHtml = '';
                let priceVal = plan.price[currency];
                
                if (priceVal.toLowerCase().includes('custom')) {
                     // Custom quote handling
                     if (currency === 'aed') {
                         priceHtml = `<span style="font-size: 1.2rem; font-weight:700;">AED</span> <span style="font-size: 1.6rem; white-space: normal;">${priceVal}</span>`;
                     } else {
                         // Rupee Icon
                         priceHtml = `<i class="bi bi-currency-rupee" style="font-size: 1.6rem;"></i> <span style="font-size: 1.6rem; white-space: normal;">${priceVal}</span>`;
                     }
                } else {
                    // Standard Price
                    if (currency === 'aed') {
                        priceHtml = `<span style="font-size: 1.2rem; font-weight:700; margin-right:5px;">AED</span> ${priceVal}<span style="font-size:0.5em; font-weight:400;">/month</span>`;
                    } else {
                         priceHtml = `<i class="bi bi-currency-rupee"></i> ${priceVal}<span style="font-size:0.5em; font-weight:400;">/month</span>`;
                    }
                }

                card.innerHTML = `
                    <h3>${plan.name}</h3>
                    <div class="pricing-price">${priceHtml}</div>
                    <p class="who-for">${plan.who_it_is_for}</p>
                    <ul class="pricing-includes">
                        ${plan.includes.map(inc => `<li>${inc}</li>`).join('')}
                    </ul>
                    <a href="#contact" class="cta-btn" style="text-align:center;">Select Plan</a>
                `;
                pricingGrid.appendChild(card);
            });

            // Render One-Time Services
            oneTimeGrid.innerHTML = '';
            data.pricing_section.one_time_services.forEach(svc => {
                const div = document.createElement('div');
                div.className = 'one-time-card';
                
                let otPriceHtml = '';
                let otPriceVal = svc.price[currency];

                if (currency === 'aed') {
                    otPriceHtml = `<span style="font-weight:700; font-size: 0.9em;">AED</span> ${otPriceVal}`;
                } else {
                    otPriceHtml = `<i class="bi bi-currency-rupee"></i> ${otPriceVal}`;
                }

                div.innerHTML = `
                    <h4>${svc.name}</h4>
                    <div class="price">${otPriceHtml}</div>
                `;
                oneTimeGrid.appendChild(div);
            });
        };

        // Initial Render (AED)
        renderPricing('aed');

        // Toggle Listener
        if(toggle) {
            toggle.addEventListener('change', () => {
                const cur = toggle.checked ? 'inr' : 'aed';
                renderPricing(cur);
                
                // Update Labels
                if(cur === 'inr') {
                   labelINR.classList.add('active');
                   labelAED.classList.remove('active');
                } else {
                   labelAED.classList.add('active');
                   labelINR.classList.remove('active');
                }
            });
        }

        // 6. About
        document.getElementById('about-title').innerHTML = data.about_section.title;
        document.getElementById('about-text').innerHTML = data.about_section.about_snaply;
        document.getElementById('about-promise').innerHTML = data.about_section.promise;
        document.getElementById('about-why').innerHTML = data.about_section.why_snaply;

        // 7. FAQ
        const faqContainer = document.querySelector('.faq-container');
        faqContainer.innerHTML = '';
        document.getElementById('faq-title').innerHTML = data.faq_section.title;
        
        data.faq_section.questions.forEach(qItem => {
            const item = document.createElement('div');
            item.className = 'faq-item';
            item.innerHTML = `
                <button class="faq-question">
                    <span>${qItem.q}</span>
                    <span class="faq-icon">+</span>
                </button>
                <div class="faq-answer">
                    <p><br>${qItem.a}</p>
                </div>
            `;
            faqContainer.appendChild(item);
        });

        // FAQ Toggle
        document.querySelectorAll('.faq-question').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.parentElement;
                item.classList.toggle('active');
                const span = btn.querySelector('.faq-icon');
                span.textContent = item.classList.contains('active') ? '-' : '+';
            });
        });

        // 8. Footer & Modal Socials
        if (data.footer_section && data.social_links) {
            const footerContent = document.querySelector('.footer-content');
            
            // Socials HTML
            const socialHtml = data.social_links.map(l => `<a href="${l.url}" target="_blank"><i class="bi ${l.icon}"></i></a>`).join('');

            let contactHtml = '';
            if (data.footer_section.contact_info) {
                contactHtml = data.footer_section.contact_info.map(c => 
                    `<p>${c.label}: <a href="tel:${c.value.replace(/\s/g,'')}" style="color:inherit; text-decoration:none;">${c.value}</a></p>`
                ).join('');
            }

            footerContent.innerHTML = `
                <div class="footer-left">
                    ${data.footer_section.notes ? `<div class="footer-notes">${data.footer_section.notes.replace(/\n/g, '<br>')}</div>` : ''}
                </div>
                <div class="footer-right">
                    <h2 style="font-size:2rem; margin-bottom:10px;">${data.brand_name}</h2>
                    <div class="footer-socials">${socialHtml}</div>
                    <p style="font-weight:700; margin-bottom: 5px;">${data.footer_section.address}</p>
                    ${contactHtml}
                    <p style="margin-top: 10px;">Email: <a href="mailto:${data.footer_section.email}" style="color: inherit; text-decoration: none;">${data.footer_section.email}</a></p>
                    <div class="footer-links">
                        ${data.footer_section.links.map(l => `<a href="${l.url}">${l.text}</a>`).join(' | ')}
                    </div>
                    <p style="margin-top:20px; font-size:0.9em; color:#444;">${data.footer_section.text}</p>
                </div>
            `;

            // Modal Socials
            document.getElementById('modal-socials').innerHTML = socialHtml;
        }
        
        // Initialize Scroll Animations AFTER content is loaded
        initScrollAnimation();


    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// --- Three.js Point Mesh Hero ---
function initThreeJS() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    
    // Slight fog for depth
    scene.fog = new THREE.FogExp2(0x050505, 0.002);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // --- Create Point Mesh (Particles) ---
    const geometry = new THREE.BufferGeometry();
    const count = 2000;
    
    const posArray = new Float32Array(count * 3);
    
    for(let i = 0; i < count * 3; i++) {
        // Spread particles in a wide area
        posArray[i] = (Math.random() - 0.5) * 15; // Range -7.5 to 7.5
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Material
    const material = new THREE.PointsMaterial({
        size: 0.1, // Slightly larger to show shape
        color: 0x800020, // Keep Brand Red
        map: getTexture(), // Soft "Snow" shape
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 6;

    // Interaction
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (event) => {
        // Normalize mouse pos -1 to 1
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Theme Toggle Listener for Mesh Opacity
    const updateMeshOpacity = () => {
        if (document.body.classList.contains('light-mode')) {
            material.opacity = 0.4; // lighter intensity
        } else {
            material.opacity = 0.9; // Standard intensity for dark mode
        }
    };
    
    // Initial check
    updateMeshOpacity();

    // Listen to theme toggle button
    const themeBtn = document.getElementById('theme-toggle');
    if(themeBtn) {
        themeBtn.addEventListener('click', () => {
            // Small delay to allow class toggle to propagate if needed, though usually synchronous
            setTimeout(updateMeshOpacity, 50);
        });
    }

    // Store original positions for return-to-base logic
    const originalPositions = posArray.slice(); // Clone Float32Array

    const clock = new THREE.Clock();

    const animate = () => {
        const elapsedTime = clock.getElapsedTime();
        requestAnimationFrame(animate);

        // Calculate Mouse World Position (Approximate at z=0)
        // Camera z=6, FOV=75. Visible height at z=0 is approx 9 units.
        const vector = new THREE.Vector3(mouseX, mouseY, 0.5);
        vector.unproject(camera);
        const dir = vector.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        const targetPos = camera.position.clone().add(dir.multiplyScalar(distance));

        // Update Particles
        const positions = particles.geometry.attributes.position.array;
        
        for(let i = 0; i < count; i++) {
            const i3 = i * 3;
            
            // Original Position
            const ox = originalPositions[i3];
            const oy = originalPositions[i3 + 1];
            const oz = originalPositions[i3 + 2];

            // Current Position
            let px = positions[i3];
            let py = positions[i3+1];
            let pz = positions[i3+2];

            // Distance to Mouse
            const dx = px - targetPos.x;
            const dy = py - targetPos.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            // Repel Force (Radius 3.0)
            if (dist < 3.0) {
                const force = (3.0 - dist) / 3.0;
                const repelStrength = 0.15; // Much gentler "water flow"
                const angle = Math.atan2(dy, dx);
                
                px += Math.cos(angle) * force * repelStrength;
                py += Math.sin(angle) * force * repelStrength;
                // Add slight Z-wave for "water surface" feel
                pz += force * 0.05;
            }

            // Return to Original (Elasticity / Surface Tension)
            // Slower return = more "fluid" drag
            px += (ox - px) * 0.03;
            py += (oy - py) * 0.03;
            pz += (oz - pz) * 0.03;

            // Apply global rotation (Base movement)
            // We apply rotation to the container 'particles', so here we just handle local displacement
            
            positions[i3] = px;
            positions[i3+1] = py;
            positions[i3+2] = pz;
        }
        
        particles.geometry.attributes.position.needsUpdate = true;

        // Rotate entire cloud slowly (Background ambient mvmt)
        particles.rotation.y = elapsedTime * 0.05;
        
        renderer.render(scene, camera);
    };

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Helper: Generate Soft Particle Texture
function getTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    
    const ctx = canvas.getContext('2d');
    // Radial Gradient (White center -> Transparent edge)
    // We use white so the material 'color' property tints it correctly
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// --- GSAP Scroll Logic ---
function initScrollAnimation() {
    gsap.registerPlugin(ScrollTrigger);

    const nav = document.querySelector('nav');
    
    // Nav Capsule
    ScrollTrigger.create({
        start: 'top -50',
        end: 99999,
        toggleClass: { className: 'capsule', targets: nav }
    });

    // Reveal Sections on Scroll
    // Reveal Sections on Scroll
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        // ... existing reveal logic if any, or just new logic ...
        gsap.fromTo(section.children, 
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.2,
                scrollTrigger: {
                    trigger: section,
                    start: "top 80%", // Trigger when top of section hits 80% viewport height
                    toggleActions: "play none none reverse"
                }
            }
        );
    });



}

// --- Form Logic ---
function initFormLogic() {
    const form = document.getElementById('enquiry-form');
    const modal = document.getElementById('success-modal');
    
    if(!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const btn = form.querySelector('button');
        const originalText = btn.innerHTML;
        btn.textContent = 'Sending...';
        
        // Create FormData object
        const formData = new FormData(form);

        // Fetch API for Netlify
        fetch('/', {
            method: 'POST',
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString()
        })
        .then(() => {
            // Success
            modal.style.display = 'flex';
            form.reset();
        })
        .catch((error) => {
            console.error('Form Submit Error:', error);
            // Show modal anyway for demo/fallback so user isn't stuck
            modal.style.display = 'flex'; 
        })
        .finally(() => {
            btn.innerHTML = originalText;
        });
    });
}
