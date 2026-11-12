/* Rei das Fibras — vitrine, ficha, sacola → pedido no WhatsApp; cena do espelho e trança na lateral (v2).
   Sem gateway: o pedido é salvo no navegador (para o painel) e sai pronto no WhatsApp da loja. */
(function () {
  'use strict';
  const L = window.LOJA;
  const $ = (s, el = document) => el.querySelector(s);
  const ler = (k, padrao) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? padrao; } catch (e) { return padrao; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const real = n => 'R$ ' + Number(n).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const zap = txt => 'https://wa.me/' + L.whatsapp + '?text=' + encodeURIComponent(txt);

  // produtos: o painel pode ter salvo uma versão editada
  const produtos = ler('rdf_produtos', null) || window.PRODUTOS;
  const porId = id => produtos.find(p => p.id === id);
  let sacola = ler('rdf_sacola', []).filter(i => porId(i.id));
  let filtro = 'todos', termo = '';

  function precoHTML(p) {
    if (p.preco == null || p.preco === '') return '<span class="consulta">Preço a confirmar</span>';
    return (p.de ? '<s>' + real(p.de) + '</s>' : '') + '<b>' + real(p.preco) + '</b>';
  }
  function carimbo(p) {
    if (p.esgotado) return '<span class="carimbo esg">Esgotado</span>';
    if (p.exemplo) return '<span class="carimbo ex">Exemplo</span>';
    if (p.de && p.preco) return '<span class="carimbo">' + esc(p.selo || 'Promoção') + '</span>';
    return p.selo ? '<span class="carimbo">' + esc(p.selo) + '</span>' : '';
  }

  /* ---------- vitrine ---------- */
  const fil = $('#filtros');
  fil.innerHTML = window.CATEGORIAS.map(([k, n]) => `<button type="button" data-cat="${k}" aria-pressed="${k === 'todos'}">${n}</button>`).join('');
  fil.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    filtro = b.dataset.cat;
    fil.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
    vitrine();
  });
  function filtrarPor(cat) {
    const b = fil.querySelector(`[data-cat="${cat}"]`) || fil.querySelector('[data-cat="todos"]');
    b.click();
  }
  $('#busca').addEventListener('input', e => { termo = e.target.value.trim().toLowerCase(); vitrine(); });

  function vitrine() {
    const lista = produtos.filter(p => (filtro === 'todos' || p.cat === filtro) &&
      (!termo || [p.nome, p.sub, (p.cores || []).join(' '), p.cat].join(' ').toLowerCase().includes(termo)));
    $('#grade').innerHTML = lista.length ? lista.map(p => `
      <button type="button" class="peca revela${p.esgotado ? ' esgotado' : ''}${p.real && !p.exemplo ? ' destaque' : ''}" data-id="${p.id}">
        <span class="moldura"><img src="${esc(p.foto)}" alt="${esc(p.nome)}" loading="lazy">${carimbo(p)}</span>
        <span class="tipo">${esc((window.CATEGORIAS.find(c => c[0] === p.cat) || [, ''])[1])}</span>
        <span class="nome">${esc(p.nome)}</span>
        <span class="sub">${esc(p.sub || '')}</span>
        <span class="preco">${precoHTML(p)}</span>
      </button>`).join('') : '<p class="vazio">Nada encontrado com esse filtro. Tente "Tudo".</p>';
    observar();
  }
  $('#grade').addEventListener('click', e => { const c = e.target.closest('.peca'); if (c) ficha(c.dataset.id); });

  /* ---------- ficha do produto ---------- */
  const dlg = $('#ficha');
  function ficha(id) {
    const p = porId(id); let qtd = 1;
    const linhas = Object.entries(p.ficha || {}).map(([k, v]) =>
      `<tr><th>${esc(k)}</th><td class="${/confirmar/.test(v) ? 'conf' : ''}">${esc(v)}</td></tr>`).join('');
    const cores = (p.cores || []).length ? `<fieldset class="cores"><legend>Cor</legend>${p.cores.map((c, i) =>
      `<label><input type="radio" name="cor" value="${esc(c)}" ${i ? '' : 'checked'}><span>Cor ${esc(c)}</span></label>`).join('')}</fieldset>` : '';
    $('#fichaCorpo').innerHTML = `
      <div class="ficha-fotos"><img src="${esc(p.foto)}" alt="${esc(p.nome)}">${p.foto2 ? `<img src="${esc(p.foto2)}" alt="Embalagem do ${esc(p.nome)}">` : ''}</div>
      <div class="ficha-info">
        <p class="sobre">${esc((window.CATEGORIAS.find(c => c[0] === p.cat) || [, ''])[1])}</p>
        <h2 id="fichaNome">${esc(p.nome)}</h2>
        <p class="sub">${esc(p.sub || '')}</p>
        <p class="preco">${precoHTML(p)}</p>
        <p>${esc(p.texto || '')}</p>
        ${linhas ? `<table class="ficha-tab">${linhas}${!p.cores?.length && p.cat !== 'cuidados' ? '<tr><th>Cores</th><td class="conf">a confirmar</td></tr>' : ''}</table>` : ''}
        ${cores}
        <div class="ficha-acoes">
          <span class="qtd"><button type="button" data-q="-1" aria-label="Menos">−</button><output id="fq">1</output><button type="button" data-q="1" aria-label="Mais">+</button></span>
          <button type="button" class="botao" id="addSacola" ${p.esgotado ? 'disabled' : ''}>${p.esgotado ? 'Esgotado' : 'Pôr na sacola'}</button>
        </div>
        ${p.exemplo ? '<p class="ficha-ex"><strong>Produto de exemplo.</strong> Ficha, cores e preço entram quando a loja passar a lista. Se pedir, a loja informa o valor no WhatsApp.</p>' : ''}
      </div>`;
    dlg.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { qtd = Math.max(1, qtd + +b.dataset.q); $('#fq').textContent = qtd; });
    $('#addSacola').onclick = () => {
      const cor = (dlg.querySelector('input[name=cor]:checked') || {}).value || '';
      adicionar(p.id, cor, qtd); dlg.close(); abrirSacola();
    };
    dlg.showModal();
  }
  dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('[data-fechar]')) dlg.close(); });

  /* ---------- sacola ---------- */
  const elS = $('#sacola'), veu = $('#veu');
  function abrirSacola() { elS.classList.add('aberta'); elS.setAttribute('aria-hidden', 'false'); veu.hidden = false; document.body.style.overflow = 'hidden'; $('#fecharSacola').focus(); }
  function fecharSacola() { elS.classList.remove('aberta'); elS.setAttribute('aria-hidden', 'true'); veu.hidden = true; document.body.style.overflow = ''; }
  $('#abrirSacola').onclick = abrirSacola; $('#fecharSacola').onclick = fecharSacola; veu.onclick = fecharSacola;
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharSacola(); });

  function adicionar(id, cor, qtd) {
    const it = sacola.find(i => i.id === id && i.cor === cor);
    it ? it.qtd += qtd : sacola.push({ id, cor, qtd });
    salvarSacola(); toast('Na sacola ♛');
    const b = $('#abrirSacola'); b.classList.remove('pulo'); void b.offsetWidth; b.classList.add('pulo');
  }
  function salvarSacola() { gravar('rdf_sacola', sacola); desenharSacola(); }

  function totais() {
    let sub = 0, semPreco = 0, n = 0;
    sacola.forEach(i => { const p = porId(i.id); n += i.qtd; if (p.preco == null || p.preco === '') semPreco++; else sub += p.preco * i.qtd; });
    return { sub, semPreco, n };
  }
  function desenharSacola() {
    const t = totais();
    $('#contaSacola').textContent = t.n;
    elS.dataset.vazia = sacola.length ? '0' : '1';
    $('#sacolaLista').innerHTML = sacola.length ? sacola.map((i, k) => {
      const p = porId(i.id); const tem = !(p.preco == null || p.preco === '');
      return `<div class="item">
        <img src="${esc(p.foto)}" alt="">
        <div>
          <h3>${esc(p.nome)}</h3>
          <p class="det">${i.cor ? 'Cor ' + esc(i.cor) + ' · ' : ''}${tem ? real(p.preco) + ' cada' : 'preço a confirmar'}${p.exemplo ? ' · exemplo' : ''}</p>
          <div class="item-linha">
            <span class="qtd"><button type="button" data-k="${k}" data-d="-1" aria-label="Menos">−</button><output>${i.qtd}</output><button type="button" data-k="${k}" data-d="1" aria-label="Mais">+</button></span>
            <span class="item-valor${tem ? '' : ' conf'}">${tem ? real(p.preco * i.qtd) : 'a confirmar'}</span>
          </div>
          <button type="button" class="remover" data-rm="${k}">Tirar da sacola</button>
        </div></div>`;
    }).join('') : `<div class="sacola-vazia"><svg><use href="#coroa"/></svg><p>Sua sacola está vazia.</p><span>Escolha a sua coroa na vitrine.</span><br><br><a class="botao" href="#vitrine" id="irVitrine">Ver a vitrine</a></div>`;
    $('#subtotal').textContent = real(t.sub);
    $('#subNota').textContent = t.semPreco ? `+ ${t.semPreco} ${t.semPreco > 1 ? 'itens' : 'item'} com preço a confirmar pela loja` : '';
    const iv = $('#irVitrine'); if (iv) iv.onclick = fecharSacola;
  }
  $('#sacolaLista').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.rm) { sacola.splice(+b.dataset.rm, 1); return salvarSacola(); }
    if (b.dataset.k) { const it = sacola[+b.dataset.k]; it.qtd += +b.dataset.d; if (it.qtd < 1) sacola.splice(+b.dataset.k, 1); salvarSacola(); }
  });

  const form = $('#formPedido');
  const nomesEntrega = { salvador: 'Delivery em Salvador', brasil: 'Envio para o Brasil', retirada: 'Retirar na loja' };
  function trocaEntrega() {
    const v = form.entrega.value;
    $('#entregaInfo').textContent = L.entrega[v];
    $('#campoEnd').hidden = v === 'retirada';
    form.endereco.required = v !== 'retirada';
    $('#campoEnd span').textContent = v === 'brasil' ? 'CEP e cidade' : 'Endereço em Salvador';
  }
  form.addEventListener('change', trocaEntrega);
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!sacola.length) return;
    const t = totais(), f = new FormData(form);
    const pedido = {
      id: 'RF' + Date.now().toString().slice(-6), data: new Date().toISOString(), status: 'novo',
      nome: f.get('nome').trim(), entrega: f.get('entrega'), endereco: (f.get('endereco') || '').trim(),
      atacado: !!f.get('atacado'), subtotal: t.sub, semPreco: t.semPreco,
      itens: sacola.map(i => { const p = porId(i.id); return { id: i.id, nome: p.nome, cor: i.cor, qtd: i.qtd, preco: p.preco ?? null }; })
    };
    const linhas = pedido.itens.map(i => `• ${i.qtd}x ${i.nome}${i.cor ? ' — cor ' + i.cor : ''} — ${i.preco != null ? real(i.preco * i.qtd) : 'preço a confirmar'}`);
    const msg = [
      'Olá, Rei das Fibras! 👑 Quero fazer este pedido pelo site:',
      '', `*Pedido ${pedido.id}*${pedido.atacado ? ' — ATACADO' : ''}`, ...linhas, '',
      `Subtotal: ${real(t.sub)}${t.semPreco ? ' (+ itens com preço a confirmar)' : ''}`,
      `Entrega: ${nomesEntrega[pedido.entrega]}${pedido.endereco ? ' — ' + pedido.endereco : ''}`,
      `Nome: ${pedido.nome}`, '', 'Pode me passar o frete e a forma de pagamento?'
    ].join('\n');
    const pedidos = ler('rdf_pedidos', []); pedidos.unshift(pedido); gravar('rdf_pedidos', pedidos);
    window.open(zap(msg), '_blank', 'noopener');
    sacola = []; salvarSacola(); form.reset(); trocaEntrega(); fecharSacola();
    toast('Pedido ' + pedido.id + ' enviado para o WhatsApp');
  });

  /* ---------- dados da loja ---------- */
  $('#endereco').innerHTML = esc(L.endereco) + '<small>' + esc(L.referencia) + '</small>';
  $('#horario').insertAdjacentHTML('beforeend', L.horario.map(([d, h]) => `<tr><td>${d}</td><td>${h}</td></tr>`).join(''));
  $('#entregaNota').textContent = L.entrega.salvador + ' ' + L.entrega.brasil;
  $('#linkMapa').href = L.mapa;
  $('#zapLoja').href = zap('Olá, Rei das Fibras! Vim pelo site e queria tirar uma dúvida.');
  $('#zapAtacado').href = zap('Olá, Rei das Fibras! Quero comprar no atacado. Pode me passar a tabela e o pedido mínimo?');
  if (L.atacadoMinimo) $('#minimo').textContent = L.atacadoMinimo;
  const zt = $('#zapTexto'); if (zt) zt.textContent = L.whatsappTexto;

  function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 2600); }

  /* ---------- movimento ---------- */
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let io;
  function observar() {
    if (quieto || !('IntersectionObserver' in window)) { document.querySelectorAll('.revela').forEach(x => x.classList.add('on')); return; }
    io = io || new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('on'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.revela:not(.on)').forEach(x => io.observe(x));
  }
  document.querySelectorAll('.vitrine-cab, .atacado-txt, .como-txt, .balao, .etiqueta, .loja-txt').forEach(x => x.classList.add('revela'));

  const liso = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const limita = x => Math.min(1, Math.max(0, x));
  const raiz = document.documentElement;
  const topoAltura = () => { const t = $('.topo'); raiz.style.setProperty('--topo', (t ? t.offsetHeight : 66) + 'px'); };
  topoAltura(); addEventListener('resize', topoAltura);

  // progresso 0→1 de uma seção presa: GSAP ScrollTrigger se carregou; senão, conta própria
  const usaGsap = !quieto && !!(window.gsap && window.ScrollTrigger);
  if (usaGsap) gsap.registerPlugin(ScrollTrigger);
  function cena(el, fn) {
    fn(0);
    if (usaGsap) {
      const o = { p: 0 };
      gsap.to(o, { p: 1, ease: 'none', onUpdate: () => fn(o.p), scrollTrigger: { trigger: el, start: () => 'top ' + ($('.topo').offsetHeight) + 'px', end: 'bottom bottom', scrub: 0.4, invalidateOnRefresh: true } });
      addEventListener('load', () => ScrollTrigger.refresh());
      return;
    }
    let pend = false;
    const tick = () => { pend = false; const r = el.getBoundingClientRect(), t = $('.topo').offsetHeight, tot = r.height - (innerHeight - t); fn(tot > 0 ? limita((t - r.top) / tot) : 0); };
    addEventListener('scroll', () => { if (!pend) { pend = true; requestAnimationFrame(tick); } }, { passive: true });
    addEventListener('resize', tick); tick();
  }

  /* ---------- CENA: espelho do salão ---------- */
  // cada reflexo leva para a parte da vitrine que tem aquele tipo de cabelo
  const ESTADOS = [['Ver tudo', 'todos'], ['Ver jumbos', 'jumbo'], ['Ver cabelos bio', 'bio'], ['Ver cabelos bio', 'bio'], ['Ver orgânicos', 'organico'], ['Ver orgânicos', 'organico']];
  const cenaEl = $('#espelho'), reflexos = [...document.querySelectorAll('.reflexo')], palavras = [...document.querySelectorAll('#palavras > span')];
  const N = reflexos.length, atalho = $('#espelhoAtalho'), brilho = $('#brilho'), pontosEl = $('#pontos'), lamp = $('#lampadas');
  const comCena = !quieto;
  // lâmpadas de camarim em três lados do espelho
  const LAMP = [];
  [10, 30, 50, 70, 90].forEach(x => LAMP.push(`top:0;left:${x}%`));
  [22, 44, 66, 88].forEach(y => { LAMP.push(`left:0;top:${y}%`); LAMP.push(`left:100%;top:${y}%`); });
  lamp.innerHTML = LAMP.map((s, i) => `<i style="${s};--d:${(i * 0.06).toFixed(2)}s"></i>`).join('');
  setTimeout(() => lamp.classList.add('acesas'), quieto ? 0 : 250);

  pontosEl.innerHTML = palavras.map((w, i) => `<button type="button" aria-label="${esc(w.textContent.replace('.', ''))}" aria-pressed="${i === 0}"></button>`).join('');
  let estado = -1;
  function espelho(pos) {
    reflexos.forEach((r, i) => {
      if (!i) return;
      const t = liso(i - 0.7, i - 0.15, pos);
      r.style.clipPath = `inset(0 0 ${((1 - t) * 100).toFixed(2)}% 0)`;
      r.style.visibility = t <= 0 ? 'hidden' : 'visible';
      r.firstElementChild.style.transform = `scale(${(1.1 - 0.1 * t).toFixed(3)})`;
    });
    palavras.forEach((w, i) => {
      const d = pos - i, a = Math.max(0, 1 - Math.abs(d) * 2.2);
      w.style.opacity = a.toFixed(3);
      w.style.transform = `translate3d(0,${(-d * 70).toFixed(1)}%,0)`;
    });
    const f = pos - Math.floor(pos);
    brilho.style.opacity = (Math.sin(Math.PI * f) * 0.75).toFixed(3);
    brilho.style.transform = `translate3d(${(-130 + f * 260).toFixed(1)}%,0,0) skewX(-18deg)`;
    const e = Math.min(N - 1, Math.round(pos));
    if (e !== estado) {
      estado = e;
      atalho.textContent = ESTADOS[e][0]; atalho.dataset.cat = ESTADOS[e][1];
      pontosEl.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-pressed', String(i === e)));
    }
  }
  const posDe = p => limita((p - 0.04) / 0.88) * (N - 1);
  if (comCena) { raiz.classList.add('cena-on'); cena(cenaEl, p => espelho(posDe(p))); }
  else espelho(0);

  pontosEl.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const i = [...pontosEl.children].indexOf(b);
    if (!comCena) return espelho(i);
    const t = $('.topo').offsetHeight, tot = cenaEl.offsetHeight - (innerHeight - t);
    const p = 0.04 + (i / (N - 1)) * 0.88;
    scrollTo({ top: cenaEl.getBoundingClientRect().top + scrollY - t + tot * p, behavior: 'smooth' });
  });
  atalho.addEventListener('click', e => {
    e.preventDefault();
    filtrarPor(atalho.dataset.cat || 'todos');
    $('#vitrine').scrollIntoView({ behavior: quieto ? 'auto' : 'smooth' });
  });

  /* ---------- trança de 3 mechas na lateral ---------- */
  // três mechas senoidais defasadas 120°; cada pedacinho é desenhado na ordem da profundidade (cos da fase),
  // então a mecha que "vem para a frente" passa por cima: o desenho vira trança. A rolagem revela de cima para baixo.
  const tr = $('#tranca'), tsvg = $('#trancaSvg'), anel = $('.tranca-anel');
  let trH = 0;
  function desenhaTranca() {
    const w = tr.clientWidth, h = tr.clientHeight; if (!w || !h) return;
    trH = h;
    const fina = w < 24, lam = fina ? 44 : 86, A = w * 0.27, cx = w / 2, esp = fina ? 4 : 9, passo = 4;
    const cores = ['#3a1a10', '#7d1230', '#c4952f'];
    const segs = [];
    for (let k = 0; k < 3; k++) {
      let px = null, py = 0;
      for (let y = -passo; y <= h + passo; y += passo) {
        const fase = 2 * Math.PI * y / lam + k * 2 * Math.PI / 3;
        const x = cx + A * Math.sin(fase);
        if (px !== null) segs.push([Math.cos(fase - Math.PI * passo / lam), k, `M${px.toFixed(1)} ${py}L${x.toFixed(1)} ${y}`]);
        px = x; py = y;
      }
    }
    segs.sort((a, b) => a[0] - b[0]);
    tsvg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    tsvg.setAttribute('width', w); tsvg.setAttribute('height', h);
    tsvg.innerHTML = '<g fill="none" stroke-linecap="round">' + segs.map(s =>
      `<path d="${s[2]}" stroke="#1b0b0f" stroke-width="${esp + 2}"/><path d="${s[2]}" stroke="${cores[s[1]]}" stroke-width="${esp}"/>`).join('') + '</g>';
  }
  let ultimaP = 1;
  function tranca(p) {
    ultimaP = p;
    const v = 0.05 + 0.95 * p;
    tsvg.style.clipPath = `inset(0 0 ${((1 - v) * 100).toFixed(2)}% 0)`;
    anel.style.transform = `translate3d(-50%,${(v * trH).toFixed(1)}px,0)`;
  }
  desenhaTranca();
  if (quieto) tranca(1);
  else {
    let pend = false;
    const tick = () => { pend = false; const tot = document.documentElement.scrollHeight - innerHeight; tranca(tot > 0 ? limita(scrollY / tot) : 1); };
    addEventListener('scroll', () => { if (!pend) { pend = true; requestAnimationFrame(tick); } }, { passive: true });
    addEventListener('load', tick);
    tick();
  }
  let rz;
  addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { desenhaTranca(); tranca(ultimaP); }, 150); });

  vitrine(); desenharSacola(); trocaEntrega();
})();
