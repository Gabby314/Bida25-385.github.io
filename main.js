(function () {
    "use strict";

    /* Mobile navigation */
    function initNav() {
        var toggle = document.querySelector(".nav-toggle");
        var menu = document.querySelector(".nav-menu");
        if (!toggle || !menu) return;

        toggle.addEventListener("click", function () {
            var open = menu.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });

        menu.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                menu.classList.remove("is-open");
                toggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    /* Highlight active page in nav */
    function setActiveNav() {
        var path = window.location.pathname.split("/").pop() || "index.html";
        if (path === "" || path === "index.html") path = "index.html";

        document.querySelectorAll(".nav-links a").forEach(function (a) {
            var href = a.getAttribute("href") || "";
            a.classList.remove("is-active");

            if (href.startsWith("#")) {
                return;
            }

            var file = href.split("#")[0].split("/").pop();
            if (!file) file = "index.html";
            if (file === path) {
                a.classList.add("is-active");
            }
        });
    }

    function initYear() {
        var el = document.getElementById("year");
        if (el) el.textContent = String(new Date().getFullYear());
    }

    /* Feedback form: basic validation + message (no server) */
    function initFeedbackForm() {
        var form = document.querySelector("[data-feedback-form]");
        if (!form) return;

        var msg = form.querySelector(".form-message");
        var nameInput = form.querySelector('input[name="name"], input[type="text"]');
        var ratingInput = form.querySelector('select[name="rating"]');
        var feedbackInput = form.querySelector("textarea");
        var reviewsList = document.querySelector("[data-feedback-list]");
        var sortButtons = document.querySelectorAll(".sort-btn");
        var reviews = [
            { name: "Neo", rating: 5, text: "Excellent fade and clean finish. Will come back.", ts: Date.now() - 60000 },
            { name: "Kabelo", rating: 4, text: "Great service and friendly team.", ts: Date.now() - 120000 }
        ];
        var sortMode = "newest";

        function stars(n) {
            return "★".repeat(n) + "☆".repeat(5 - n);
        }

        function bubbleSortByRating(list) {
            var arr = list.slice();
            for (var i = 0; i < arr.length - 1; i++) {
                for (var j = 0; j < arr.length - i - 1; j++) {
                    if (arr[j].rating < arr[j + 1].rating) {
                        var temp = arr[j];
                        arr[j] = arr[j + 1];
                        arr[j + 1] = temp;
                    }
                }
            }
            return arr;
        }

        function renderReviews() {
            if (!reviewsList) return;
            var ordered = sortMode === "highest" ? bubbleSortByRating(reviews) : reviews.slice().sort(function (a, b) { return b.ts - a.ts; });
            if (!ordered.length) {
                reviewsList.innerHTML = '<p class="review-empty">No reviews yet. Be the first to comment.</p>';
                return;
            }
            reviewsList.innerHTML = ordered.map(function (r) {
                return (
                    '<article class="review-bubble">' +
                    '<header><h4>' + r.name + '</h4><span class="review-stars" aria-label="Rating ' + r.rating + ' out of 5">' + stars(r.rating) + '</span></header>' +
                    "<p>" + r.text + "</p>" +
                    "</article>"
                );
            }).join("");
        }

        sortButtons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                sortMode = btn.getAttribute("data-sort") || "newest";
                sortButtons.forEach(function (b) { b.classList.remove("is-active"); });
                btn.classList.add("is-active");
                renderReviews();
            });
        });

        renderReviews();

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            var name = nameInput ? nameInput.value.trim() : "";
            var rating = ratingInput ? Number(ratingInput.value) : 0;
            var text = feedbackInput ? feedbackInput.value.trim() : "";

            if (!msg) return;

            msg.classList.remove("success", "error", "is-visible");

            if (name.length < 2) {
                msg.textContent = "Please enter your name (at least 2 characters).";
                msg.classList.add("error", "is-visible");
                return;
            }

            if (!rating || rating < 1 || rating > 5) {
                msg.textContent = "Please choose a rating.";
                msg.classList.add("error", "is-visible");
                return;
            }

            if (text.length < 10) {
                msg.textContent = "Please write a bit more feedback (at least 10 characters).";
                msg.classList.add("error", "is-visible");
                return;
            }

            reviews.unshift({
                name: name,
                rating: rating,
                text: text,
                ts: Date.now()
            });
            renderReviews();
            msg.textContent = "Thanks — we appreciate your feedback!";
            msg.classList.add("success", "is-visible");
            form.reset();
        });
    }

    /* Services page: pick a service → scroll to booking + fill service field */
    function initServiceBooking() {
        var root = document.querySelector("[data-services-page]");
        if (!root) return;

        var cards = root.querySelectorAll(".card-selectable[data-service-key]");
        var form = root.querySelector("[data-booking-form]");
        if (!form || !cards.length) return;

        var serviceInput = form.querySelector("#book-service") || form.querySelector('[name="service"]');
        var msg = form.querySelector(".form-message");
        var dateInput = form.querySelector("#book-date");
        var nameInput = form.querySelector('[name="customer_name"]');
        var phoneInput = form.querySelector('[name="phone"]');
        var timeSelect = form.querySelector('[name="time"]');

        if (dateInput) {
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            dateInput.min = today.toISOString().slice(0, 10);
        }

        function clearSelection() {
            cards.forEach(function (c) {
                c.classList.remove("is-selected");
                c.setAttribute("aria-pressed", "false");
            });
        }

        function selectCard(card) {
            clearSelection();
            card.classList.add("is-selected");
            card.setAttribute("aria-pressed", "true");
            var label = card.getAttribute("data-service-label") || "";
            var price = card.getAttribute("data-price") || "";
            if (serviceInput) {
                serviceInput.value = label + " — " + price;
            }
            var book = document.getElementById("book");
            if (book) {
                var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                book.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
            }
            if (serviceInput) serviceInput.focus();
            if (msg) {
                msg.classList.remove("success", "error", "is-visible");
            }
        }

        cards.forEach(function (card) {
            card.addEventListener("click", function () {
                selectCard(card);
            });
        });

        var params = new URLSearchParams(window.location.search);
        var key = params.get("service");
        if (key && /^[a-z0-9-]+$/i.test(key)) {
            var match = root.querySelector('.card-selectable[data-service-key="' + key + '"]');
            if (match) selectCard(match);
        }

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!msg) return;
            msg.classList.remove("success", "error", "is-visible");

            var svc = serviceInput ? serviceInput.value.trim() : "";
            if (!svc) {
                msg.textContent = "Pick a service from the menu first.";
                msg.classList.add("error", "is-visible");
                return;
            }

            var name = nameInput && nameInput.value ? nameInput.value.trim() : "";
            var phone = phoneInput && phoneInput.value ? phoneInput.value.trim() : "";
            var date = dateInput && dateInput.value ? dateInput.value : "";
            var time = timeSelect && timeSelect.value ? timeSelect.value : "";

            if (name.length < 2) {
                msg.textContent = "Please enter your name.";
                msg.classList.add("error", "is-visible");
                return;
            }
            if (phone.replace(/\s/g, "").length < 8) {
                msg.textContent = "Please enter a valid phone number.";
                msg.classList.add("error", "is-visible");
                return;
            }
            if (!date) {
                msg.textContent = "Choose a preferred date.";
                msg.classList.add("error", "is-visible");
                return;
            }
            if (!time) {
                msg.textContent = "Choose a preferred time.";
                msg.classList.add("error", "is-visible");
                return;
            }

            msg.textContent = "Thanks — we will call you to confirm: " + svc + ".";
            msg.classList.add("success", "is-visible");
            form.reset();
            if (serviceInput) serviceInput.value = "";
            clearSelection();
            if (dateInput) {
                var t = new Date();
                t.setHours(0, 0, 0, 0);
                dateInput.min = t.toISOString().slice(0, 10);
            }
        });
    }

    /* Fade-in sections when they enter the viewport */
    function initReveal() {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            document.querySelectorAll(".reveal").forEach(function (el) {
                el.classList.add("is-visible");
            });
            return;
        }

        var sections = document.querySelectorAll(".reveal");
        if (!sections.length) return;

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { root: null, rootMargin: "0px 0px -40px 0px", threshold: 0.08 }
        );

        sections.forEach(function (el) {
            observer.observe(el);
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initNav();
        setActiveNav();
        initYear();
        initFeedbackForm();
        initServiceBooking();
        initReveal();
    });
})();
