const copy = {
  navMenu: "Menu", navStory: "Our story", navVisit: "Visit", navOrder: "Order pickup",
  heroTitle: "Nature-picked tea,<br>crafted fresh.",
  orderPickup: "Order for pickup",
  intro: "From mountain-grown tea to garden-fresh fruit,<br>we find pleasure in the small details of a well-made drink.",
  menuEyebrow: "The menu", fruitTitle: "Mountain & Garden", fruitIntro: "Fruit, vegetables, tea and a little curiosity. Bright flavors with room to breathe.",
  fruitListKicker: "Fruit & vegetable series",
  quoteEyebrow: "A little ritual", quote: "A pause in the day.<br>A cup made with intention.",
  handmadeEyebrow: "The menu", handmadeTitle: "    Heritage Craft",
  mibuQuestion: "What is MIBU?",
  mibuDescription: "MIBU is a traditional Yunnan dessert made primarily from milk and rice flour (or rice). It is a specialty snack of Kunming.",
  handmadeIntro: "<span class='mibu-ring'>MIBU</span><span>Hand-pounded. Soft, dense and comforting.</span>",
  handmadeListKicker: "Heritage Craft series",
  reelLabel: "", reelCta: "",
  brewEyebrow: "The menu", brewTitle: "Original brews",
  brewIntro: "Tea first, milk in harmony.",
  storyEyebrow: "Our story", storySide: "A little closer to nature",
  storyTitle: "Tea for everyday life.",
  storyBody: "Monta carefully selects its ingredients and prepares each drink by hand, bringing Eastern tea traditions into the easy rhythm of a Jersey City café. We believe in flavor that feels fresh, familiar and worth returning to. Monta is more than a drink. It is an expression of Eastern living aesthetics, carefully made for everyday moments.",
  visitEyebrow: "Find us in Jersey City", visitTitle: "Come by for tea.", visitLede: "A fresh cup is never far away.",
  addressLabel: "Address", hoursLabel: "Hours", hoursValue: "Daily · 11:00 AM–10:00 PM",
  directions: "Get directions", pickupLink: "Order pickup on Toast",
  footerLine: "Nature-picked tea, crafted fresh in Jersey City."
};

const products = {
  fruit: [
    ["Little Green Bottle", "Kale, green apple and jasmine tea; crisp, grassy and gently floral."],
    ["Little Red Bottle", "Beetroot and apple, with an earthy sweetness and a bright finish."],
    ["Little Yellow Bottle", "Carrot, orange and jasmine tea; softly citrusy with a fragrant tea note."],
    ["Fragrant Rice Tea Lemonade", "Fragrant rice leaf tea and fresh lime, aromatic and lively."],
    ["Grape Camellia Iced Tea", "Juicy grape meets the delicate aroma of camellia tea."],
    ["Blueberry & Yam Velvet", "Blueberry brightness in a smooth, velvety yam blend."],
    ["Avocado & Kale Yogurt Smoothie", "Creamy yogurt, mellow avocado and the fresh green character of kale."]
  ],
  handmade: [
    ["Fragrant Rice MIBU", "Hand-pounded into a soft, dense texture with the mellow scent of fragrant rice."],
    ["Jasmine Green MIBU", "A comforting, hand-pounded cup lifted by jasmine green tea."],
    ["Rose Golden Black Tea MIBU", "Soft MIBU with floral rose and the rounded warmth of golden black tea."],
    ["Brown Sugar Boba with Fresh Milk", "Slow-cooked brown sugar pearls in fresh milk; rich, chewy and comforting."]
  ],
  brew: [
    ["Camellia Tea Latte", "Delicate camellia aroma balanced with the softness of milk."],
    ["Fragrant Rice Tea Latte", "A toasty, fragrant rice-leaf tea note in a mellow milk tea."],
    ["Jasmine Green Tea Latte", "Fresh jasmine fragrance with a light, creamy finish."],
    ["Golden Black Tea Latte", "A fuller black tea character, rounded by rich milk."]
  ]
};

function renderProducts() {
  for (const [section, items] of Object.entries(products)) {
    const container = document.getElementById(section + "-items");
    container.replaceChildren(...items.map(([name, description]) => {
      const article = document.createElement("article");
      article.className = "product";
      const content = document.createElement("div");
      const heading = document.createElement("h3");
      heading.textContent = name;
      const detail = document.createElement("p");
      detail.textContent = description;
      content.append(heading, detail);
      article.append(content);
      return article;
    }));
  }
}

for (const element of document.querySelectorAll("[data-i18n]")) {
  element.innerHTML = copy[element.dataset.i18n];
}
renderProducts();

const header = document.querySelector(".site-header");
const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const finePointer = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
if (finePointer.matches) {
  const cursor = document.querySelector(".site-cursor");
  document.documentElement.classList.add("cursor-ready");
  document.addEventListener("pointermove", event => {
    if (event.pointerType !== "mouse") return;
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    cursor.classList.add("is-visible");
    cursor.classList.toggle("is-active", Boolean(event.target.closest("a, button")));
  }, { passive: true });
  document.addEventListener("pointerdown", event => {
    if (event.pointerType === "mouse") cursor.classList.add("is-pressed");
  });
  document.addEventListener("pointerup", () => cursor.classList.remove("is-pressed"));
  document.addEventListener("pointercancel", () => cursor.classList.remove("is-pressed"));
  document.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));
  window.addEventListener("blur", () => cursor.classList.remove("is-visible"));
}
