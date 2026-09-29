(() => {
  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const cardClass = (index, count) => count > 1 || index % 4 === 0 ? 'wide' : index % 3 === 1 ? 'tall' : 'standard';

  function renderProjects(projects) {
    const grid = document.querySelector('.project-grid');
    if (!grid || !projects.length) return;
    grid.innerHTML = projects.map((project, index) => {
      const images = Array.isArray(project.images) ? project.images.filter(Boolean) : [];
      if (!images.length) return '';
      const title = escapeHtml(project.title);
      const description = escapeHtml(project.description);
      const label = escapeHtml(project.categoryLabel || 'مشروع');
      const count = images.length;
      return `<button class="project-card ${cardClass(index, count)} reveal revealed" type="button" data-project="true" data-category="${escapeHtml(project.category)}" data-image="${escapeHtml(images[0])}" data-images="${escapeHtml(images.join('|'))}" data-title="${title}" data-description="${description}" data-category-label="${label}" aria-label="عرض مشروع ${title}"><img src="${escapeHtml(images[0])}" alt="" loading="lazy" decoding="async"><span class="project-overlay" aria-hidden="true"></span><span class="project-content"><span class="project-category">${label}</span><strong>${title}</strong><small>${description}</small></span><span class="project-open" aria-hidden="true">↗</span>${count > 1 ? `<span class="project-count" aria-hidden="true">${count} صور</span>` : ''}</button>`;
    }).join('');

    let activeImages = [];
    let activeIndex = 0;
    const dialog = document.getElementById('project-dialog');
    const paintDialog = () => {
      const image = dialog?.querySelector('[data-dialog-image]');
      if (!image || !activeImages.length) return;
      image.src = activeImages[activeIndex];
      dialog.querySelector('[data-dialog-counter]').textContent = `${activeIndex + 1} / ${activeImages.length}`;
      dialog.querySelector('[data-dialog-prev]').hidden = activeImages.length < 2;
      dialog.querySelector('[data-dialog-next]').hidden = activeImages.length < 2;
    };
    grid.querySelectorAll('[data-project]').forEach((card) => card.addEventListener('click', () => {
      const dialog = document.getElementById('project-dialog');
      if (!dialog) return;
      activeImages = (card.dataset.images || '').split('|').filter(Boolean);
      activeIndex = 0;
      const image = dialog.querySelector('[data-dialog-image]');
      dialog.querySelector('[data-dialog-title]').textContent = card.dataset.title || '';
      dialog.querySelector('[data-dialog-description]').textContent = card.dataset.description || '';
      dialog.querySelector('[data-dialog-category]').textContent = card.dataset.categoryLabel || '';
      image.alt = card.dataset.title || '';
      paintDialog();
      dialog.showModal(); document.body.classList.add('dialog-open');
    }));
    dialog?.querySelector('[data-dialog-prev]')?.addEventListener('click', (event) => { event.stopImmediatePropagation(); activeIndex = (activeIndex - 1 + activeImages.length) % activeImages.length; paintDialog(); }, true);
    dialog?.querySelector('[data-dialog-next]')?.addEventListener('click', (event) => { event.stopImmediatePropagation(); activeIndex = (activeIndex + 1) % activeImages.length; paintDialog(); }, true);

    document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      grid.querySelectorAll('[data-project]').forEach((card) => { card.hidden = filter !== 'all' && card.dataset.category !== filter; });
    }));
  }

  function renderHero(projects) {
    const featured = projects.filter((project) => project.featured && project.images?.length);
    const slides = [...document.querySelectorAll('[data-hero-slide]')];
    if (!featured.length || !slides.length) return;
    slides.forEach((slide, index) => {
      const project = featured[index % featured.length];
      slide.src = project.images[0];
      slide.alt = project.title;
      slide.dataset.title = project.title;
      slide.dataset.category = project.categoryLabel || 'مشروع';
    });
  }

  fetch(`projects.json?v=${Date.now()}`, {cache:'no-store'})
    .then((response) => response.ok ? response.json() : Promise.reject())
    .then((projects) => { renderHero(projects); renderProjects(projects); })
    .catch(() => {});
})();
