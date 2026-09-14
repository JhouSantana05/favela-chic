# 👑 FAVELA CHIC | WebApp & PWA de Catálogo com Câmera

Aplicativo moderno estilo PWA (Progressive Web App) desenvolvido para lojas de moda urbana/streetwear (roupas, tênis, bonés e acessórios), com captura de fotos pela câmera em tempo real para cadastro rápido no catálogo e fechamento de pedidos direto no WhatsApp.

---

## 🚀 Funcionalidades Principais

### 1. 📸 Câmera Integrada para Cadastro Rápido de Produtos
- **Visor em tempo real** com alternância de câmera frontal e traseira.
- **Grade de enquadramento (Regra dos terços)** para tirar fotos alinhadas das peças.
- **Compressão e otimização automática via Canvas (HTML5)**: fotos ficam leves (~100KB) e com máxima nitidez, sem pesar na memória do celular.
- **Suporte a Galeria**: opção de carregar fotos direto do rolo de câmera do smartphone.

### 2. 🧢 Categorias Especializadas de Streetwear
- **Roupas**: Camisetas oversized, bermudas cargo, moletons (tamanhos P, M, G, GG).
- **Tênis & Kicks**: Sneakers retros, chunky, casuais (numerações 38 a 44).
- **Bonés & Caps**: Snapbacks, dad hats, aba reta (tamanho único ajustável).
- **Acessórios**: Shoulder bags táticas, correntes banhadas, meias e óculos.

### 3. 📱 Modo PWA (App Nativo sem Loja de Aplicativos)
- **Instalável na tela inicial** do celular Android (Chrome) e iPhone (Safari/Chrome).
- Roda em **tela cheia (standalone)** sem a barra de navegação do navegador.
- Funciona **offline** através de Service Worker com cache de recursos e banco de dados local **IndexedDB**.

### 4. 🛒 Sacola de Compras & Fechamento no WhatsApp
- Seleção de tamanho, cor e quantidade.
- Opções de recebimento: **Retirada no Balcão** ou **Entrega no Bairro (com taxa de motoboy configurável)**.
- Formas de pagamento: **Pix**, **Cartão** (máquina na entrega) ou **Dinheiro** (com solicitação de troco).
- **Mensagem Pronta no WhatsApp**: gera com 1 clique todo o resumo do pedido formatado com emojis e valores para o WhatsApp do vendedor.

### 5. 🛡️ Painel de Gestão do Lojista (Modo Admin)
- Alternância rápida com 1 clique entre **Modo Vitrine (Cliente)** e **Modo Lojista (Admin)**.
- Cadastro, edição e exclusão de peças.
- Edição do número do WhatsApp, nome da loja, endereço e valor da entrega.
- **Backup e Restauração**: exporte e importe todo o catálogo em formato JSON a qualquer momento.

---

## 💻 Como Rodar o Projeto

### Pré-requisitos
- Node.js instalado (v18+)

### Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

### 📲 Para testar no Celular na mesma rede Wi-Fi:
Execute o comando com a flag `--host`:
```bash
npm run dev -- --host
```
O Vite mostrará um link de rede local (ex: `http://192.168.1.X:5173`). Basta abrir esse link no navegador do seu smartphone (Google Chrome no Android ou Safari no iPhone) para testar a câmera nativa e clicar em **"Instalar App"** / **"Adicionar à Tela de Início"**.

### Gerar versão final de produção:
```bash
npm run build
npm run preview
```

---

## 🛠️ Tecnologias Utilizadas
- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS v4** + **Lucide Icons**
- **VitePWA** (`vite-plugin-pwa`) para Web Manifest & Service Workers
- **IndexedDB** (`idb`) para banco de dados local e offline
- **HTML5 Canvas API** para processamento e compressão de fotos da câmera
- **Canvas Confetti** para celebração visual de pedidos
