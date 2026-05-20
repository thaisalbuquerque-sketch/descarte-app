# 🗂 Assistente de Descarte — Como rodar

## Pré-requisitos
- Node.js instalado (qualquer versão ≥ 14)
  - Verifique: `node --version`
  - Instale em: https://nodejs.org

## Passo a passo

### 1. Extraia a pasta do projeto
Coloque a pasta `descarte-app` em qualquer lugar do seu computador.

### 2. Defina sua chave da API Anthropic

**Mac / Linux:**
```bash
export ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```

**Windows (Prompt de Comando):**
```cmd
set ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```

**Windows (PowerShell):**
```powershell
$env:ANTHROPIC_API_KEY="sk-ant-xxxxxxxxxxxxxxxx"
```

> Sua chave está em: https://console.anthropic.com/settings/keys

### 3. Rode o servidor
```bash
cd descarte-app
node server.js
```

Você verá:
```
✅ Servidor rodando!
   Abra no browser: http://localhost:3000
```

### 4. Abra no browser
Acesse: **http://localhost:3000**

---

## Como usar o app

1. **Informe a loja** (ex: SAO005)
2. **Digite o SKU ou nome** do produto
3. **Selecione a origem** — chegou assim na entrega ou estava armazenado?
   - Se estava na loja: informe há quanto tempo
4. **Descreva o problema** (ou use os atalhos de exemplo)
5. **Foto opcional** — a IA analisa visualmente a condição do produto
6. Clique em **Consultar motivo de descarte**

A IA retorna:
- ✅ Motivo exato para registrar no sistema
- 🏷 Se é PERDA ou MIT
- 📝 Explicação do porquê
- 📷 Análise da foto (se enviada)
- 🔀 Motivo alternativo caso haja dúvida
- 📊 Nível de confiança

---

## Motivos disponíveis no sistema

| Motivo | Tipo |
|--------|------|
| expired | PERDA |
| quality_out_of_standard | PERDA |
| damaged_broken | PERDA |
| out_of_temperature | PERDA |
| order_returned_unsuitable | PERDA |
| freezer_refrigerator_breakdown | PERDA |
| AVARIA | PERDA |
| VENCIDO | PERDA |
| loss_claim | PERDA |
| supplier_return | PERDA |
| cancelled_order_not_returned | PERDA |
| unauthorized_consumption | MIT |
| loss_in_transit | MIT |
| donation | MIT |
| authorized_consumption | MIT |

---

## Problemas comuns

**"ANTHROPIC_API_KEY não definida"**
→ Execute o `export` antes do `node server.js`, no mesmo terminal.

**"Erro HTTP 401"**
→ Chave de API inválida ou expirada. Gere uma nova em console.anthropic.com.

**"Cannot connect / ECONNREFUSED"**
→ O servidor não está rodando. Verifique se o terminal com `node server.js` está aberto.
