/* Rei das Fibras — dados da loja e da vitrine.
   É o único arquivo que muda quando os dados da loja mudam.
   Produto com real:true = dado confirmado no Instagram (post de Black Friday, nov/2026).
   Produto com exemplo:true = só para mostrar o catálogo; preço e ficha A CONFIRMAR com a loja. */
window.LOJA = {
  nome: 'Rei das Fibras',
  bairro: 'Pernambués',
  instagram: 'fibrasrei',
  seguidores: '108 mil',
  whatsapp: '5571996902189',
  whatsappTexto: '(71) 99690-2189',
  endereco: 'Rua Thomás Gonzaga, 333 — Pernambués, Salvador/BA',
  referencia: 'ao lado da Igreja Universal',
  mapa: 'https://www.google.com/maps/search/?api=1&query=Rua%20Thom%C3%A1s%20Gonzaga%2C%20333%2C%20Pernambu%C3%A9s%2C%20Salvador%20BA',
  horario: [
    ['Segunda a sábado', '9h às 17h'],
    ['Domingo', '9h às 13h']
  ],
  entrega: {
    salvador: 'Delivery em Salvador. No sábado, pedidos até 13h. Domingo só loja física.',
    brasil: 'Enviamos para todo o Brasil. O frete é calculado e combinado no WhatsApp.',
    retirada: 'Retire na loja física, em Pernambués, no horário de funcionamento.'
  },
  atacadoMinimo: null // pedido mínimo do atacado: A CONFIRMAR
};

window.CATEGORIAS = [
  ['todos', 'Tudo'],
  ['jumbo', 'Jumbo'],
  ['organico', 'Orgânico'],
  ['bio', 'Bio'],
  ['queratina', 'Fibra de queratina'],
  ['cuidados', 'Cuidados']
];

window.PRODUTOS = [
  {
    id: 'catarina', real: true, cat: 'queratina', selo: 'Black das Blacks',
    nome: 'Cabelo Catarina', sub: 'Fibra de queratina',
    preco: 78, de: 130,
    foto: 'fotos/catarina-modelo.jpg', foto2: 'fotos/catarina.jpg',
    ficha: { Comprimento: '50 cm', Peso: '320 g', Método: 'Entrelace' },
    cores: ['8', '350'],
    texto: 'Cacho fechado, cheio de volume, em fibra de queratina. Vem nas cores 8 e 350.'
  },
  {
    id: 'fixa-liss', real: true, cat: 'cuidados', selo: 'Lançamento',
    nome: 'Mousse Modelador Fixa Liss', sub: 'Tranças, cachos e baby hair',
    preco: 12, de: 15,
    foto: 'fotos/fixa-liss.jpg',
    ficha: { Uso: 'Tranças, cachos e baby hair', Fixação: 'Até 24 horas' },
    cores: [],
    texto: 'Mousse modelador para finalizar tranças, definir cachos e alinhar o baby hair, com fixação de até 24 horas.'
  },
  {
    id: 'jumbo-ex', exemplo: true, cat: 'jumbo',
    nome: 'Jumbo para tranças', sub: 'Produto de exemplo',
    preco: null, foto: 'fotos/rainha-trancas-azul.jpg',
    ficha: { Comprimento: 'a confirmar', Peso: 'a confirmar', Método: 'Tranças' },
    cores: [],
    texto: 'Exemplo de como um jumbo aparece na vitrine. Cores, peso e preço entram quando a loja passar a lista.'
  },
  {
    id: 'box-ex', exemplo: true, cat: 'jumbo',
    nome: 'Jumbo para box braids', sub: 'Produto de exemplo',
    preco: null, foto: 'fotos/rainha-box.jpg',
    ficha: { Comprimento: 'a confirmar', Peso: 'a confirmar', Método: 'Box braids' },
    cores: [],
    texto: 'Exemplo de vitrine. Ficha e preço a confirmar com a loja.'
  },
  {
    id: 'organico-ex', exemplo: true, cat: 'organico',
    nome: 'Cabelo orgânico ondulado', sub: 'Produto de exemplo',
    preco: null, foto: 'fotos/rainha-ondas.jpg',
    ficha: { Comprimento: 'a confirmar', Peso: 'a confirmar', Método: 'a confirmar' },
    cores: [],
    texto: 'Exemplo de vitrine. Ficha e preço a confirmar com a loja.'
  },
  {
    id: 'organico-loiro-ex', exemplo: true, cat: 'organico',
    nome: 'Cabelo orgânico cacheado mesclado', sub: 'Produto de exemplo',
    preco: null, foto: 'fotos/rainha-loira.jpg',
    ficha: { Comprimento: 'a confirmar', Peso: 'a confirmar', Método: 'a confirmar' },
    cores: [],
    texto: 'Exemplo de vitrine. Ficha e preço a confirmar com a loja.'
  },
  {
    id: 'bio-ex', exemplo: true, cat: 'bio',
    nome: 'Cabelo bio cacheado', sub: 'Produto de exemplo',
    preco: null, foto: 'fotos/rainha-cacheada.jpg',
    ficha: { Comprimento: 'a confirmar', Peso: 'a confirmar', Método: 'a confirmar' },
    cores: [],
    texto: 'Exemplo de vitrine. Ficha e preço a confirmar com a loja.'
  },
  {
    id: 'bio-ruivo-ex', exemplo: true, cat: 'bio',
    nome: 'Cabelo bio cacheado ruivo', sub: 'Produto de exemplo',
    preco: null, foto: 'fotos/rainha-ruiva.jpg',
    ficha: { Comprimento: 'a confirmar', Peso: 'a confirmar', Método: 'a confirmar' },
    cores: [],
    texto: 'Exemplo de vitrine. Ficha e preço a confirmar com a loja.'
  }
];
