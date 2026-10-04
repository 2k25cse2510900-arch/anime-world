(function () {
    "use strict";

    function make(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }

    function makeLink(text, href, className = "") {
        const link = make("a", className, text);
        link.href = href;
        return link;
    }

    function getCharacterValues(character) {
        return character.valueIds.map((id) => window.ANIME_VALUES.find((value) => value.id === id)).filter(Boolean);
    }

    function createCharacterCard(character, featured = false) {
        const profileUrl = character.id === "itachi" ? "itachi.html" : character.id === "luffy" ? "luffy.html" : character.id === "hinata" ? "hinata.html" : `character.html?id=${encodeURIComponent(character.id)}`;
        const link = makeLink("", profileUrl, featured ? "featured-card" : "character-card");
        const image = make("img");
        image.src = character.image;
        image.alt = character.alt;
        image.width = character.imageWidth;
        image.height = character.imageHeight;
        image.loading = featured ? "lazy" : "eager";
        image.decoding = "async";

        const copy = make("div", featured ? "featured-overlay" : "card-copy");
        if (featured) {
            const values = getCharacterValues(character).map((value) => value.name).join(" · ");
            copy.append(make("span", "eyebrow", values), make("h3", "", character.name));
            copy.append(make("span", "", "Read my perspective →"));
        } else {
            copy.append(make("h2", "card-title", character.name));
            copy.append(make("span", "card-description", character.description));
            copy.append(make("span", "value-list", getCharacterValues(character).map((value) => value.name).join(" · ")));
            copy.append(make("span", "card-action", "Read my perspective →"));
        }

        link.append(image, copy);
        return link;
    }

    function renderFeaturedCharacters() {
        const grid = document.querySelector("[data-featured-grid]");
        if (!grid) return;
        grid.replaceChildren(...window.ANIME_CHARACTERS.slice(0, 3).map((character) => createCharacterCard(character, true)));
    }

    function renderCharacterDirectory() {
        const grid = document.querySelector("[data-character-grid]");
        if (!grid) return;
        grid.replaceChildren(...window.ANIME_CHARACTERS.map((character) => createCharacterCard(character)));
    }

    function addTextSection(parent, title, paragraphs, className = "") {
        if (!Array.isArray(paragraphs) || paragraphs.length === 0) return;
        const section = make("section", `reflection-section ${className}`.trim());
        section.append(make("h2", "", title));
        paragraphs.forEach((text) => section.append(make("p", "", text)));
        parent.append(section);
    }

    function renderCharacterDetail() {
        const root = document.querySelector("[data-character-detail]");
        if (!root) return;

        const characterId = new URLSearchParams(window.location.search).get("id");
        const character = window.ANIME_CHARACTERS.find((item) => item.id === characterId);
        if (!character) {
            document.title = "Character not found | Anime World";
            const message = make("div", "not-found");
            message.append(make("h1", "", "Character not found"));
            message.append(makeLink("Browse characters", "characters.html"));
            root.replaceChildren(message);
            return;
        }

        document.title = `${character.name} | Anime World`;
        const hero = make("section", `character-hero ${character.id === "luffy" ? "luffy-hero" : ""}`);
        hero.setAttribute("aria-labelledby", "character-title");
        const copy = make("div", "character-hero-copy");
        copy.append(make("p", "eyebrow", "Character"));
        const heading = make("h1", "", character.name);
        heading.id = "character-title";
        copy.append(heading);
        const image = make("img", "character-hero-image");
        image.src = character.heroImage || character.image;
        image.alt = character.alt;
        image.width = character.heroWidth || character.imageWidth;
        image.height = character.heroHeight || character.imageHeight;
        image.decoding = "async";
        image.fetchPriority = "high";
        hero.append(copy, image);

        const content = make("div", "content-wrap reflection-content");
        const values = getCharacterValues(character).map((value) => value.name);
        if (values.length) {
            const valueSection = make("section", "reflection-section");
            valueSection.append(make("h2", "", "Core Value"));
            const list = make("ul", "core-value-list");
            values.forEach((value) => list.append(make("li", "", value)));
            valueSection.append(list);
            content.append(valueSection);
        }

        addTextSection(content, "Why I Admire Them", character.admiration);
        const lessonSection = make("section", "reflection-section");
        lessonSection.append(make("h2", "", "Greatest Lesson"));
        (character.lessons || []).forEach((lesson) => {
            const article = make("article", "lesson-card");
            article.append(make("h3", "", lesson.title));
            (lesson.paragraphs || []).forEach((paragraph) => article.append(make("p", "", paragraph)));
            lessonSection.append(article);
        });
        if (character.lessons?.length) content.append(lessonSection);
        addTextSection(content, "My Reflection", character.personalReflection, "personal-reflection");
        content.append(makeLink("← Back to characters", "characters.html", "back-link"));

        root.replaceChildren(hero, content);
    }

    function initialize() {
        renderFeaturedCharacters();
        renderCharacterDirectory();
        renderCharacterDetail();
    }

    document.addEventListener("DOMContentLoaded", initialize);
}());
