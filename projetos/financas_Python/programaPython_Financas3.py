import streamlit as st
import pandas as pd
import plotly.express as px
import requests
from io import BytesIO

st.title("📊 Análise Financeira Interativa - Google Drive")

# URL pública do Google Sheets exportada como xlsx
GOOGLE_SHEETS_XLSX_URL = "https://docs.google.com/spreadsheets/d/16IHVI9UkXfu-WE7fzLNcEMGY6Df3BXBa/export?format=xlsx"

@st.cache_data
def load_data(url):
    response = requests.get(url)
    response.raise_for_status()
    return pd.read_excel(BytesIO(response.content), sheet_name="Página2")

try:
    df = load_data(GOOGLE_SHEETS_XLSX_URL)
    st.success("✅ Planilha carregada com sucesso!")

    df = df.rename(columns={"Receitas/Debito": "Categoria"})
    df = df.drop(columns=["Unnamed: 1", "Descrição"], errors="ignore")
    colunas_data = [col for col in df.columns if "/" in str(col) or "-" in str(col)]
    
    tipo_opcoes = df["Tipo"].dropna().unique()
    tipo_sel = st.multiselect("Filtrar por tipo:", tipo_opcoes, default=tipo_opcoes)

    categoria_sel = st.multiselect("Filtrar por categoria:", ["Receitas", "Débitos"], default=["Receitas", "Débitos"])

    df_filtrado = df[df["Tipo"].isin(tipo_sel) & df["Categoria"].str.contains('|'.join(categoria_sel), case=False, na=False)]

    df_mensal = df_filtrado[colunas_data].sum().reset_index()
    df_mensal.columns = ["Data", "Valor"]
    df_mensal["Data"] = pd.to_datetime(df_mensal["Data"])

    st.subheader("📈 Evolução Mensal")
    fig_linha = px.line(df_mensal, x="Data", y="Valor", markers=True)
    st.plotly_chart(fig_linha, use_container_width=True)

    st.subheader("📊 Distribuição por Tipo")
    df_tipo = df_filtrado.groupby("Tipo")[colunas_data].sum().sum(axis=1)
    fig_pizza = px.pie(values=df_tipo.values, names=df_tipo.index)
    st.plotly_chart(fig_pizza, use_container_width=True)

    st.subheader("📊 Comparativo Receita x Débito")
    df_group = df[df["Categoria"].notna()]
    receitas = df_group[df_group["Categoria"].str.contains("Receita", case=False)].sum(numeric_only=True)
    debitos = df_group[df_group["Categoria"].str.contains("Debito", case=False)].sum(numeric_only=True)
    comp_df = pd.DataFrame({
        "Mês": receitas.index,
        "Receitas": receitas.values,
        "Débitos": debitos.values
    })
    comp_df["Mês"] = pd.to_datetime(comp_df["Mês"])
    fig_comp = px.bar(comp_df, x="Mês", y=["Receitas", "Débitos"], barmode="group")
    st.plotly_chart(fig_comp, use_container_width=True)

except Exception as e:
    st.error(f"Erro ao carregar a planilha: {e}")
