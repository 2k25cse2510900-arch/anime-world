(function () {
    "use strict";

    const page = document.body;
    const status = document.querySelector("[data-effect-status]");
    const fireball = document.querySelector("[data-fireball]");
    const portrait = document.querySelector("[data-itachi-portrait]");
    const backgroundAudio = document.querySelector("[data-background-audio]");
    const loadedAssets = new Set();
    const pendingAssets = new Map();
    let effectVersion = 0;
    // Entry and Fireball timers allow their full natural GIF cycles to play.
    const abilities = {
        amaterasu: { className: "is-amaterasu", asset: "image/itachiblackflames.gif", message: "Amaterasu — the black flames rise and fade.", duration: 2900 },
        fireball: { className: "is-fireball", asset: "image/itachifireball.gif", message: "Fireball Jutsu — the fireball crosses the scene.", duration: 5520 },
        mangekyou: { className: "is-mangekyou", asset: "image/itachieye.gif", message: "Mangekyou Sharingan — the eye opens, then fades.", duration: 3000 },
        entry: { className: "is-entry", asset: "image/itachimoon.gif", message: "Mangekyou Entry — the full moonlit GIF plays.", duration: 13260 },
        genjutsu: { className: "is-genjutsu", asset: "image/genjutsu.gif", message: "Genjutsu visual activated.", duration: 5400 },
        susano: { className: "is-susano", asset: "image/susano.gif", message: "Susano visual activated.", duration: 5400 }
    };
    const soundPaths = { amaterasu: "sounds/fire.mp3", mangekyou: "sounds/sharingan.mp3", fireball: "sounds/explosion.mp3", entry: "sounds/itachi-entry.mp3", genjutsu: "sounds/genjutsu.mp3", susano: "sounds/susano.mp3" };
    const activeSound = document.querySelector("[data-ability-audio]");
    let effectTimer;

    if (backgroundAudio) {
        backgroundAudio.volume = 0.3;
        const retryBackgroundAudio = () => {
            document.removeEventListener("pointerdown", retryBackgroundAudio);
            document.removeEventListener("keydown", retryBackgroundAudio);
            backgroundAudio.play().catch(() => {});
        };
        backgroundAudio.play().catch(() => {
            document.addEventListener("pointerdown", retryBackgroundAudio, { once: true });
            document.addEventListener("keydown", retryBackgroundAudio, { once: true });
        });
    }

    function resetEffects() {
        window.clearTimeout(effectTimer);
        effectVersion += 1;
        Object.values(abilities).forEach(({ className }) => page.classList.remove(className));
        page.classList.remove("is-effect-active", "is-effect-ready");
        document.querySelector('[data-ability="mangekyou"]')?.setAttribute("aria-pressed", "false");
    }

    function playSound(name) {
        if (!activeSound) return;
        activeSound.pause();
        activeSound.currentTime = 0;
        activeSound.src = soundPaths[name];
        activeSound.volume = 0.45;
        activeSound.play().catch(() => {});
    }

    function waitForAsset(asset, callback) {
        if (loadedAssets.has(asset)) {
            callback();
            return;
        }

        const pending = pendingAssets.get(asset);
        if (pending) {
            pending.callback = callback;
            return;
        }

        const image = new Image();
        const request = { image, callback };
        pendingAssets.set(asset, request);
        const finish = (loaded) => {
            if (loaded) loadedAssets.add(asset);
            pendingAssets.delete(asset);
            request.callback();
        };
        image.onload = () => finish(true);
        image.onerror = () => finish(false);
        image.src = asset;
    }

    function runEffect(name) {
        const effect = abilities[name];
        if (!effect) return;

        resetEffects();
        playSound(name);
        const thisEffectVersion = effectVersion;
        // Commit the reset before adding the class so the same effect can replay immediately.
        void page.offsetWidth;
        if (name === "fireball" && portrait && fireball) {
            const bounds = portrait.getBoundingClientRect();
            const startX = `${bounds.left + bounds.width / 2}px`;
            const startY = `${bounds.top + bounds.height / 2}px`;
            fireball.style.setProperty("--fire-start-x", startX);
            fireball.style.setProperty("--fire-start-y", startY);
            // Recreate the image node so repeated activations restart the GIF at frame one.
            const currentImage = fireball.querySelector(".itachi-fireball-gif");
            if (currentImage) {
                const restartedImage = currentImage.cloneNode(false);
                currentImage.replaceWith(restartedImage);
                restartedImage.src = effect.asset;
            }
        }

        page.classList.add("is-effect-active", effect.className);
        if (name === "mangekyou") {
            document.querySelector('[data-ability="mangekyou"]')?.setAttribute("aria-pressed", "true");
        }
        if (status) status.textContent = effect.message;

        const finishEffect = () => {
            if (thisEffectVersion !== effectVersion) return;
            resetEffects();
            if (name === "mangekyou" && activeSound) {
                activeSound.pause();
                activeSound.currentTime = 0;
            }
            if (status) status.textContent = "";
        };
        // Start Sharingan's three-second display interval at the click, not after image loading.
        if (name === "mangekyou") {
            effectTimer = window.setTimeout(finishEffect, effect.duration);
        }

        const startEffect = () => {
            if (thisEffectVersion !== effectVersion) return;
            page.classList.add("is-effect-ready");
            if (name !== "mangekyou") {
                effectTimer = window.setTimeout(finishEffect, effect.duration);
            }
        };
        if (effect.asset) waitForAsset(effect.asset, startEffect);
        else startEffect();
    }

    document.querySelectorAll("[data-ability]").forEach((button) => {
        button.addEventListener("click", () => runEffect(button.dataset.ability));
    });
}());
