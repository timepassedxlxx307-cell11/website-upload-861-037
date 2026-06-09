(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5600);
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter(scope, query, chip) {
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var keyword = normalizeText(query);
    var chipValue = normalizeText(chip === 'all' ? '' : chip);

    cards.forEach(function (card) {
      var haystack = normalizeText([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
      var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchedChip = !chipValue || haystack.indexOf(chipValue) !== -1;

      card.classList.toggle('hidden-card', !(matchedKeyword && matchedChip));
    });
  }

  document.querySelectorAll('.section-block').forEach(function (section) {
    var scope = section.querySelector('.filter-scope');
    var input = section.querySelector('.local-filter');
    var chips = Array.prototype.slice.call(section.querySelectorAll('.filter-chips button'));
    var currentChip = 'all';

    if (!scope) {
      return;
    }

    if (input) {
      input.addEventListener('input', function () {
        applyFilter(scope, input.value, currentChip);
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        currentChip = chip.getAttribute('data-filter') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });
        applyFilter(scope, input ? input.value : '', currentChip);
      });
    });
  });

  var urlParams = new URLSearchParams(window.location.search);
  var q = urlParams.get('q') || '';
  var searchInput = document.querySelector('.search-page-input');
  var searchResults = document.querySelector('.search-results');

  if (searchInput && q) {
    searchInput.value = q;
  }

  if (searchResults) {
    applyFilter(searchResults, q, 'all');
  }
})();
