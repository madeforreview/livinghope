/* Living Hope Community Church — site script (no dependencies) */
(function () {
  "use strict";

  /* Mobile navigation */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Menu";
        toggle.focus();
      }
    });
  }

  /* Dates: recurring gatherings (Halifax local time of the visitor's device) */
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var LONG_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  function at(d, h, m) { var x = new Date(d); x.setHours(h, m, 0, 0); return x; }
  function nextWeekday(from, dow, h, m) {
    var d = at(from, h, m);
    var diff = (dow - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + diff);
    if (d < from) d.setDate(d.getDate() + 7);
    return d;
  }
  function nthSaturday(year, month, n) {
    var d = new Date(year, month, 1);
    var first = (6 - d.getDay() + 7) % 7 + 1;
    return new Date(year, month, first + (n - 1) * 7);
  }
  function lastSaturday(year, month) {
    var d = new Date(year, month + 1, 0);
    d.setDate(d.getDate() - ((d.getDay() + 1) % 7));
    return d;
  }
  function nextMonthly(from, fn, h, m) {
    for (var i = 0; i < 3; i++) {
      var base = new Date(from.getFullYear(), from.getMonth() + i, 1);
      var d = at(fn(base.getFullYear(), base.getMonth()), h, m);
      if (d >= from) return d;
    }
    return null;
  }
  function fmtTime(d) {
    var h = d.getHours(), m = d.getMinutes();
    var ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return h + ":" + (m < 10 ? "0" : "") + m + " " + ap;
  }

  var now = new Date();
  var sunday = nextWeekday(now, 0, 10, 30);
  document.querySelectorAll("[data-next-sunday]").forEach(function (el) {
    var today = sunday.toDateString() === now.toDateString();
    el.textContent = (today ? "Today, " : "") + DAYS[0] + ", " + LONG_MONTHS[sunday.getMonth()] + " " + sunday.getDate();
  });

  var list = document.querySelector("[data-upcoming]");
  if (list) {
    var items = [
      { d: nextWeekday(now, 0, 10, 30), t: "Sunday Worship", p: "114 Downs Ave · Kids' Zone & nursery available" },
      { d: nextWeekday(now, 0, 18, 30), t: "Experiencing God Prayer Time", p: "Prayer together · ask us for the location" },
      { d: nextWeekday(now, 3, 19, 0), t: "Wednesday Bible Study", p: "Home group · in person or on Zoom" },
      { d: nextMonthly(now, function (y, m) { return nthSaturday(y, m, 3); }, 8, 0), t: "Men's Breakfast", p: "Third Saturday of each month", noTime: true },
      { d: nextMonthly(now, lastSaturday, 10, 30), t: "Kid's Club", p: "Last Saturday of each month · 114 Downs Ave" }
    ].filter(function (i) { return i.d; });
    items.sort(function (a, b) { return a.d - b.d; });
    var max = parseInt(list.getAttribute("data-upcoming"), 10) || 5;
    list.innerHTML = items.slice(0, max).map(function (i) {
      return '<li><div class="cal-chip" aria-hidden="true"><small>' + MONTHS[i.d.getMonth()] + "</small><b>" + i.d.getDate() + "</b></div>" +
        "<div><strong>" + i.t + '</strong><span class="meta">' + DAYS[i.d.getDay()] + (i.noTime ? " morning" : " · " + fmtTime(i.d)) + " · " + i.p + "</span></div></li>";
    }).join("");
  }

  /* Forms: posts to data-endpoint (e.g. Formspree) when set; otherwise shows contact details */
  document.querySelectorAll("form[data-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector(".form-status");
      var endpoint = form.getAttribute("data-endpoint");
      if (!form.checkValidity()) { form.reportValidity(); return; }
      function show(msg) { if (status) { status.hidden = false; status.textContent = msg; status.focus(); } }
      if (!endpoint) {
        show("Our online form isn't connected yet. Please email info@livinghopehalifax.com or call 902-445-5908 and we'll get back to you.");
        return;
      }
      var btn = form.querySelector("button[type=submit]");
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error();
          form.reset();
          show(form.getAttribute("data-success") || "Thank you. Your message is on its way and someone from Living Hope will be in touch soon.");
        })
        .catch(function () { show("We couldn't send that. Please email info@livinghopehalifax.com or call 902-445-5908."); })
        .finally(function () { if (btn) { btn.disabled = false; btn.textContent = btn.getAttribute("data-label") || "Send"; } });
    });
  });

  /* Copy buttons */
  document.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var text = b.getAttribute("data-copy");
      var done = function () { var o = b.textContent; b.textContent = "Copied"; setTimeout(function () { b.textContent = o; }, 1600); };
      try { navigator.clipboard.writeText(text).then(done, function () {}); } catch (err) {}
    });
  });

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
