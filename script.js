import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBvbAGrsKPi0dd5reCvNevqoS_0AlnMzv8",
  authDomain: "bennana-4ffc7.firebaseapp.com",
  projectId: "bennana-4ffc7",
  storageBucket: "bennana-4ffc7.firebasestorage.app",
  messagingSenderId: "869412007335",
  appId: "1:869412007335:web:497b181881519dc484da82",
  measurementId: "G-FCXKRLMYNL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let activeCategory = "الكل";
let currentProduct = { name: "", price: "", phone: "", image: "", description: "" };

window.openLogin = function() {
  document.getElementById("loginModal").style.display = "flex";
}

window.closeLogin = function() {
  document.getElementById("loginModal").style.display = "none";
}

window.login = function() {
  const name = document.getElementById("loginName").value.trim();
  const trainingNumber = document.getElementById("trainingNumber").value.trim();
  const email = document.getElementById("loginEmail").value.trim();

  const user = { name, trainingNumber, email };
  localStorage.setItem("currentUser", JSON.stringify(user));
  alert("تم تسجيل الدخول بنجاح");
  closeLogin();
  updateLoginButton();
}

function updateLoginButton() {
  const button = document.querySelector(".login-btn");
  const savedUser = localStorage.getItem("currentUser");
  if (!button) return;
  if (savedUser) {
    const user = JSON.parse(savedUser);
    button.textContent = "مرحبًا " + user.name;
  } else {
    button.textContent = "تسجيل الدخول";
  }
}

window.scrollToProducts = function() {
  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
}

window.scrollToAdd = function() {
  document.getElementById("add").scrollIntoView({ behavior: "smooth" });
}

window.searchProducts = function() {
  applyFilters();
  scrollToProducts();
}

window.filterCategory = function(category) {
  activeCategory = category;
  applyFilters();
  scrollToProducts();
}

window.showAllProducts = function() {
  activeCategory = "الكل";
  document.getElementById("searchInput").value = "";
  applyFilters();
}

function applyFilters() {
  const search = document.getElementById("searchInput").value.trim().toLowerCase();
  const cards = document.querySelectorAll(".product-card");
  let count = 0;

  cards.forEach(card => {
    const name = card.querySelector("h3")?.textContent.toLowerCase() || "";
    const category = card.dataset.category || card.querySelector(".category")?.textContent || "";
    const searchMatch = name.includes(search);
    const categoryMatch = activeCategory === "الكل" || category.includes(activeCategory);

    if (searchMatch && categoryMatch) {
      card.style.display = "";
      count++;
    } else {
      card.style.display = "none";
    }
  });

  const noResults = document.getElementById("noResults");
  if (noResults) {
    noResults.style.display = count === 0 ? "block" : "none";
  }
}

window.openProduct = function(name, price, phone = "", image = "", description = "") {
  currentProduct = { name, price, phone, image, description };
  document.getElementById("modalProductName").textContent = name;
  document.getElementById("modalProductPrice").textContent = price + " ريال";
  document.getElementById("modalProductDescription").textContent = description;

  const imageBox = document.querySelector(".modal-product-image");
  if (image) {
    imageBox.innerHTML = "";
    const img = document.createElement("img");
    img.src = image;
    img.alt = name;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.style.borderRadius = "15px";
    imageBox.appendChild(img);
  } else {
    imageBox.textContent = "📦";
  }
  document.getElementById("productModal").style.display = "flex";
}

window.closeProduct = function() {
  document.getElementById("productModal").style.display = "none";
}

window.contactSeller = function() {
  if (!currentProduct.phone) {
    alert("رقم البائع غير متوفر لهذا المنتج");
    return;
  }
  window.location.href = "tel:" + currentProduct.phone;
}

