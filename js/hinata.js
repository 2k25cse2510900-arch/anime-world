(function () {
    "use strict";

    const page = document.body;
    const status = document.querySelector("[data-hinata-status]");
    const portrait = document.querySelector("[data-hinata-portrait]");
    const byakuganButton = document.querySelector('[data-hinata-action="byakugan"]');
    const petalsMessage = "A quiet moment — petals drift across the scene.";
    const byakuganMessage = "Byakugan mode active — returning to normal in 2 seconds.";
    let petalsTimer;
    let byakuganTimer;

    function updateEffectLayer() {
        const active = page.classList.contains("is-byakugan") || page.classList.contains("is-petals");
        page.classList.toggle("is-hinata-active", active);
    }

    function activateByakugan() {
        window.clearTimeout(byakuganTimer);
        page.classList.remove("is-byakugan");
        // Restart the existing Byakugan transitions when activated again.
        void page.offsetWidth;
        page.classList.add("is-byakugan");
        byakuganButton?.setAttribute("aria-pressed", "true");
        updateEffectLayer();
        if (status) status.textContent = byakuganMessage;

        byakuganTimer = window.setTimeout(() => {
            page.classList.remove("is-byakugan");
            byakuganButton?.setAttribute("aria-pressed", "false");
            updateEffectLayer();
            if (status?.textContent === byakuganMessage) {
                status.textContent = page.classList.contains("is-petals") ? petalsMessage : "";
            }
        }, 2000);
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
