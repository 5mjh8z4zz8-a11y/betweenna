let activeCategory = "الكل";

let currentProduct = {
  name: "",
  price: "",
  phone: "",
  image: "",
  description: ""
};

function openLogin() {
  document.getElementById("loginModal").style.display = "flex";
}

function closeLogin() {
  document.getElementById("loginModal").style.display = "none";
}

function login() {
  const name = document.getElementById("loginName").value.trim();
  const trainingNumber = document.getElementById("trainingNumber").value.trim();
  const email = document.getElementById("loginEmail").value.trim();

  if (!name || !trainingNumber || !email) {
    alert("فضلاً عبّي جميع البيانات");
    return;
  }

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

function scrollToProducts() {
  document.getElementById("products").scrollIntoView({
    behavior: "smooth"
  });
}

function scrollToAdd() {
  document.getElementById("add").scrollIntoView({
    behavior: "smooth"
  });
}

function searchProducts() {
  applyFilters();
  scrollToProducts();
}

function filterCategory(category) {
  activeCategory = category;
  applyFilters();
  scrollToProducts();
}

function showAllProducts() {
  activeCategory = "الكل";
  document.getElementById("searchInput").value = "";
  applyFilters();
}

function applyFilters() {
  const search = document.getElementById("searchInput")
    .value.trim().toLowerCase();

  const cards = document.querySelectorAll(".product-card");
  let count = 0;

  cards.forEach(card => {
    const name = card.querySelector("h3")?.textContent.toLowerCase() || "";
    const category = card.dataset.category ||
      card.querySelector(".category")?.textContent || "";

    const searchMatch = name.includes(search);
    const categoryMatch =
      activeCategory === "الكل" || category.includes(activeCategory);

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

function openProduct(name, price, phone = "", image = "", description = "") {
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

function closeProduct() {
  document.getElementById("productModal").style.display = "none";
}

function contactSeller() {
  if (!currentProduct.phone) {
    alert("رقم البائع غير متوفر لهذا المنتج");
    return;
  }

  window.location.href = "tel:" + currentProduct.phone;
}

function suggestProductPrice() {
  const productName = document.getElementById("productName").value.trim();
  const category = document.getElementById("productCategory") ? document.getElementById("productCategory").value : "";
  const condition = document.getElementById("productCondition").value;
  const description = document.getElementById("productDescription") ? document.getElementById("productDescription").value.trim() : "";

  if (!productName) {
    alert("اكتبي اسم المنتج أولًا");
    document.getElementById("productName").focus();
    return;
  }

  if (!condition) {
    alert("اختاري حالة المنتج أولًا");
    document.getElementById("productCondition").focus();
    return;
  }

  const promptText = `أنا طالبة في متجر "بيننا" وأريد اقتراح سعر مناسب بالريال السعودي لهذا المنتج:
- اسم المنتج: ${productName}
- القسم: ${category}
- الحالة: ${condition}
- الوصف: ${description}
كم برأيك السعر المناسب لعرضه؟`;

  const encodedPrompt = encodeURIComponent(promptText);
  const geminiUrl = `https://gemini.google.com/app?q=${encodedPrompt}`;

  window.open(geminiUrl, "_blank");
}

document.addEventListener("DOMContentLoaded", function () {
  updateLoginButton();

  const form = document.getElementById("productForm");

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const name = document.getElementById("productName").value.trim.trim ? document.getElementById("productName").value.trim() : "";
      const category = document.getElementById("productCategory").value;
      const condition = document.getElementById("productCondition").value;
      const price = document.getElementById("productPrice").value.trim();
      const description =
        document.getElementById("productDescription").value.trim();
      const phone = document.getElementById("sellerPhone").value.trim();
      const imageInput = document.getElementById("productImage");

      if (!name || !category || !condition || !phone) {
        alert("فضلاً عبّي البيانات المطلوبة");
        return;
      }

      if (!price || !Number.isFinite(Number(price)) || Number(price) <= 0) {
        alert("اكتبي السعر بنفسك أو اسألي الذكاء الاصطناعي ثم اكتبي السعر الذي تختارينه.");
        document.getElementById("productPrice").focus();
        return;
      }

      const file = imageInput.files[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
          createProduct(
            name, category, condition, price,
            description, phone, e.target.result
          );
        };

        reader.readAsDataURL(file);
      } else {
        createProduct(
          name, category, condition, price,
          description, phone, ""
        );
      }
    });
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  const aiBtn = document.getElementById("aiPriceButton");
  if (aiBtn) {
    aiBtn.addEventListener("click", suggestProductPrice);
  }
});

function createProduct(
  name, category, condition, price, description, phone, image
) {
  const container = document.getElementById("productsContainer");
  const card = document.createElement("div");

  card.className = "product-card";
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
    openProduct(name, price, phone, image, description);
  });

  content.append(categoryText, title, conditionText, priceText, button);
  card.append(imageBox, content);
  container.appendChild(card);

  document.getElementById("productForm").reset();
  
  const aiResult = document.getElementById("aiPriceResult");
  if (aiResult) aiResult.textContent = "";

  alert("تم عرض المنتج بنجاح");

  document.getElementById("products").scrollIntoView({
    behavior: "smooth"
  });
}
