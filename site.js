(function () {
  var WA = '905076522826', ACILIS = 9, KAPANIS = 19, ADIM = 30, GUN_SAYISI = 14;
  var GUN = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  var GUN_UZUN = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  var AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  function dene(f) { try { f(); } catch (e) { if (window.console) console.warn(e); } }
  function $(s, k) { return (k || document).querySelector(s); }
  function iki(n) { return (n < 10 ? '0' : '') + n; }

  // Menü
  dene(function () {
    var dg = $('.menu-dg'), ck = $('#cekmece'), ust = $('#ust');
    dg.addEventListener('click', function () {
      var acik = dg.getAttribute('aria-expanded') === 'true';
      dg.setAttribute('aria-expanded', String(!acik));
      ck.hidden = acik;
    });
    ck.addEventListener('click', function (e) {
      if (e.target.closest('a')) { dg.setAttribute('aria-expanded', 'false'); ck.hidden = true; }
    });
    var f = function () { ust.classList.toggle('golgeli', window.scrollY > 8); };
    window.addEventListener('scroll', f, { passive: true }); f();
  });

  // Görünme animasyonu (3,5 sn emniyet)
  dene(function () {
    var el = document.querySelectorAll('.gor');
    function hepsi() { for (var i = 0; i < el.length; i++) el[i].classList.add('gorundu'); }
    if (!('IntersectionObserver' in window)) return hepsi();
    var io = new IntersectionObserver(function (g) {
      g.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('gorundu'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    for (var i = 0; i < el.length; i++) io.observe(el[i]);
    setTimeout(hepsi, 3500);
  });

  // Randevu
  var form = $('.rv-form'), gunlerEl = $('#gunler'), saatlerEl = $('#saatler');
  var bugun = new Date(); bugun.setHours(0, 0, 0, 0);
  function gunTarih(i) { var d = new Date(bugun); d.setDate(d.getDate() + i); return d; }
  // Demo için sabit "dolu" saatler: tarih + saat karmasıyla her açılışta aynı görünür.
  function dolu(d, dk) {
    var h = (d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) * 97 + dk * 13;
    h = (h ^ (h >>> 7)) * 2654435761 >>> 0;
    return h % 100 < 38;
  }
  function sure() { var r = form.querySelector('input[name=hizmet]:checked'); return r ? +r.getAttribute('data-sure') : 45; }
  function bosSaatler(d) {
    var out = [], simdi = new Date(), sr = sure();
    if (d.getDay() === 0) return out;
    for (var dk = ACILIS * 60; dk + sr <= KAPANIS * 60; dk += ADIM) {
      var t = new Date(d); t.setMinutes(dk);
      out.push({ dk: dk, bos: t > new Date(simdi.getTime() + 60 * 60000) && !dolu(d, dk) });
    }
    return out;
  }
  function saatYaz(dk) { return iki(Math.floor(dk / 60)) + ':' + iki(dk % 60); }

  dene(function () {
    var html = '';
    for (var i = 0; i < GUN_SAYISI; i++) {
      var d = gunTarih(i), kapali = d.getDay() === 0;
      var dolulu = !kapali && !bosSaatler(d).some(function (s) { return s.bos; });
      html += '<label><input type="radio" name="gun" value="' + i + '"' + (kapali || dolulu ? ' disabled' : '') + '><span><small>' +
        (i === 0 ? 'Bugün' : i === 1 ? 'Yarın' : GUN[d.getDay()]) + '</small><b>' + d.getDate() + '</b></span></label>';
    }
    gunlerEl.innerHTML = html;
    var ilk = gunlerEl.querySelector('input:not(:disabled)');
    if (ilk) ilk.checked = true;
    saatleriCiz();
    ilkBos();
  });

  function seciliGun() { var r = gunlerEl.querySelector('input:checked'); return r ? gunTarih(+r.value) : null; }
  function saatleriCiz() {
    var d = seciliGun();
    $('#ay-adi').textContent = d ? d.getDate() + ' ' + AY[d.getMonth()] + ' ' + GUN_UZUN[d.getDay()] : '';
    if (!d) { saatlerEl.innerHTML = '<p class="saat-yok">Lütfen bir gün seçin.</p>'; return; }
    var s = bosSaatler(d);
    if (!s.some(function (x) { return x.bos; })) { saatlerEl.innerHTML = '<p class="saat-yok">Bu günde boş saat kalmadı, başka bir gün seçin.</p>'; return; }
    saatlerEl.innerHTML = s.map(function (x) {
      return '<label><input type="radio" name="saat" value="' + x.dk + '"' + (x.bos ? '' : ' disabled') + '><span>' + saatYaz(x.dk) + '</span></label>';
    }).join('');
    ozetDg();
  }
  function ilkBos() {
    for (var i = 0; i < GUN_SAYISI; i++) {
      var d = gunTarih(i), s = bosSaatler(d).filter(function (x) { return x.bos; });
      if (s.length) {
        $('#ilk-bos').textContent = (i === 0 ? 'Bugün' : i === 1 ? 'Yarın' : GUN_UZUN[d.getDay()]) + ' ' + saatYaz(s[0].dk);
        return;
      }
    }
  }
  function ozetDg() {
    var s = form.querySelector('input[name=saat]:checked'), d = seciliGun();
    $('#rv-ozet-dg').textContent = s && d ? d.getDate() + ' ' + AY[d.getMonth()] + ' · ' + saatYaz(+s.value) + ' için onayla' : 'Randevuyu onayla';
  }

  dene(function () {
    form.addEventListener('change', function (e) {
      var n = e.target.name;
      if (n === 'hizmet' || n === 'gun') saatleriCiz();
      if (n === 'saat') ozetDg();
      if (n === 'kvkk') $('.hata-onay').classList.remove('goster');
    });
    form.addEventListener('input', function (e) {
      var a = e.target.closest('.alan'); if (a) a.classList.remove('hatali');
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ad = form.ad.value.trim(), tel = form.tel.value.replace(/\D/g, ''), ok = true, ilkHata = null;
      if (ad.length < 3) { form.ad.closest('.alan').classList.add('hatali'); ok = false; ilkHata = ilkHata || form.ad; }
      if (!/^(90)?0?5\d{9}$/.test(tel)) { form.tel.closest('.alan').classList.add('hatali'); ok = false; ilkHata = ilkHata || form.tel; }
      if (!form.kvkk.checked) { $('.hata-onay').classList.add('goster'); ok = false; }
      var s = form.querySelector('input[name=saat]:checked'), d = seciliGun();
      if (!s || !d) { saatlerEl.scrollIntoView({ block: 'center' }); saatlerEl.animate && saatlerEl.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], 300); return; }
      if (!ok) { if (ilkHata) ilkHata.focus(); return; }
      var hz = form.querySelector('input[name=hizmet]:checked').value;
      var tarih = d.getDate() + ' ' + AY[d.getMonth()] + ' ' + GUN_UZUN[d.getDay()], saat = saatYaz(+s.value);
      $('#ozet').innerHTML = '<b>' + hz + '</b><br>' + tarih + ' · ' + saat + '<br>' + ad.replace(/</g, '&lt;');
      var not = form.not.value.trim();
      var msj = 'Merhaba, online randevu talebim:\n• Hizmet: ' + hz + '\n• Tarih: ' + tarih + ' ' + saat + '\n• Ad: ' + ad + '\n• Telefon: ' + form.tel.value.trim() + (not ? '\n• Şikâyet: ' + not : '');
      $('#wa-gonder').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msj);
      form.hidden = true;
      var b = $('.rv-basari'); b.hidden = false; b.focus({ preventScroll: true });
      $('#rv').scrollIntoView({ block: 'start' });
    });
    $('#yeni').addEventListener('click', function () {
      form.reset(); $('.rv-basari').hidden = true; form.hidden = false;
      var ilk = gunlerEl.querySelector('input:not(:disabled)'); if (ilk) ilk.checked = true;
      saatleriCiz();
    });
  });
})();
