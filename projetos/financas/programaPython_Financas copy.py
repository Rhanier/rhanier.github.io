## https://docs.google.com/spreadsheets/d/16IHVI9UkXfu-WE7fzLNcEMGY6Df3BXBa/edit?usp=drive_link&ouid=102554970286053187665&rtpof=true&sd=true


import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# ======= CONFIGURAÇÃO ========
# Nome do arquivo e da aba
arquivo = 'Pasta1 (2).xlsx'
aba = 'Página2'

# Carregar a planilha
df = pd.read_excel(arquivo, sheet_name=aba)

# Limpar dados desnecessários
df_values = df.drop(columns=["Unnamed: 1", "Tipo", "Descrição"])
df_values = df_values.rename(columns={"Receitas/Debito": "Categoria"})

# Separar receitas e débitos
receitas = df_values[df_values["Categoria"].str.contains("Receita", case=False, na=False)]
debitos = df_values[df_values["Categoria"].str.contains("Debito", case=False, na=False)]

# Somar por mês
receitas_totais = receitas.drop(columns="Categoria").sum()
debitos_totais = debitos.drop(columns="Categoria").sum()

# Corrigir datas
receitas_totais.index = pd.to_datetime(receitas_totais.index)
debitos_totais.index = pd.to_datetime(debitos_totais.index)
saldo_mensal = receitas_totais - debitos_totais

# Criar gráfico interativo
fig = make_subplots(rows=1, cols=1)

fig.add_trace(go.Scatter(x=receitas_totais.index, y=receitas_totais.values,
                         mode='lines+markers', name='Receitas'))

fig.add_trace(go.Scatter(x=debitos_totais.index, y=debitos_totais.values,
                         mode='lines+markers', name='Débitos'))

fig.add_trace(go.Scatter(x=saldo_mensal.index, y=saldo_mensal.values,
                         mode='lines+markers', name='Saldo'))

fig.update_layout(
    title="Análise Financeira Mensal",
    xaxis_title="Mês",
    yaxis_title="Valor (R$)",
    hovermode="x unified",
    template="plotly_white"
)

fig.show()