window.suggestProductPrice = function() {
  const productName = document.getElementById("productName").value.trim();
  const category = document.getElementById("productCategory") ? document.getElementById("productCategory").value : "";
  const condition = document.getElementById("productCondition").value;
  const description = document.getElementById("productDescription") ? document.getElementById("productDescription").value.trim() : "";

  const promptText = `أنا طالبة في متجر "بيننا" وأريد اقتراح سعر مناسب بالريال السعودي لهذا المنتج:
- اسم المنتج: ${productName}
- القسم: ${category}
- الحالة: ${condition}
- الوصف: ${description}
كم برأيك السعر المناسب لعرضه؟`;

  const encodedPrompt = encodeURIComponent(promptText);
  window.open(`https://gemini.google.com/app?q=${encodedPrompt}`, "_blank");
}

// جلب المنتجات من قاعدة البيانات السحابية لعرضها للجميع فورياً
function loadProductsFromFirebase() {
  const container = document.getElementById("productsContainer");
  
  onSnapshot(collection(db, "products"), (snapshot) => {
    // إزالة المنتجات الديناميكية القديمة لكي لا تتكرر
    const dynamicCards = container.querySelectorAll(".firebase-product-card");
    dynamicCards.forEach(card => card.remove());

    snapshot.forEach((docSnap) => {
      const p = docSnap.data();
      appendProductCard(p.name, p.category, p.condition, p.price, p.description, p.phone, p.image);
    });
  });
}

function appendProductCard(name, category, condition, price, description, phone, image) {
  const container = document.getElementById("productsContainer");
  const card = document.createElement("div");

  card.className = "product-card firebase-product-card";
  card.dataset.category = category;

  const imageBox = document.createElement("div");
  imageBox.className = "product-image";

  if (image) {
    const img = document.createElement("img");
    img.src = image;
    img.alt = name;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    imageBox.appendChild(img);
  } else {
    imageBox.textContent = "📦";
  }

  const content = document.createElement("div");
  content.className = "product-content";

  const categoryText = document.createElement("span");
  categoryText.className = "category";
  categoryText.textContent = category;

  const title = document.createElement("h3");
  title.textContent = name;

  const conditionText = document.createElement("p");
  conditionText.textContent = condition;

  const priceText = document.createElement("strong");
  priceText.textContent = price + " ريال";

  const button = document.createElement("button");
  button.textContent = "التفاصيل";
  button.addEventListener("click", function () {
    window.openProduct(name, price, phone, image, description);
  });

  content.append(categoryText, title, conditionText, priceText, button);
  card.append(imageBox, content);
  container.appendChild(card);
}

document.addEventListener("DOMContentLoaded", function () {
  updateLoginButton();
  loadProductsFromFirebase();

  const form = document.getElementById("productForm");
  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const name = document.getElementById("productName").value.trim() || "منتج جديد";
      const category = document.getElementById("productCategory").value || "دراسية";
      const condition = document.getElementById("productCondition").value || "جديد";
      const price = document.getElementById("productPrice").value.trim() || "50";
      const description = document.getElementById("productDescription").value.trim() || "";
      const phone = document.getElementById("sellerPhone").value.trim() || "0500000000";
      const imageInput = document.getElementById("productImage");

      const file = imageInput.files[0];

      if (file) {
        const reader = new FileReader();
        reader.onload = async function (e) {
          await saveProductToCloud(name, category, condition, price, description, phone, e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        await saveProductToCloud(name, category, condition, price, description, phone, "");
      }
    });
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  const aiBtn = document.getElementById("aiPriceButton");
  if (aiBtn) {
    aiBtn.addEventListener("click", window.suggestProductPrice);
  }
});

async function saveProductToCloud(name, category, condition, price, description, phone, image) {
  try {
    await addDoc(collection(db, "products"), {
      name, category, condition, price, description, phone, image,
      createdAt: new Date()
    });

    document.getElementById("productForm").reset();
    const aiResult = document.getElementById("aiPriceResult");
    if (aiResult) aiResult.textContent = "";

    alert("تم نشر المنتج بنجاح في السحابة للجميع!");
    window.scrollToProducts();
  } catch (error) {
    console.error("خطأ أثناء حفظ المنتج: ", error);
    alert("حدث خطأ أثناء النشر، تأكد من إعدادات قاعدة البيانات.");
  }
}
