/* Rei das Fibras — painel da loja (demo).
   Senha fixa e dados no localStorage: no MVP, isso vira Supabase com login de verdade. */
(function () {
  'use strict';
  const SENHA = 'zync';
  const $ = s => document.querySelector(s);
  const ler = (k, p) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? p; } catch (e) { return p; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const real = n => 'R$ ' + Number(n).toFixed(2).replace('.', ',');
  const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const copia = o => JSON.parse(JSON.stringify(o));
  const STATUS = ['novo', 'confirmado', 'pago', 'enviado', 'entregue', 'cancelado'];
  const ENTREGA = { salvador: 'Delivery em Salvador', brasil: 'Envio para o Brasil', retirada: 'Retirar na loja' };

  let produtos = copia(ler('rdf_produtos', null) || window.PRODUTOS);

  function entrar() { $('#telaEntrar').hidden = true; $('#painel').hidden = false; pedidos(); listaProdutos(); }
  try { if (sessionStorage.getItem('rdf_admin') === '1') entrar(); } catch (e) {}
  $('#formEntrar').onsubmit = e => {
    e.preventDefault();
    if ($('#senha').value.trim() === SENHA) { try { sessionStorage.setItem('rdf_admin', '1'); } catch (e) {} entrar(); }
    else $('#erro').textContent = 'Senha incorreta.';
  };
  $('#sair').onclick = () => { try { sessionStorage.removeItem('rdf_admin'); } catch (e) {} location.reload(); };

  document.querySelectorAll('[data-aba]').forEach(b => b.onclick = () => {
    document.querySelectorAll('[data-aba]').forEach(x => x.setAttribute('aria-selected', x === b));
    $('#aba-pedidos').hidden = b.dataset.aba !== 'pedidos';
    $('#aba-produtos').hidden = b.dataset.aba !== 'produtos';
  });

  /* ---------- pedidos ---------- */
  /* pedidos de demonstração na primeira visita, para o painel não abrir vazio */
  if (ler('rdf_pedidos', null) === null) {
    const h = Date.now();
    gravar('rdf_pedidos', [
      { id: 'RDF-1003 (exemplo)', data: h - 36e5, nome: 'Cliente de exemplo', status: 'novo', entrega: 'salvador', endereco: 'Pernambués', itens: [{ qtd: 2, nome: 'Cabelo Catarina', cor: '350', preco: 78 }, { qtd: 1, nome: 'Mousse Modelador Fixa Liss', preco: 12 }], subtotal: 168 },
      { id: 'RDF-1002 (exemplo)', data: h - 26e6, nome: 'Revendedora de exemplo', status: 'confirmado', atacado: true, entrega: 'brasil', endereco: 'Feira de Santana/BA', itens: [{ qtd: 10, nome: 'Cabelo Catarina', cor: '8', preco: 78 }], subtotal: 780 },
      { id: 'RDF-1001 (exemplo)', data: h - 9e7, nome: 'Cliente de exemplo', status: 'entregue', entrega: 'retirada', itens: [{ qtd: 3, nome: 'Mousse Modelador Fixa Liss', preco: 12 }], subtotal: 36 }
    ]);
  }

  function pedidos() {
    const lista = ler('rdf_pedidos', []);
    const novos = lista.filter(p => p.status === 'novo').length;
    const total = lista.filter(p => p.status !== 'cancelado').reduce((s, p) => s + (p.subtotal || 0), 0);
    $('#resumo').innerHTML = `<div><b>${lista.length}</b><span>pedidos</span></div><div><b>${novos}</b><span>aguardando</span></div><div><b>${real(total)}</b><span>em itens com preço</span></div>`;
    $('#listaPedidos').innerHTML = lista.length ? lista.map((p, k) => `
      <article class="pedido">
        <header><h3>${esc(p.id)}${p.atacado ? '<span class="selo-at">Atacado</span>' : ''}</h3>
          <label>Status <select data-k="${k}">${STATUS.map(s => `<option ${s === p.status ? 'selected' : ''}>${s}</option>`).join('')}</select></label></header>
        <p class="meta">${new Date(p.data).toLocaleString('pt-BR')} · ${esc(p.nome)}</p>
        <p class="meta">${ENTREGA[p.entrega] || ''}${p.endereco ? ' — ' + esc(p.endereco) : ''}</p>
        <ul>${p.itens.map(i => `<li>${i.qtd}x ${esc(i.nome)}${i.cor ? ' — cor ' + esc(i.cor) : ''} — ${i.preco != null ? real(i.preco * i.qtd) : 'preço a confirmar'}</li>`).join('')}</ul>
        <p><strong>Subtotal: ${real(p.subtotal)}</strong>${p.semPreco ? ' + itens a confirmar' : ''}</p>
      </article>`).join('') : '<p class="vazio-p">Nenhum pedido ainda. Faça um pedido na loja (neste mesmo navegador) e ele aparece aqui.</p>';
  }
  $('#listaPedidos').addEventListener('change', e => {
    const s = e.target.closest('select'); if (!s) return;
    const lista = ler('rdf_pedidos', []); lista[+s.dataset.k].status = s.value; gravar('rdf_pedidos', lista); pedidos(); toast('Status atualizado');
  });

  /* ---------- produtos ---------- */
  function listaProdutos() {
    $('#listaProdutos').innerHTML = produtos.map((p, k) => `
      <div class="prod" data-k="${k}">
        <img src="${esc(p.foto)}" alt="">
        <div>
          <h3>${esc(p.nome)}</h3>
          <p class="tags">${p.real ? 'Preço confirmado no Instagram' : 'Exemplo — preço a confirmar'}${p.esgotado ? ' · esgotado' : ''}</p>
          <div class="campos">
            <label class="larga"><span>Nome</span><input type="text" data-c="nome" value="${esc(p.nome)}"></label>
            <label><span>Preço (R$)</span><input type="number" step="0.01" min="0" data-c="preco" value="${p.preco ?? ''}" placeholder="a confirmar"></label>
            <label><span>Preço "de" (promoção)</span><input type="number" step="0.01" min="0" data-c="de" value="${p.de ?? ''}" placeholder="sem promoção"></label>
            <label><span>Tipo</span><select data-c="cat">${window.CATEGORIAS.slice(1).map(([c, n]) => `<option value="${c}" ${c === p.cat ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
            <label class="liga"><input type="checkbox" data-c="esgotado" ${p.esgotado ? 'checked' : ''}> Esgotado</label>
          </div>
        </div>
      </div>`).join('');
  }
  function colher() {
    document.querySelectorAll('.prod').forEach(el => {
      const p = produtos[+el.dataset.k];
      el.querySelectorAll('[data-c]').forEach(i => {
        const c = i.dataset.c;
        if (i.type === 'checkbox') p[c] = i.checked;
        else if (i.type === 'number') p[c] = i.value === '' ? null : Number(i.value);
        else p[c] = i.value;
      });
      if (p.preco != null && p.exemplo) { p.exemplo = false; p.sub = p.sub === 'Produto de exemplo' ? '' : p.sub; }
    });
  }
  $('#salvar').onclick = () => { colher(); gravar('rdf_produtos', produtos); listaProdutos(); toast('Vitrine atualizada'); };
  $('#novo').onclick = () => {
    colher();
    produtos.push({ id: 'p' + Date.now(), cat: 'jumbo', nome: 'Novo produto', sub: '', preco: null, de: null, foto: 'fotos/logo.jpg', ficha: { Comprimento: 'a confirmar', Peso: 'a confirmar', Método: 'a confirmar' }, cores: [], texto: '' });
    listaProdutos(); document.querySelector('.prod:last-child input').focus();
  };
  $('#restaurar').onclick = () => {
    if (!confirm('Voltar a vitrine para os produtos originais da demonstração?')) return;
    try { localStorage.removeItem('rdf_produtos'); } catch (e) {}
    produtos = copia(window.PRODUTOS); listaProdutos(); toast('Vitrine original restaurada');
  };

  function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 2400); }
})();
