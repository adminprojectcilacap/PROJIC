(function () {
  "use strict";

  // Parameter x=1 menjaga respons API BMKG tetap CORS-friendly di peramban.
  var WEATHER_URL = "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=33.01.22.1001&x=1";
  var WEATHER_CACHE_KEY = "rp-cilacap-weather-v4";
  var WEATHER_CACHE_TTL = 30 * 60 * 1000;
  var WEATHER_FETCH_TIMEOUT = 10000;

  var weatherTones = {
    sun: "#f6c96d",
    partly: "#d8ef8d",
    cloud: "#b8c7cf",
    rain: "#75d3ec",
    storm: "#f4b76a",
    fog: "#b9c6ca",
    wind: "#91e0c0"
  };

  var els = {
    headerClock: document.getElementById("headerClock"),
    heroClock: document.getElementById("heroClock"),
    heroSeconds: document.getElementById("heroSeconds"),
    weatherDate: document.getElementById("wxDate"),
    footerYear: document.getElementById("footerYear"),
    current: document.getElementById("wxCurrent"),
    icon: document.getElementById("wxIcon"),
    temp: document.getElementById("wxTemp"),
    cond: document.getElementById("wxCond"),
    slot: document.getElementById("wxSlot"),
    humidity: document.getElementById("wxHumidity"),
    wind: document.getElementById("wxWind"),
    windDir: document.getElementById("wxWindDir"),
    rain: document.getElementById("wxRain"),
    location: document.getElementById("wxLocation"),
    forecast: document.getElementById("wxForecast"),
    updated: document.getElementById("wxUpdated")
  };

  var dialog = document.getElementById("infoDialog");
  var dialogKicker = document.getElementById("dialogKicker");
  var dialogTitle = document.getElementById("dialogTitle");
  var dialogBody = document.getElementById("dialogBody");
  var dialogActions = document.getElementById("dialogActions");
  var dialogClose = document.getElementById("dialogClose");

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function appIcon(name) {
    var allowed = { meeting: true, grid: true, chart: true, folder: true, shield: true, tools: true };
    return allowed[name] ? name : "grid";
  }

  function appLinkAttrs(app) {
    var href = String(app.href || "").trim();
    if (!href) return ' href="#" aria-disabled="true"';
    if (/^https?:\/\//i.test(href)) {
      return ' href="' + escapeHTML(href) + '" target="_blank" rel="noopener noreferrer"';
    }
    return ' href="' + escapeHTML(href) + '"';
  }

  function renderPreview(app) {
    var preview = app.preview || {};
    var rooms = Array.isArray(preview.rooms) ? preview.rooms : [];
    if (!rooms.length) return "";
    return '<div class="featured-app__visual" aria-hidden="true">' +
      '<div class="app-preview-board">' +
        '<div class="sb-head"><span class="sb-brand">' + escapeHTML(app.name) + '</span><span class="sb-version">internal</span></div>' +
        '<p class="sb-label">' + escapeHTML(preview.label || "Pratinjau aplikasi") + '</p>' +
        rooms.map(function (room) {
          return '<div class="sb-room">' +
            '<span class="sb-code sb-code--' + escapeHTML(room.tone || "teal") + '">' + escapeHTML(room.code || "•") + '</span>' +
            '<div><strong>' + escapeHTML(room.name || "") + '</strong><small>' + escapeHTML(room.meta || "") + '</small></div>' +
            '<span class="sb-dot"></span>' +
          '</div>';
        }).join("") +
        '<div class="sb-foot"><span>' + escapeHTML((app.tags && app.tags[0]) || "Aplikasi") + '</span><span>' + escapeHTML((app.tags && app.tags[1]) || "Terintegrasi") + '</span><span>' + escapeHTML((app.tags && app.tags[2]) || "Internal") + '</span></div>' +
      '</div>' +
      '<p class="visual-caption">Pratinjau antarmuka</p>' +
    '</div>';
  }

  function renderFeaturedApp(app) {
    var tags = Array.isArray(app.tags) ? app.tags : [];
    var note = app.note || "Akses internal";
    var preview = renderPreview(app);
    var icon = appIcon(app.icon);
    return '<article class="featured-app' + (preview ? "" : " featured-app--solo") + '">' +
      '<div class="featured-app__content">' +
        '<div class="featured-top">' +
          '<span class="featured-icon" aria-hidden="true"><svg><use href="#icon-' + icon + '"></use></svg></span>' +
          '<span class="featured-status"><i aria-hidden="true"></i> Tersedia</span>' +
        '</div>' +
        '<p class="featured-kicker">' + escapeHTML(app.category || "Aplikasi internal") + '</p>' +
        '<h3>' + escapeHTML(app.name) + '</h3>' +
        '<p class="featured-sub">' + escapeHTML(app.subtitle || "") + '</p>' +
        '<p class="featured-desc">' + escapeHTML(app.description || "") + '</p>' +
        (tags.length ? '<div class="featured-tags" role="group" aria-label="Fitur utama ' + escapeHTML(app.name) + '">' + tags.map(function (tag) { return "<span>" + escapeHTML(tag) + "</span>"; }).join("") + "</div>" : "") +
        '<div class="featured-actions">' +
          '<a class="btn btn--primary" data-app-link' + appLinkAttrs(app) + ' aria-label="Buka aplikasi ' + escapeHTML(app.name) + '">Buka ' + escapeHTML(app.name) + '<span class="btn-arrow" aria-hidden="true"><svg><use href="#icon-arrow-up-right"></use></svg></span></a>' +
          '<span class="featured-note"><svg aria-hidden="true"><use href="#icon-lock"></use></svg> ' + escapeHTML(note) + '</span>' +
        '</div>' +
      '</div>' +
      preview +
    '</article>';
  }

  function renderAppTile(app) {
    var tags = Array.isArray(app.tags) ? app.tags : [];
    var icon = appIcon(app.icon);
    return '<a class="app-tile" data-app-link' + appLinkAttrs(app) + ' aria-label="Buka aplikasi ' + escapeHTML(app.name) + '">' +
      '<div class="app-tile__top">' +
        '<span class="app-tile__icon" aria-hidden="true"><svg><use href="#icon-' + icon + '"></use></svg></span>' +
        '<span class="app-tile__arrow" aria-hidden="true"><svg><use href="#icon-arrow-up-right"></use></svg></span>' +
      '</div>' +
      '<span class="app-tile__category">' + escapeHTML(app.category || "Aplikasi internal") + '</span>' +
      '<h3>' + escapeHTML(app.name) + '</h3>' +
      '<p class="app-tile__subtitle">' + escapeHTML(app.subtitle || "") + '</p>' +
      '<p class="app-tile__desc">' + escapeHTML(app.description || "") + '</p>' +
      (tags.length ? '<div class="app-tile__tags">' + tags.map(function (tag) { return "<span>" + escapeHTML(tag) + "</span>"; }).join("") + "</div>" : "") +
      '<div class="app-tile__foot"><span>Buka aplikasi</span><span class="app-id">' + escapeHTML(app.id || "") + '</span></div>' +
    '</a>';
  }

  function renderApps() {
    var container = document.getElementById("appDirectory");
    if (!container) return;
    var apps = Array.isArray(window.PROJECT_RP_APPS) ? window.PROJECT_RP_APPS.filter(function (app) {
      return app && app.name;
    }) : [];
    var counts = [document.getElementById("heroAppCount"), document.getElementById("appCount")];
    counts.forEach(function (el) { if (el) el.textContent = String(apps.length); });

    if (!apps.length) {
      container.innerHTML = '<div class="app-empty"><strong>Belum ada aplikasi terdaftar.</strong><span>Tambahkan aplikasi melalui assets/js/apps.js.</span></div>';
      return;
    }

    if (apps.length === 1) {
      container.innerHTML = renderFeaturedApp(apps[0]);
      return;
    }

    container.innerHTML = '<div class="app-tile-grid">' + apps.map(renderAppTile).join("") + '</div>';
  }

  function jakartaParts(date) {
    var parts = {};
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    }).formatToParts(date).forEach(function (part) {
      if (part.type !== "literal") parts[part.type] = part.value;
    });
    return parts;
  }

  function startClock() {
    var dateFormatter = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    var yearFormatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      year: "numeric"
    });

    function tick() {
      var now = new Date();
      var p = jakartaParts(now);
      if (els.headerClock) els.headerClock.textContent = p.hour + ":" + p.minute;
      if (els.heroClock) els.heroClock.textContent = p.hour + ":" + p.minute;
      if (els.heroSeconds) els.heroSeconds.textContent = ":" + p.second;
      if (els.weatherDate) els.weatherDate.textContent = dateFormatter.format(now);
      if (els.footerYear) els.footerYear.textContent = yearFormatter.format(now);
    }

    tick();
    window.setInterval(tick, 1000);
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) tick();
    });
  }

  function setDialogIcon(id) {
    var icon = document.getElementById("dialogIcon");
    if (!icon) return;
    icon.innerHTML = '<svg aria-hidden="true"><use href="#' + id + '"></use></svg>';
  }

  function openDialog() {
    if (!dialog) return;
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    document.body.classList.add("has-dialog");
  }

  function closeDialog() {
    if (!dialog) return;
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
    document.body.classList.remove("has-dialog");
  }

  function openGuide() {
    if (!dialog) return;
    dialogKicker.textContent = "Panduan portal";
    dialogTitle.textContent = "Cara menggunakan portal";
    setDialogIcon("icon-compass");
    dialogBody.innerHTML =
      "<p>Portal Fungsi Project R&amp;P Cilacap menyediakan akses cepat ke aplikasi internal dan informasi cuaca Cilacap.</p>" +
      '<ol class="dialog-steps">' +
        '<li><span class="step-num">01</span><span><strong>Pilih aplikasi.</strong> Klik <em>Jelajahi aplikasi</em>, lalu pilih aplikasi yang ingin dibuka.</span></li>' +
        '<li><span class="step-num">02</span><span><strong>Gunakan aplikasi.</strong> Setiap aplikasi dapat memiliki akun dan hak akses tersendiri. Hubungi administrator terkait jika memerlukan akses.</span></li>' +
        '<li><span class="step-num">03</span><span><strong>Kembali ke portal.</strong> Gunakan tombol kembali pada peramban untuk membuka aplikasi lain.</span></li>' +
      "</ol>" +
      '<div class="dialog-tip"><svg aria-hidden="true"><use href="#icon-info"></use></svg><span>Data cuaca dimuat dari API BMKG. Tautan prakiraan resmi BMKG tersedia di bagian bawah kartu cuaca.</span></div>';
    dialogActions.innerHTML = '<button class="btn btn--small btn--primary" type="button" data-close-dialog>Mengerti</button>';
    openDialog();
  }

  function bindDialog() {
    if (!dialog) return;
    document.querySelectorAll("[data-open-guide]").forEach(function (button) {
      button.addEventListener("click", openGuide);
    });
    if (dialogClose) dialogClose.addEventListener("click", closeDialog);
    dialog.addEventListener("click", function (event) {
      if (event.target.closest("[data-close-dialog]")) {
        closeDialog();
        return;
      }
      if (event.target === dialog) closeDialog();
    });
    dialog.addEventListener("close", function () {
      document.body.classList.remove("has-dialog");
    });
    dialog.addEventListener("cancel", function () {
      document.body.classList.remove("has-dialog");
    });
  }

  function initNavState() {
    var appSection = document.getElementById("aplikasi");
    var homeLink = document.querySelector('.main-nav a[href="#beranda"]');
    var appsLink = document.querySelector('.main-nav a[href="#aplikasi"]');
    if (!appSection || !homeLink || !appsLink || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      var isAppsVisible = entries[0] && entries[0].isIntersecting;
      homeLink.classList.toggle("is-active", !isAppsVisible);
      appsLink.classList.toggle("is-active", isAppsVisible);
    }, { rootMargin: "-28% 0px -58% 0px", threshold: 0 });

    observer.observe(appSection);
  }

  function weatherKind(description) {
    var value = String(description || "").toLowerCase();
    if (/petir|kilat/.test(value)) return "storm";
    if (/hujan|gerimis/.test(value)) return "rain";
    if (/kabut|asap|udara kabur/.test(value)) return "fog";
    if (/cerah berawan/.test(value)) return "partly";
    if (/cerah/.test(value)) return "sun";
    if (/angin/.test(value)) return "wind";
    return "cloud";
  }

  function titleCaseWords(value) {
    return String(value || "").toLowerCase().replace(/\b\w/g, function (letter) {
      return letter.toUpperCase();
    });
  }

  function windDirection(code) {
    var compass = {
      N: "Utara", NNE: "Utara Timur Laut", NE: "Timur Laut", ENE: "Timur Timur Laut",
      E: "Timur", ESE: "Timur Tenggara", SE: "Tenggara", SSE: "Selatan Tenggara",
      S: "Selatan", SSW: "Selatan Barat Daya", SW: "Barat Daya", WSW: "Barat Barat Daya",
      W: "Barat", WNW: "Barat Barat Laut", NW: "Barat Laut", NNW: "Utara Barat Laut"
    };
    return compass[String(code || "").toUpperCase()] || String(code || "");
  }

  function formatNumber(value, digits) {
    var number = Number(value);
    if (!Number.isFinite(number)) return "—";
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits == null ? 1 : digits
    }).format(number);
  }

  function setWeatherIcon(description) {
    if (!els.icon) return;
    var kind = weatherKind(description);
    els.icon.style.setProperty("--wx-tone", weatherTones[kind] || weatherTones.cloud);
    els.icon.innerHTML = '<svg aria-hidden="true"><use href="#icon-wx-' + kind + '"></use></svg>';
  }

  function parseLocalDateTime(value) {
    var normalized = String(value || "").replace(" ", "T");
    if (!normalized) return null;
    var date = new Date(normalized + "+07:00");
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function parseWeather(payload) {
    var item = payload && payload.data && payload.data[0];
    var groups = item && item.cuaca;
    if (!Array.isArray(groups) || !groups.length) {
      throw new Error("Struktur data cuaca BMKG tidak dikenali.");
    }

    var entries = [];
    groups.forEach(function (group) {
      if (!Array.isArray(group)) return;
      group.forEach(function (entry) {
        if (entry && entry.local_datetime) entries.push(entry);
      });
    });
    entries.sort(function (a, b) {
      return String(a.local_datetime).localeCompare(String(b.local_datetime));
    });
    if (!entries.length) throw new Error("Data prakiraan BMKG kosong.");

    var now = Date.now();
    var nearest = entries.find(function (entry) {
      var date = parseLocalDateTime(entry.local_datetime);
      return date && date.getTime() >= now - 30 * 60 * 1000;
    }) || entries[0];

    var currentKind = weatherKind(nearest.weather_desc);
    var localTime = String(nearest.local_datetime || "").slice(11, 16);
    var currentRain = nearest.tp != null ? formatNumber(nearest.tp, 1) + " mm" : "—";
    var currentWind = nearest.ws != null ? formatNumber(nearest.ws, 1) + " km/j" : "—";
    var currentHumidity = nearest.hu != null ? Math.round(Number(nearest.hu)) + "%" : "—";

    var todayParts = jakartaParts(new Date());
    var todayKey = todayParts.year + "-" + todayParts.month + "-" + todayParts.day;
    var tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    var tomorrowParts = jakartaParts(tomorrow);
    var tomorrowKey = tomorrowParts.year + "-" + tomorrowParts.month + "-" + tomorrowParts.day;
    var dayAfter = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    var dayAfterParts = jakartaParts(dayAfter);
    var dayAfterKey = dayAfterParts.year + "-" + dayAfterParts.month + "-" + dayAfterParts.day;
    var weekdays = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", weekday: "long" });
    var shortDate = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short"
    });

    var byDate = {};
    entries.forEach(function (entry) {
      var key = String(entry.local_datetime || "").slice(0, 10);
      if (!key) return;
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(entry);
    });

    var keys = Object.keys(byDate).sort().slice(0, 3);
    var forecast = keys.map(function (key) {
      var items = byDate[key];
      var temperatures = items.map(function (entry) { return Number(entry.t); }).filter(function (value) {
        return Number.isFinite(value);
      });
      var representative = items.reduce(function (best, entry) {
        if (!best) return entry;
        var hour = Number(String(entry.local_datetime).slice(11, 13));
        var bestHour = Number(String(best.local_datetime).slice(11, 13));
        return Math.abs(hour - 13) < Math.abs(bestHour - 13) ? entry : best;
      }, null);
      var label = key === todayKey ? "Hari ini" : key === tomorrowKey ? "Besok" : key === dayAfterKey ? "Lusa" : weekdays.format(parseLocalDateTime(items[0].local_datetime));
      var dateLabel = shortDate.format(parseLocalDateTime(items[0].local_datetime));
      var min = temperatures.length ? Math.min.apply(null, temperatures) : null;
      var max = temperatures.length ? Math.max.apply(null, temperatures) : null;
      return {
        label: label,
        dateLabel: dateLabel,
        condition: representative ? representative.weather_desc : "—",
        kind: weatherKind(representative ? representative.weather_desc : ""),
        min: min,
        max: max
      };
    });

    var locationParts = [];
    if (item.lokasi && item.lokasi.desa) locationParts.push(item.lokasi.desa);
    if (item.lokasi && item.lokasi.kecamatan) locationParts.push(titleCaseWords(item.lokasi.kecamatan));

    var updatedAt = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).format(new Date());

    return {
      current: {
        temp: formatNumber(nearest.t, 1),
        condition: nearest.weather_desc || "—",
        kind: currentKind,
        slot: localTime,
        humidity: currentHumidity,
        rain: currentRain,
        wind: currentWind,
        windDirection: windDirection(nearest.wd)
      },
      forecast: forecast,
      location: locationParts.join(" · ") || "Cilacap",
      updatedAt: updatedAt,
      fetchedAt: Date.now()
    };
  }

  function readCache() {
    try {
      var raw = window.localStorage.getItem(WEATHER_CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.data || !parsed.savedAt) return null;
      return parsed;
    } catch (error) {
      return null;
    }
  }

  function saveCache(data) {
    try {
      window.localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data: data }));
    } catch (error) {
      /* Cache bersifat opsional. */
    }
  }

  function renderForecast(days) {
    if (!els.forecast) return;
    if (!Array.isArray(days) || !days.length) {
      els.forecast.innerHTML = '<div class="wx-day"><span class="wx-day-cond">Prakiraan belum tersedia</span></div>';
      return;
    }
    els.forecast.innerHTML = days.map(function (day) {
      var tone = weatherTones[day.kind] || weatherTones.cloud;
      return '<div class="wx-day" style="--wx-tone:' + tone + '">' +
        '<span class="wx-day-name">' + escapeHTML(day.label) + "</span>" +
        '<span class="wx-day-date">' + escapeHTML(day.dateLabel) + "</span>" +
        '<span class="wx-day-icon" aria-hidden="true"><svg><use href="#icon-wx-' + escapeHTML(day.kind) + '"></use></svg></span>' +
        '<strong class="wx-day-temp">' + escapeHTML(day.max) + '°' + (day.max === day.min ? "" : '<span>' + escapeHTML(day.min) + "°</span>") + '</strong>' +
        '<span class="wx-day-cond" title="' + escapeHTML(day.condition) + '">' + escapeHTML(day.condition) + "</span>" +
        "</div>";
    }).join("");
  }

  function renderWeather(data, fromCache) {
    if (!data || !data.current) return;
    var current = data.current;
    if (els.current) els.current.setAttribute("aria-busy", "false");
    if (els.temp) els.temp.innerHTML = escapeHTML(current.temp) + '<span class="wx-deg">°</span>';
    if (els.cond) els.cond.textContent = current.condition;
    if (els.slot) els.slot.textContent = current.slot ? "Prakiraan " + current.slot + " WIB" : "Prakiraan BMKG";
    if (els.humidity) els.humidity.textContent = current.humidity || "—";
    if (els.wind) els.wind.textContent = current.wind || "—";
    if (els.windDir) els.windDir.textContent = current.windDirection || "";
    if (els.rain) els.rain.textContent = current.rain || "—";
    if (els.location) els.location.textContent = data.location || "Cilacap";
    if (els.updated) els.updated.textContent = "BMKG · " + (data.updatedAt || "baru") + " WIB" + (fromCache ? " · tersimpan" : "");
    setWeatherIcon(current.condition);
    renderForecast(data.forecast);
  }

  function renderWeatherError() {
    if (els.current) els.current.setAttribute("aria-busy", "false");
    if (els.cond) els.cond.textContent = "Data cuaca belum tersedia";
    if (els.slot) els.slot.textContent = "Silakan buka prakiraan BMKG";
    if (els.temp) els.temp.innerHTML = "--" + '<span class="wx-deg">°</span>';
    if (els.humidity) els.humidity.textContent = "—";
    if (els.wind) els.wind.textContent = "—";
    if (els.windDir) els.windDir.textContent = "";
    if (els.rain) els.rain.textContent = "—";
    if (els.updated) els.updated.textContent = "Koneksi BMKG gagal";
    if (els.forecast) {
      els.forecast.innerHTML = ["Besok", "Lusa", "—"].map(function (label) {
        return '<div class="wx-day"><span class="wx-day-name">' + label +
          '</span><span class="wx-day-icon" aria-hidden="true"><svg><use href="#icon-wx-cloud"></use></svg></span>' +
          '<span class="wx-day-cond">Belum tersedia</span></div>';
      }).join("");
    }
  }

  function fetchWeather() {
    var controller = new AbortController();
    var timeout = window.setTimeout(function () { controller.abort(); }, WEATHER_FETCH_TIMEOUT);
    return fetch(WEATHER_URL, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
      signal: controller.signal,
      headers: { "Accept": "application/json" }
    }).then(function (response) {
      if (!response.ok) throw new Error("API BMKG merespons " + response.status);
      return response.json();
    }).then(function (payload) {
      return parseWeather(payload);
    }).finally(function () {
      window.clearTimeout(timeout);
    });
  }

  function loadWeather() {
    var cached = readCache();
    if (cached && Date.now() - cached.savedAt < WEATHER_CACHE_TTL) {
      renderWeather(cached.data, true);
      return;
    }
    if (cached) renderWeather(cached.data, true);

    fetchWeather().then(function (data) {
      renderWeather(data, false);
      saveCache(data);
    }).catch(function (error) {
      if (window.console && console.warn) {
        console.warn("Informasi cuaca BMKG tidak dapat dimuat:", error);
      }
      if (!cached) renderWeatherError();
    });
  }

  function init() {
    startClock();
    bindDialog();
    initNavState();
    renderApps();
    loadWeather();
    window.setInterval(loadWeather, WEATHER_CACHE_TTL);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
