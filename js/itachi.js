(function () {
    "use strict";

    const page = document.body;
    const status = document.querySelector("[data-effect-status]");
    const fireball = document.querySelector("[data-fireball]");
    const portrait = document.querySelector("[data-itachi-portrait]");
    const loadedAssets = new Set();
    const pendingAssets = new Map();
    let effectVersion = 0;
    // Entry and Fireball timers allow their full natural GIF cycles to play.
    const abilities = {
        amaterasu: { className: "is-amaterasu", asset: "image/itachiblackflames.gif", message: "Amaterasu — the black flames rise and fade.", duration: 2900 },
        fireball: { className: "is-fireball", asset: "image/itachifireball.gif", message: "Fireball Jutsu — the fireball crosses the scene.", duration: 5520 },
        mangekyou: { className: "is-mangekyou", asset: "image/itachieye.gif", message: "Mangekyou Sharingan — the eye opens, then fades.", duration: 1000 },
        entry: { className: "is-entry", asset: "image/itachimoon.gif", message: "Mangekyou Entry — the full moonlit GIF plays.", duration: 13260 }
    };
    let effectTimer;

    function resetEffects() {
        window.clearTimeout(effectTimer);
        effectVersion += 1;
        Object.values(abilities).forEach(({ className }) => page.classList.remove(className));
        page.classList.remove("is-effect-active", "is-effect-ready");
        document.querySelector('[data-ability="mangekyou"]')?.setAttribute("aria-pressed", "false");
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
            if (status) status.textContent = "";
        };
        // Start Sharingan's one-second display interval at the click, not after image loading.
        if (name === "mangekyou") {
            effectTimer = window.setTimeout(finishEffect, effect.duration);
        }

        waitForAsset(effect.asset, () => {
            if (thisEffectVersion !== effectVersion) return;
            page.classList.add("is-effect-ready");
            if (name !== "mangekyou") {
                effectTimer = window.setTimeout(finishEffect, effect.duration);
            }
        });
    }

    document.querySelectorAll("[data-ability]").forEach((button) => {
        button.addEventListener("click", () => runEffect(button.dataset.ability));
    });
}());
