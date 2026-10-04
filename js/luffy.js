(function () {
    "use strict";

    const stage = document.querySelector("[data-arm-stage]");
    const hotspot = document.querySelector("[data-arm-hotspot]");
    const armOverlay = document.querySelector("[data-arm-overlay]");
    const page = document.querySelector(".luffy-page");
    const main = document.querySelector(".luffy-main");
    const gearButton = document.querySelector("[data-gear-trigger]");

    if (!stage || !hotspot || !armOverlay) return;

    const paths = {
        outline: armOverlay.querySelector("[data-overlay-outline]"),
        sleeve: armOverlay.querySelector("[data-overlay-sleeve]"),
        skin: armOverlay.querySelector("[data-overlay-skin]"),
        cuffOutline: armOverlay.querySelector("[data-overlay-cuff-outline]"),
        cuff: armOverlay.querySelector("[data-overlay-cuff]"),
        root: armOverlay.querySelector("[data-overlay-root]"),
        fist: armOverlay.querySelector("[data-overlay-fist]")
    };
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false;
    let activePointer = null;
    let hasMoved = false;
    let pointerStart = null;
    let target = null;
    let returnFrame = 0;
    let tapTimer = 0;
    let effectTimer = 0;

    function getOrigin() {
        const bounds = stage.getBoundingClientRect();
        return { x: bounds.left + bounds.width * 0.51, y: bounds.top + bounds.height * 0.48 };
    }

    function getDefaultReach(origin) {
        return {
            x: Math.max(16, origin.x - Math.min(330, window.innerWidth * 0.36)),
            y: Math.max(24, origin.y - Math.min(150, window.innerHeight * 0.2))
        };
    }

    function quadraticPoint(start, control, end, t) {
        const inverse = 1 - t;
        return {
            x: inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
            y: inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * end.y
        };
    }

    function setPath(path, start, control, end, from = 0, to = 1) {
        const first = quadraticPoint(start, control, end, from);
        const last = quadraticPoint(start, control, end, to);
        const middle = quadraticPoint(start, control, end, (from + to) / 2);
        const localControl = {
            x: 2 * middle.x - (first.x + last.x) / 2,
            y: 2 * middle.y - (first.y + last.y) / 2
        };
        path.setAttribute("d", `M ${first.x} ${first.y} Q ${localControl.x} ${localControl.y} ${last.x} ${last.y}`);
    }

    function drawArm(point) {
        const origin = getOrigin();
        const end = {
            x: Math.max(-25, Math.min(window.innerWidth + 25, point.x)),
            y: Math.max(-25, Math.min(window.innerHeight + 25, point.y))
        };
        const dx = end.x - origin.x;
        const dy = end.y - origin.y;
        const length = Math.hypot(dx, dy);
        const bend = Math.min(76, length * 0.13);
        const control = { x: (origin.x + end.x) / 2 - (dy / (length || 1)) * bend, y: (origin.y + end.y) / 2 + (dx / (length || 1)) * bend };
        const sleeveEnd = Math.min(.58, Math.max(.2, 1 - 72 / (length || 1)));
        const cuffCenter = quadraticPoint(origin, control, end, sleeveEnd);
        const normal = { x: -dy / (length || 1), y: dx / (length || 1) };

        armOverlay.setAttribute("viewBox", `0 0 ${window.innerWidth} ${window.innerHeight}`);
        setPath(paths.outline, origin, control, end);
        setPath(paths.sleeve, origin, control, end, 0, sleeveEnd + .015);
        setPath(paths.skin, origin, control, end, Math.max(0, sleeveEnd - .01), .98);
        paths.cuffOutline.setAttribute("d", `M ${cuffCenter.x - normal.x * 29} ${cuffCenter.y - normal.y * 29} L ${cuffCenter.x + normal.x * 29} ${cuffCenter.y + normal.y * 29}`);
        paths.cuff.setAttribute("d", `M ${cuffCenter.x - normal.x * 23} ${cuffCenter.y - normal.y * 23} L ${cuffCenter.x + normal.x * 23} ${cuffCenter.y + normal.y * 23}`);
        paths.root.setAttribute("cx", origin.x);
        paths.root.setAttribute("cy", origin.y);
        paths.fist.setAttribute("transform", `translate(${end.x} ${end.y}) rotate(${Math.atan2(dy, dx) * 180 / Math.PI})`);
        target = end;
        armOverlay.classList.add("is-visible");
    }

    function pointerPoint(event) {
        return { x: event.clientX, y: event.clientY };
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

    function returnArm() {
        window.clearTimeout(tapTimer);
        if (!target || reducedMotion) {
            armOverlay.classList.remove("is-visible");
            target = null;
            return;
        }
        window.cancelAnimationFrame(returnFrame);
        function easeBack() {
            const currentOrigin = getOrigin();
            target.x = currentOrigin.x + (target.x - currentOrigin.x) * .72;
            target.y = currentOrigin.y + (target.y - currentOrigin.y) * .72;
            drawArm(target);
            if (Math.hypot(target.x - currentOrigin.x, target.y - currentOrigin.y) < 3) {
                armOverlay.classList.remove("is-visible");
                target = null;
                return;
            }
            returnFrame = window.requestAnimationFrame(easeBack);
        }
        returnFrame = window.requestAnimationFrame(easeBack);
    }

    hotspot.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        activePointer = event.pointerId;
        hasMoved = false;
        pointerStart = pointerPoint(event);
        window.clearTimeout(tapTimer);
        window.cancelAnimationFrame(returnFrame);
        hotspot.setPointerCapture(event.pointerId);
        triggerGearEffect();
        drawArm(getDefaultReach(getOrigin()));
    });

    hotspot.addEventListener("pointermove", (event) => {
        if (activePointer !== event.pointerId) return;
        if (Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 10) hasMoved = true;
        drawArm(pointerPoint(event));
    });

    function finishPointer(event) {
        if (activePointer !== event.pointerId) return;
        activePointer = null;
        pointerStart = null;
        if (hasMoved) returnArm();
        else tapTimer = window.setTimeout(returnArm, 420);
    }

    hotspot.addEventListener("pointerup", finishPointer);
    hotspot.addEventListener("pointercancel", finishPointer);
    hotspot.addEventListener("lostpointercapture", finishPointer);
    hotspot.addEventListener("click", (event) => {
        if (event.detail !== 0) return;
        triggerGearEffect();
        drawArm(getDefaultReach(getOrigin()));
        tapTimer = window.setTimeout(returnArm, 420);
    });
    gearButton?.addEventListener("click", triggerGearEffect);
    window.addEventListener("resize", () => {
        if (target && activePointer === null) drawArm(target);
    });
}());
