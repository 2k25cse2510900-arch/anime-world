(function () {
    "use strict";

    const stage = document.querySelector("[data-arm-stage]");
    const hotspot = document.querySelector("[data-arm-hotspot]");
    const armOverlay = document.querySelector("[data-arm-overlay]");
    const page = document.querySelector(".luffy-page");
    const main = document.querySelector(".luffy-main");
    const gearButton = document.querySelector("[data-gear-trigger]");
    const backgroundAudio = document.querySelector("[data-luffy-audio]");
    const laughAudio = document.querySelector("[data-luffy-laugh]");
    const punchAudio = document.querySelector("[data-punch-audio]");

    let audioMode = "NORMAL_LUFFY";
    let punchAnimationDone = false;
    let punchAudioDone = false;
    let audioGestureFallbackActive = false;

    function removeAudioGestureFallback() {
        if (!audioGestureFallbackActive) return;
        window.removeEventListener("pointerdown", resumeNormalAudioAfterGesture);
        window.removeEventListener("keydown", resumeNormalAudioAfterGesture);
        audioGestureFallbackActive = false;
    }

    function resumeNormalAudioAfterGesture() {
        if (audioMode === "PUNCH") return;
        playNormalTrack(audioMode);
    }

    function enableAudioGestureFallback() {
        if (audioGestureFallbackActive) return;
        window.addEventListener("pointerdown", resumeNormalAudioAfterGesture);
        window.addEventListener("keydown", resumeNormalAudioAfterGesture);
        audioGestureFallbackActive = true;
    }

    function playNormalTrack(mode) {
        if (!backgroundAudio || !laughAudio || audioMode === "PUNCH") return;
        audioMode = mode;
        const active = mode === "NORMAL_LAUGH" ? laughAudio : backgroundAudio;
        const inactive = active === laughAudio ? backgroundAudio : laughAudio;
        inactive.pause();
        if (active.ended) active.currentTime = 0;
        const playback = active.play();
        playback?.then(() => removeAudioGestureFallback()).catch(enableAudioGestureFallback);
    }

    function startNormalAudioCycle(firstMode = "NORMAL_LUFFY") {
        if (audioMode === "PUNCH") return;
        audioMode = firstMode;
        playNormalTrack(firstMode);
    }

    function finishPunchAudioHandoff() {
        if (audioMode !== "PUNCH" || !punchAnimationDone || !punchAudioDone) return;
        if (punchAudio) punchAudio.pause();
        punchActive = false;
        audioMode = "NORMAL_LAUGH";
        startNormalAudioCycle("NORMAL_LAUGH");
    }

    function pauseNormalAudioForPunch() {
        audioMode = "PUNCH";
        backgroundAudio?.pause();
        laughAudio?.pause();
        punchAnimationDone = false;
        punchAudioDone = false;
    }

    backgroundAudio?.addEventListener("ended", () => {
        if (audioMode === "NORMAL_LUFFY") playNormalTrack("NORMAL_LAUGH");
    });
    laughAudio?.addEventListener("ended", () => {
        if (audioMode === "NORMAL_LAUGH") playNormalTrack("NORMAL_LUFFY");
    });
    punchAudio?.addEventListener("ended", () => {
        punchAudioDone = true;
        finishPunchAudioHandoff();
    });

    if (backgroundAudio && laughAudio) {
        backgroundAudio.volume = 0.35;
        laughAudio.volume = 0.58;
        startNormalAudioCycle();
    }

    if (!stage || !hotspot || !armOverlay) return;

    const paths = {
        trails: [...armOverlay.querySelectorAll("[data-arm-trail]")],
        outline: armOverlay.querySelector("[data-overlay-outline]"),
        sleeve: armOverlay.querySelector("[data-overlay-sleeve]"),
        skin: armOverlay.querySelector("[data-overlay-skin]"),
        cuffOutline: armOverlay.querySelector("[data-overlay-cuff-outline]"),
        cuff: armOverlay.querySelector("[data-overlay-cuff]"),
        fist: armOverlay.querySelector("[data-overlay-fist]"),
        impact: armOverlay.querySelector("[data-impact-effect]"),
        impactRing: armOverlay.querySelector("[data-impact-ring]"),
        impactSparks: [...armOverlay.querySelectorAll("[data-impact-spark]")]
    };
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false;
    let punchFrame = 0;
    let punchActive = false;
    let impactTimer = 0;
    let effectTimer = 0;

    function getOrigin() {
        const bounds = stage.getBoundingClientRect();
        return { x: bounds.left + bounds.width * 0.73, y: bounds.top + bounds.height * 0.38 };
    }

    function getPunchTarget(event, origin) {
        const clickX = Number.isFinite(event?.clientX) ? event.clientX : 0;
        const clickY = Number.isFinite(event?.clientY) ? event.clientY : 0;
        let dx = clickX - origin.x;
        let dy = clickY - origin.y;
        let distance = Math.hypot(dx, dy);
        if (distance < 1) {
            dx = 1;
            dy = -.16;
            distance = 1;
        }
        const minDistance = Math.max(110, stage.getBoundingClientRect().width * .42);
        if (distance < minDistance) distance = minDistance;
        const direction = { x: dx / Math.hypot(dx, dy), y: dy / Math.hypot(dx, dy) };
        return { x: origin.x + direction.x * distance, y: origin.y + direction.y * distance, direction, distance };
    }

    function drawArm(progress, target) {
        const origin = getOrigin();
        armOverlay.setAttribute("viewBox", `0 0 ${window.innerWidth} ${window.innerHeight}`);
        const width = Math.max(17, Math.min(49, stage.getBoundingClientRect().width * .095));
        const fistLead = width * 1.12;
        const distance = Math.max(0, target.distance * progress - fistLead);
        const end = { x: origin.x + target.direction.x * distance, y: origin.y + target.direction.y * distance };
        const normal = { x: -target.direction.y, y: target.direction.x };
        const bend = Math.min(38, distance * .055);
        const control = { x: (origin.x + end.x) / 2 - normal.x * bend, y: (origin.y + end.y) / 2 - normal.y * bend };
        const pointAt = (t) => ({
            x: (1 - t) ** 2 * origin.x + 2 * (1 - t) * t * control.x + t ** 2 * end.x,
            y: (1 - t) ** 2 * origin.y + 2 * (1 - t) * t * control.y + t ** 2 * end.y
        });
        const widthAt = (t) => width * (.9 + .12 * Math.sin(Math.PI * t) - .18 * t);
        const ribbon = (from, to, scale = 1) => {
            const upper = [];
            const lower = [];
            const steps = 18;
            for (let i = 0; i <= steps; i += 1) {
                const t = from + (to - from) * i / steps;
                const point = pointAt(t);
                const tangentX = 2 * (1 - t) * (control.x - origin.x) + 2 * t * (end.x - control.x);
                const tangentY = 2 * (1 - t) * (control.y - origin.y) + 2 * t * (end.y - control.y);
                const length = Math.hypot(tangentX, tangentY) || 1;
                const half = widthAt(t) * scale / 2;
                const nx = -tangentY / length;
                const ny = tangentX / length;
                upper.push(`${point.x + nx * half},${point.y + ny * half}`);
                lower.push(`${point.x - nx * half},${point.y - ny * half}`);
            }
            return `M ${upper.join(" L ")} L ${lower.reverse().join(" L ")} Z`;
        };
        const cuff = pointAt(.58);
        paths.outline.setAttribute("d", ribbon(0, 1, 1.16));
        paths.sleeve.setAttribute("d", ribbon(0, .6, 1));
        paths.skin.setAttribute("d", ribbon(.56, 1, .98));
        paths.trails.forEach((trail, index) => {
            const offset = (index - 1) * width * .72;
            trail.setAttribute("d", `M ${origin.x + normal.x * offset} ${origin.y + normal.y * offset} Q ${control.x + normal.x * offset} ${control.y + normal.y * offset} ${end.x + normal.x * offset} ${end.y + normal.y * offset}`);
        });
        paths.cuffOutline.setAttribute("d", `M ${cuff.x} ${cuff.y - widthAt(.58) * .52} L ${cuff.x} ${cuff.y + widthAt(.58) * .52}`);
        paths.cuff.setAttribute("d", `M ${cuff.x} ${cuff.y - widthAt(.58) * .42} L ${cuff.x} ${cuff.y + widthAt(.58) * .42}`);
        const angle = Math.atan2(target.direction.y, target.direction.x) * 180 / Math.PI;
        paths.fist.setAttribute("transform", `translate(${end.x} ${end.y}) rotate(${angle}) scale(${width / 42})`);
        armOverlay.classList.add("is-visible");
    }

    function burstAt(target, progress = 0) {
        const radius = 7 + progress * 28;
        paths.impactRing.setAttribute("cx", target.x);
        paths.impactRing.setAttribute("cy", target.y);
        paths.impactRing.setAttribute("r", radius);
        paths.impactRing.style.opacity = String(1 - progress);
        const angles = [-2.7, -1.85, -.75, .2, 1.25, 2.45];
        paths.impactSparks.forEach((spark, index) => {
            const reach = (9 + (index % 3) * 5) * progress;
            spark.setAttribute("cx", target.x + Math.cos(angles[index]) * reach);
            spark.setAttribute("cy", target.y + Math.sin(angles[index]) * reach);
            spark.style.opacity = String(1 - progress);
        });
        paths.impact.classList.add("is-active");
    }

    function playPunchSound() {
        if (!punchAudio) {
            punchAudioDone = true;
            finishPunchAudioHandoff();
            return;
        }
        punchAudio.pause();
        punchAudio.currentTime = 0;
        punchAudio.volume = .62;
        punchAudio.play().catch(() => {
            punchAudioDone = true;
            finishPunchAudioHandoff();
        });
    }

    function triggerGearEffect() {
        page.classList.remove("gear-boost");
        main.classList.remove("gear-bump");
        void main.offsetWidth;
        page.classList.add("gear-boost");
        main.classList.add("gear-bump");
        window.clearTimeout(effectTimer);
        effectTimer = window.setTimeout(() => {
            page.classList.remove("gear-boost");
            main.classList.remove("gear-bump");
        }, 1700);
    }

    function animatePunch(event) {
        if (punchActive) return;
        punchActive = true;
        pauseNormalAudioForPunch();
        window.cancelAnimationFrame(punchFrame);
        triggerGearEffect();
        stage.classList.add("is-punching");
        const origin = getOrigin();
        const target = getPunchTarget(event, origin);
        const startedAt = performance.now();
        const duration = reducedMotion ? 560 : 1040;
        const anticipationEnd = .11;
        const impactPhase = .43;
        const impactEnd = .56;
        let impactPlayed = false;
        function step(now) {
            const phase = Math.min(1, (now - startedAt) / duration);
            let progress;
            if (phase < anticipationEnd) {
                const t = phase / anticipationEnd;
                progress = .015 + .012 * Math.sin(Math.PI * t);
            } else if (phase < impactPhase) {
                const t = (phase - anticipationEnd) / (impactPhase - anticipationEnd);
                const c = 1.45;
                progress = 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2;
                progress = Math.max(0, progress);
            } else {
                if (!impactPlayed) {
                    impactPlayed = true;
                    playPunchSound();
                    main.classList.remove("is-impacting");
                    void main.offsetWidth;
                    main.classList.add("is-impacting");
                    paths.fist.classList.remove("is-striking");
                    void paths.fist.getBBox();
                    paths.fist.classList.add("is-striking");
                    window.clearTimeout(impactTimer);
                    impactTimer = window.setTimeout(() => {
                        paths.fist.classList.remove("is-striking");
                        main.classList.remove("is-impacting");
                    }, 190);
                }
                if (phase < impactEnd) {
                    progress = 1.045 - .025 * ((phase - impactPhase) / (impactEnd - impactPhase));
                    burstAt(target, (phase - impactPhase) / (impactEnd - impactPhase));
                } else {
                    paths.impact.classList.remove("is-active");
                    const t = (phase - impactEnd) / (1 - impactEnd);
                    progress = Math.max(0, 1.02 * (1 - t) + .08 * Math.sin(t * Math.PI * 2) * (1 - t));
                }
            }
            drawArm(progress, target);
            if (phase < 1) {
                punchFrame = window.requestAnimationFrame(step);
            } else {
                armOverlay.classList.remove("is-visible");
                paths.impact.classList.remove("is-active");
                stage.classList.remove("is-punching");
                main.classList.remove("is-impacting");
                paths.fist.classList.remove("is-striking");
                window.clearTimeout(impactTimer);
                punchAnimationDone = true;
                finishPunchAudioHandoff();
            }
        }
        punchFrame = window.requestAnimationFrame(step);
    }

    hotspot.addEventListener("click", animatePunch);
    gearButton?.addEventListener("click", animatePunch);
}());
