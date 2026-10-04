/* Values live here once. Characters connect to them with valueIds. */
window.ANIME_VALUES = [
    { id: "freedom", name: "Freedom" },
    { id: "perseverance", name: "Perseverance" },
    { id: "care", name: "Care" },
    { id: "joy", name: "Joy" },
    { id: "courage", name: "Courage" },
    { id: "dreams", name: "Dreams" },
    { id: "duty", name: "Duty" },
    { id: "sacrifice", name: "Sacrifice" },
    { id: "reflection", name: "Reflection" },
    { id: "confidence", name: "Confidence" }
];

/* Character profiles connect to the shared value list by ID. */
window.ANIME_CHARACTERS = [
    {
        id: "luffy",
        name: "Monkey D. Luffy",
        animeName: "One Piece",
        image: "image/luffy.jpg",
        imageWidth: 415,
        imageHeight: 737,
        heroImage: "image/Luffy.png",
        heroWidth: 670,
        heroHeight: 1191,
        alt: "Monkey D. Luffy wearing his straw hat",
        description: "Captain of the Straw Hat Pirates chasing the One Piece.",
        intro: "The character who reminds me to live freely, smile through difficult moments, protect others, and keep chasing my dreams.",
        valueIds: ["freedom", "perseverance", "care", "joy", "courage", "dreams"],
        admiration: [
            "Luffy is not just a character I admire. He represents the kind of person I want to become.",
            "I admire the way he lives his life with freedom, courage, and a smile. He does not allow fear to decide his path, and he never gives up on the dreams that matter to him.",
            "Whenever I think about the person I want to become, I think about Luffy."
        ],
        lessons: [
            { title: "Never Give Up", paragraphs: ["Whenever I feel sad because I lost or failed, I remember that losing once does not mean everything is over.", "As long as I am alive, there are still countless chances to try again."] },
            { title: "Keep Smiling", paragraphs: ["I want to have a smile like Luffy. Not because life is always easy, but because I don't want difficult moments to take away my happiness.", "I want to learn from the past without living in the past. I want to enjoy the present and experience every moment of my life."] },
            { title: "Protect Others", paragraphs: ["Luffy reminds me that strength is not only about being powerful.", "I want to become someone who protects the people who are weaker, stands beside those who need help, and uses strength to help rather than hurt others."] },
            { title: "Freedom & Dreams", paragraphs: ["Luffy lives his life freely, and that is something I want for myself too.", "We only get one life. I don't want to spend mine being controlled by fear.", "I want to explore, experience, enjoy, take chances, and live in the present.", "And when it comes to my dreams, I want to have the same belief Luffy has.", "If I have a dream, I will chase it. I will not decide that something is impossible simply because it is difficult.", "Luffy says he will become the Pirate King, so he keeps moving toward it. I want to do the same with my own dreams.", "Nothing is impossible just because it is difficult. I will keep moving toward my goals without fear."] }
        ],
        personalReflection: [
            "Luffy is chasing the One Piece. I am chasing my own dreams.",
            "His journey reminds me that I should keep moving, even when I fail, even when I fall, and even when I feel afraid.",
            "I may lose. I may fail. I may fall. But as long as I am alive, there are still chances.",
            "So I will smile, live in the present, protect the people I care about, live freely, and keep chasing my dreams."
        ],
        video: "https://www.youtube-nocookie.com/embed/4Rb0PRxJcnM"
    },
    {
        id: "itachi",
        name: "Itachi Uchiha",
        animeName: null,
        image: "image/itachi.jpg",
        imageWidth: 415,
        imageHeight: 737,
        alt: "Portrait of Itachi Uchiha",
        description: "A complex rogue ninja whose choices and sacrifices invite reflection.",
        intro: "A character whose choices and sacrifices invite reflection.",
        valueIds: ["duty", "sacrifice", "reflection"],
        admiration: null,
        lessons: [
            { title: "Reflect on his story", paragraphs: ["Itachi's story raises difficult questions about duty, sacrifice, and the cost of choices made for others.", "Which of these ideas stands out to you? What would you want to understand better about the choices he made?"] }
        ],
        personalReflection: null
    },
    {
        id: "hinata",
        name: "Hinata Hyuga",
        animeName: null,
        image: "image/hinata.jpg",
        imageWidth: 736,
        imageHeight: 975,
        alt: "Portrait of Hinata Hyuga",
        description: "A gentle and determined shinobi whose story includes a journey toward confidence.",
        intro: "A gentle and determined shinobi whose story includes a journey toward confidence.",
        valueIds: ["courage", "perseverance", "confidence"],
        admiration: null,
        lessons: [
            { title: "Reflect on her story", paragraphs: ["Hinata's journey offers a chance to think about courage, persistence, and finding confidence in your own way.", "What helps you take a step forward when you feel unsure of yourself?"] }
        ],
        personalReflection: null
    }
];
