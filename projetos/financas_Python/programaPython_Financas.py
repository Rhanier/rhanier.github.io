from flask import Flask, render_template_string
import pandas as pd
import plotly.express as px
import plotly.io as pio
import requests
from io import BytesIO

app = Flask(__name__)

GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/16IHVI9UkXfu-WE7fzLNcEMGY6Df3BXBa/export?format=xlsx"

@app.route("/")
def home():
    return '''
        <h2>Bem-vindo</h2>
        <button onclick="window.location.href='/analise'">📊 Ver Análise Financeira</button>
    '''

@app.route("/analise")
def analise():
    try:
        response = requests.get(GOOGLE_SHEET_URL)
        response.raise_for_status()
        df = pd.read_excel(BytesIO(response.content), sheet_name="Página2")

        df = df.rename(columns={"Receitas/Debito": "Categoria"})
        df = df.drop(columns=["Unnamed: 1", "Descrição"], errors="ignore")
        colunas_data = [col for col in df.columns if "/" in str(col) or "-" in str(col)]

        receitas = df[df["Categoria"].str.contains("Receita", case=False, na=False)]
        debitos = df[df["Categoria"].str.contains("Debito", case=False, na=False)]

        receitas_totais = receitas[colunas_data].sum()
        debitos_totais = debitos[colunas_data].sum()

        receitas_totais.index = pd.to_datetime(receitas_totais.index)
        debitos_totais.index = pd.to_datetime(debitos_totais.index)
        saldo_mensal = receitas_totais - debitos_totais

        df_plot = pd.DataFrame({
            "Mês": receitas_totais.index,
            "Receitas": receitas_totais.values,
            "Débitos": debitos_totais.values,
            "Saldo": saldo_mensal.values
        })

        fig = px.line(df_plot, x="Mês", y=["Receitas", "Débitos", "Saldo"], markers=True)
        fig.update_layout(title="Análise Financeira Mensal", template="plotly_white")
        grafico_html = pio.to_html(fig, full_html=False)

        return render_template_string("""
            <h1>Análise Financeira</h1>
            <div>{{grafico|safe}}</div>
            <a href="/">← Voltar</a>
        """, grafico=grafico_html)

    except Exception as e:
        return f"<h2>Erro ao processar: {e}</h2><a href='/'>← Voltar</a>"

if __name__ == "__main__":
    app.run(debug=True)
