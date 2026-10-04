(function () {
    "use strict";

    const page = document.body;
    const status = document.querySelector("[data-hinata-status]");
    const portrait = document.querySelector("[data-hinata-portrait]");
    const normalPortrait = portrait?.querySelector(".hinata-portrait-normal");
    const effectPortrait = portrait?.querySelector(".hinata-portrait-byakugan");
    const byakuganButton = document.querySelector('[data-hinata-action="byakugan"]');
    const byakuganAudio = document.querySelector("[data-byakugan-audio]");
    const petalsMessage = "A quiet moment — petals drift across the scene.";
    const byakuganMessage = "Hinata's Byakugan sequence is active.";
    let petalsTimer;
    let byakuganRunning = false;
    let nextByakuganSequence = "sage";
    let sequenceAudioContext;
    let activeSequenceSource;

    function updateEffectLayer() {
        const active = page.classList.contains("is-byakugan") || page.classList.contains("is-petals");
        page.classList.toggle("is-hinata-active", active);
    }

    function wait(ms) {
        return new Promise((resolve) => window.setTimeout(resolve, ms));
    }

    async function showEffectPortrait(src, viewportClasses = []) {
        if (viewportClasses.length && effectPortrait.classList.contains("is-viewport-overlay")) {
            effectPortrait.classList.add("is-viewport-pending");
        }
        effectPortrait.src = src;
        try {
            await effectPortrait.decode();
        } catch (_) {
            // Keep the interaction moving if an image cannot be decoded.
        }
        if (viewportClasses.length) {
            page.appendChild(effectPortrait);
            effectPortrait.classList.add("is-viewport-overlay", "is-viewport-pending");
            page.classList.add(...viewportClasses);
        }
    }

    function stopSequenceSound() {
        if (!activeSequenceSource) return;
        try {
            activeSequenceSource.stop();
        } catch (_) {
            // The source may already have ended.
        }
        activeSequenceSource = null;
    }

    async function playSequenceSound(src, durationMs, onStarted) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
            onStarted?.();
            if (durationMs) await wait(durationMs);
            return;
        }
        sequenceAudioContext ??= new AudioContextClass();
        await sequenceAudioContext.resume();
        const response = await fetch(src);
        const buffer = await sequenceAudioContext.decodeAudioData(await response.arrayBuffer());
        await new Promise((resolve) => {
            const source = sequenceAudioContext.createBufferSource();
            const gain = sequenceAudioContext.createGain();
            source.buffer = buffer;
            gain.gain.value = 0.45;
            source.connect(gain);
            gain.connect(sequenceAudioContext.destination);
            activeSequenceSource = source;
            source.addEventListener("ended", () => {
                if (activeSequenceSource === source) activeSequenceSource = null;
                if (!durationMs) resolve();
            }, { once: true });
            source.start();
            onStarted?.();
            if (durationMs) window.setTimeout(() => {
                if (activeSequenceSource === source) stopSequenceSound();
                resolve();
            }, durationMs);
        });
    }

    function restoreEffectPortrait() {
        effectPortrait.classList.remove("is-viewport-overlay", "is-viewport-pending");
        portrait.insertBefore(effectPortrait, portrait.querySelector(".hinata-eye-aura"));
    }

    async function activateByakugan() {
        if (byakuganRunning || !normalPortrait || !effectPortrait) return;
        byakuganRunning = true;
        if (byakuganButton) byakuganButton.disabled = true;
        byakuganButton?.setAttribute("aria-pressed", "true");
        page.classList.add("is-byakugan");
        if (byakuganAudio) {
            byakuganAudio.pause();
            byakuganAudio.currentTime = 0;
            byakuganAudio.volume = 0.45;
            byakuganAudio.play().catch(() => {});
        }
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            sequenceAudioContext ??= new AudioContextClass();
            sequenceAudioContext.resume().catch(() => {});
        }
        updateEffectLayer();
        if (status) status.textContent = byakuganMessage;

        try {
            if (nextByakuganSequence === "sage") {
                normalPortrait.src = "image/hinatabody.webp";
                await showEffectPortrait("image/hinatawoo.jpg");
                await wait(2000);
                await showEffectPortrait("image/naruto-sage-mode-jutsu.webp", ["is-fullscreen-visual"]);
                await playSequenceSound("sounds/naruto-sage.mp3", 5000, () => {
                    page.classList.add("is-sage-visual");
                    effectPortrait.classList.remove("is-viewport-pending");
                });
                page.classList.remove("is-sage-visual");
                await showEffectPortrait("image/naruto-screen-blast.gif", ["is-fullscreen-visual"]);
                await playSequenceSound("sounds/naruto-rasengan.mp3", undefined, () => effectPortrait.classList.remove("is-viewport-pending"));
                nextByakuganSequence = "kurama";
            } else {
                await showEffectPortrait("image/kurama.webp", ["is-fullscreen-visual"]);
                await playSequenceSound("sounds/kurama.mp3", undefined, () => {
                    page.classList.add("is-kurama-visual");
                    effectPortrait.classList.remove("is-viewport-pending");
                });
                nextByakuganSequence = "sage";
            }
        } finally {
            stopSequenceSound();
            byakuganAudio?.pause();
            if (byakuganAudio) byakuganAudio.currentTime = 0;
            normalPortrait.src = "image/hinatabody.webp";
            restoreEffectPortrait();
            page.classList.remove("is-byakugan", "is-fullscreen-visual", "is-sage-visual", "is-kurama-visual");
            byakuganButton?.setAttribute("aria-pressed", "false");
            if (byakuganButton) byakuganButton.disabled = false;
            updateEffectLayer();
            byakuganRunning = false;
            if (status?.textContent === byakuganMessage) {
                status.textContent = page.classList.contains("is-petals") ? petalsMessage : "";
            }
        }
    }

    function showPetals() {
        window.clearTimeout(petalsTimer);
        page.classList.remove("is-petals");
        // Reflow after removal so tapping again restarts the petal animation.
        void page.offsetWidth;
        page.classList.add("is-petals");
        updateEffectLayer();
        if (status) status.textContent = petalsMessage;

        petalsTimer = window.setTimeout(() => {
            page.classList.remove("is-petals");
            updateEffectLayer();
            if (status?.textContent === petalsMessage) status.textContent = "";
        }, 5400);
    }

    document.querySelectorAll("[data-hinata-action]").forEach((button) => {
        button.addEventListener("click", () => {
            if (button.dataset.hinataAction === "byakugan") activateByakugan();
            if (button.dataset.hinataAction === "petals") showPetals();
        });
    });

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (portrait && !reducedMotion && window.matchMedia?.("(pointer: fine)").matches) {
        portrait.addEventListener("pointermove", (event) => {
            if (event.pointerType !== "mouse") return;
            const bounds = portrait.getBoundingClientRect();
            const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 8;
            const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 8;
            portrait.style.setProperty("--parallax-x", `${x.toFixed(1)}px`);
            portrait.style.setProperty("--parallax-y", `${y.toFixed(1)}px`);
        });
        portrait.addEventListener("pointerleave", () => {
            portrait.style.setProperty("--parallax-x", "0px");
            portrait.style.setProperty("--parallax-y", "0px");
        });
    }
}());
