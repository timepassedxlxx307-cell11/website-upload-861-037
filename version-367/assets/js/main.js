(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });

      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        showSlide(current);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  var scopes = document.querySelectorAll('[data-search-scope]');

  scopes.forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var typeSelect = scope.querySelector('[data-filter-type]');
    var regionSelect = scope.querySelector('[data-filter-region]');
    var yearSelect = scope.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var empty = scope.querySelector('[data-empty-state]');

    function filterCards() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }

        if (type && cardType.indexOf(type) === -1) {
          matched = false;
        }

        if (region && cardRegion.indexOf(region) === -1) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        card.classList.toggle('hidden-card', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, typeSelect, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });

    filterCards();
  });
})();
