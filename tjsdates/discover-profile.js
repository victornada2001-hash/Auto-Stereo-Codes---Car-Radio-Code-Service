/* The profile in Discover scrolls vertically. Only horizontal drags react. */
(function () {
  'use strict';

  function mountSwipe(scroll, card, isCurrent) {
    let drag = null;

    function reset() {
      if (drag?.horizontal) {
        card.classList.remove('tjs-profile-dragging');
        card.style.transform = '';
      }
      drag = null;
    }

    scroll.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0 ||
          event.target.closest('button, a, input, select, textarea, summary')) return;
      if (event.pointerType === 'mouse' &&
          !event.target.closest('.tjs-profile-cover, .tjs-profile-photo')) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: false };
    });
    scroll.addEventListener('pointermove', event => {
      if (event.pointerId !== drag?.id) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (!drag.horizontal) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) return;
        if (Math.abs(dx) <= Math.abs(dy) * 1.25) {
          reset();
          return;
        }
        drag.horizontal = true;
        scroll.setPointerCapture(event.pointerId);
        card.classList.add('tjs-profile-dragging');
      }
      card.style.transform = 'translateX(' + dx * .72 + 'px) rotate(' + dx / 28 + 'deg)';
    });
    scroll.addEventListener('pointerup', event => {
      if (event.pointerId !== drag?.id) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      const react = drag.horizontal && Math.abs(dx) > 100 && Math.abs(dx) > Math.abs(dy) * 1.25;
      reset();
      if (react && isCurrent()) {
        if (dx > 0) likeCurrent();
        else passCurrent();
      }
    });
    for (const type of ['pointercancel', 'lostpointercapture']) {
      scroll.addEventListener(type, event => { if (event.pointerId === drag?.id) reset(); });
    }
    scroll.addEventListener('pointerleave', () => { if (!drag?.horizontal) reset(); });
  }

  function hasValue(value) {
    return Array.isArray(value) ? value.some(hasValue) : value != null && String(value).trim() !== '';
  }

  function section(heading, body) {
    return body ? '<section class="tjs-profile-section"><h4>' + esc(heading) + '</h4>' + body + '</section>' : '';
  }

  function factList(rows) {
    const facts = rows.filter(([, value]) => hasValue(value));
    if (!facts.length) return '';
    return '<dl>' + facts.map(([label, value]) =>
      '<div><dt>' + esc(label) + '</dt><dd>' +
      esc(Array.isArray(value) ? value.filter(hasValue).join(', ') : String(value)) + '</dd></div>'
    ).join('') + '</dl>';
  }

  function safeImageUrl(source) {
    if (!source) return '';
    try {
      const url = new URL(source, location.href);
      if (url.protocol === 'https:' || url.protocol === 'http:' ||
          (url.protocol === 'data:' && /^data:image\//i.test(source))) return url.href;
    } catch (_error) {}
    return '';
  }

  function imageKey(url) {
    return url.split('?')[0];
  }

  let lastMount;

  window.renderDiscoverProfile = function (candidate, cropPortrait) {
    const deck = $('deck');
    const page = $('page-discover');
    if (!deck || !page) return;
    const en = typeof tjsUiLanguage !== 'undefined' && tjsUiLanguage === 'en';
    if (lastMount?.candidate === candidate && lastMount.en === en && lastMount.card.isConnected) return;

    const viewer = session?.user?.id;
    const t = p55t();
    const label = (es, english) => en ? english : es;
    const name = candidate.display_name || label('Perfil', 'Profile');
    const age = Number(candidate.age);
    const distance = Number(candidate.approximate_distance_km);
    const place = [candidate.city, distance > 0 ? '≈ ' + distance + ' km' : ''].filter(Boolean).join(' · ');
    const card = document.createElement('article');
    card.id = 'currentCard';
    card.className = 'profilecard tjs-scroll-profile';
    card.innerHTML = `
      <div class="tjs-profile-scroll" role="region" tabindex="0" aria-labelledby="tjs-profile-name">
        <div class="tjs-profile-cover">
          <div class="tjs-cover-fallback" aria-hidden="true">♥</div>
          <button type="button" class="tjs-profile-jump">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m5 9 7 7 7-7"/></svg>
            ${label('Desliza para ver más', 'Scroll for more')}
          </button>
        </div>
        <div class="tjs-profile-details-inline" tabindex="-1">
          <div data-part="about"></div>
          <div data-part="second"></div>
          <div data-part="basics"></div>
          <div data-part="interests"></div>
          <div data-part="lifestyle"></div>
          <div data-part="photos"></div>
          <p class="tjs-profile-empty" role="status"></p>
        </div>
      </div>
      <header class="tjs-profile-identity">
        <div>
          <h3 id="tjs-profile-name">${esc(name)}${age > 0 ? ', ' + age : ''}
            ${candidate.is_verified ? '<span class="tjs-profile-verified" role="img" aria-label="' + label('Perfil verificado', 'Verified profile') + '">✓</span>' : ''}
          </h3>
          ${place ? '<p>' + esc(place) + '</p>' : ''}
          ${candidate.is_demo ? '<p>' + label('Perfil ficticio · Imagen generada con IA', 'Fictional profile · AI-generated image') + '</p>' : ''}
        </div>
      </header>`;
    deck.replaceChildren(card);
    page.classList.add('tjs-scroll-discovery');
    lastMount = { candidate, en, card };

    const isCurrent = () => card.isConnected && candidates[candidateIndex]?.id === candidate.id && session?.user?.id === viewer;
    const scroll = card.querySelector('.tjs-profile-scroll');
    const cover = card.querySelector('.tjs-profile-cover');
    const identity = card.querySelector('.tjs-profile-identity');
    const details = card.querySelector('.tjs-profile-details-inline');
    const state = card.querySelector('.tjs-profile-empty');
    const part = name => details.querySelector('[data-part="' + name + '"]');
    const photoLabel = index => t.photo + ' ' + index + ' · ' + name;

    function paintDetails(profile, interests) {
      const about = hasValue(profile.bio) ? '<p>' + esc(profile.bio) + '</p>' : '';
      part('about').innerHTML = section(t.about, about);
      part('basics').innerHTML = section(label('Información básica', 'Basics'), factList([
        [t.goal, profile.relationship_goal], [t.languages, profile.languages],
        [t.height, profile.height_cm ? profile.height_cm + ' cm' : ''],
        [t.work, [profile.occupation, profile.company]], [t.school, profile.school],
        [label('Pronombres', 'Pronouns'), profile.pronouns],
      ]));
      const common = Number(candidate.common_interests) || 0;
      const commonText = common > 0 ? '<p class="tjs-profile-common">' + common + ' ' +
        label(common === 1 ? 'interés en común' : 'intereses en común', common === 1 ? 'shared interest' : 'shared interests') + '</p>' : '';
      const chips = interests.length ? '<ul>' + interests.map(interest => '<li>' + esc(interest) + '</li>').join('') + '</ul>' : '';
      part('interests').innerHTML = section(t.interests, commonText + chips);
      part('lifestyle').innerHTML = section(label('Estilo de vida', 'Lifestyle'), factList([
        [t.exercise, profile.exercise], [t.smoking, profile.smoking],
        [t.alcohol, profile.alcohol], [t.pets, profile.pets], [t.diet, profile.diet],
        [t.children, profile.children], [t.wantsChildren, profile.wants_children],
        [t.sleep, profile.sleep_habits], [t.zodiac, profile.zodiac_sign],
      ]));
    }

    function setCover(source) {
      const url = safeImageUrl(source);
      const previous = cover.querySelector('img');
      if (!url || (previous && imageKey(previous.src) === imageKey(url))) return;
      const img = document.createElement('img');
      img.alt = photoLabel(1);
      img.draggable = false;
      img.addEventListener('error', () => img.remove(), { once: true });
      img.src = url;
      if (previous) previous.replaceWith(img);
      else cover.prepend(img);
    }

    function addPhoto(url, index) {
      const figure = document.createElement('figure');
      figure.className = 'tjs-profile-photo';
      const img = document.createElement('img');
      img.alt = photoLabel(index);
      img.loading = 'lazy';
      img.decoding = 'async';
      img.draggable = false;
      img.addEventListener('error', () => figure.remove(), { once: true });
      img.src = url;
      figure.append(img);
      part(index === 2 ? 'second' : 'photos').append(figure);
    }

    const jump = card.querySelector('.tjs-profile-jump');
    jump.addEventListener('click', () => {
      details.focus({ preventScroll: true });
      scroll.scrollTo({
        top: cover.offsetHeight - identity.offsetHeight,
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    });
    if (!candidate.is_demo && typeof window.openCurrentProfileDetails === 'function') {
      const options = document.createElement('button');
      options.type = 'button';
      options.className = 'tjs-profile-options-button';
      options.textContent = '•••';
      options.setAttribute('aria-label', label('Opciones del perfil', 'Profile options'));
      options.onclick = () => { if (isCurrent()) window.openCurrentProfileDetails(); };
      identity.append(options);
    }

    mountSwipe(scroll, card, isCurrent);
    paintDetails(candidate, candidate.is_demo && Array.isArray(candidate.interests) ? candidate.interests : []);
    if (candidate.is_demo) {
      cropPortrait(candidate.syntheticSprite).then(url => {
        if (isCurrent()) setCover(url);
      });
      return;
    }
    setCover(candidate.photo);
    state.textContent = label('Cargando el perfil…', 'Loading profile…');

    async function loadDetails() {
      const publicProfile = await p55detail(candidate.id, candidate);
      if (!isCurrent()) return;
      const paths = Array.isArray(publicProfile.photo_paths)
        ? [...new Set(publicProfile.photo_paths.filter(path => typeof path === 'string' && path))].slice(0, 9)
        : [];
      const [urls, interests] = await Promise.all([
        Promise.all(paths.map(async path => {
          try { return safeImageUrl(await signed(path)); } catch (_error) { return ''; }
        })),
        p55interests(publicProfile.interest_ids),
      ]);
      if (!isCurrent()) return;
      paintDetails({ ...candidate, ...publicProfile }, interests);
      const main = urls[0] || safeImageUrl(candidate.photo) || urls.find(Boolean);
      setCover(main);
      const photos = new Set(main ? [imageKey(main)] : []);
      for (const url of urls) {
        if (!url || photos.has(imageKey(url))) continue;
        photos.add(imageKey(url));
        addPhoto(url, photos.size);
      }
    }

    loadDetails().finally(() => {
      if (!isCurrent()) return;
      state.textContent = details.querySelector('section, figure') ? ''
        : label('Este perfil aún no tiene más información.', 'This profile has no more information yet.');
    });
  };
})();
