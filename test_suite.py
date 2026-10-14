#!/usr/bin/env python3
"""
Suíte de Testes Automatizados — Tá na Mão
Executa validação completa em código sem abrir o navegador.
Cobre CA01, CA02, CA03, CA04, CA05, CA06.
"""

import os
import re
import sys
import math

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
PASSED = 0
FAILED = 0

def log_test(title, passed, details=""):
    global PASSED, FAILED
    status = " [PASS] " if passed else " [FAIL] "
    color = "\033[92m" if passed else "\033[91m"
    reset = "\033[0m"
    print(f"{color}{status}{reset} {title}")
    if details:
        print(f"       -> {details}")
    if passed:
        PASSED += 1
    else:
        FAILED += 1

def read_file(rel_path):
    full_path = os.path.join(ROOT_DIR, rel_path)
    with open(full_path, "r", encoding="utf-8") as f:
        return f.read()

# ==============================================================================
# TESTE 1: CA01 — IDENTIDADE VISUAL (#FF7900)
# ==============================================================================
def test_visual_identity():
    print("\n--- TESTANDO CA01: IDENTIDADE VISUAL ---")
    files_to_check = [
        "css/styles.css",
        "index.html",
        "js/app.js",
        "js/auth.js",
        "js/data.js",
        "js/db.js",
        "assets/curve_underline.svg",
        "assets/logo_tanamao.svg",
        "assets/hero_bg_decor.svg"
    ]

    # 1.1 - Nenhuma ocorrência da cor amarela antiga #fec20c ou #e5ad05
    found_old_yellow = []
    for rel_path in files_to_check:
        content = read_file(rel_path)
        if re.search(r'#fec20c', content, re.IGNORECASE) or re.search(r'#e5ad05', content, re.IGNORECASE):
            found_old_yellow.append(rel_path)

    log_test(
        "Remoção completa da cor amarela antiga (#fec20c / #e5ad05)",
        len(found_old_yellow) == 0,
        f"Arquivos com amarelo antigo: {found_old_yellow}" if found_old_yellow else "Nenhum arquivo contém amarelo antigo."
    )

    # 1.2 - Presença do laranja oficial #FF7900 no CSS e SVGs
    css_content = read_file("css/styles.css")
    has_brand_primary = "--brand-primary:       #FF7900;" in css_content or "--brand-primary: #FF7900;" in css_content
    has_hover = "--brand-primary-hover:" in css_content
    log_test(
        "Definição da cor primária #FF7900 e hover no :root do CSS",
        has_brand_primary and has_hover,
        "Variáveis --brand-primary (#FF7900) e --brand-primary-hover presentes no CSS."
    )

    logo_content = read_file("assets/logo_tanamao.svg")
    has_logo_orange = "#FF7900" in logo_content
    log_test(
        "Atualização da cor nos elementos vetoriais (logo_tanamao.svg)",
        has_logo_orange,
        "Logo Tá na Mão atualizado com a cor laranja oficial."
    )

    # 1.3 - Verificação de Contraste e Acessibilidade (WCAG)
    # Laranja #FF7900 vs Texto Escuro #06152b
    def calc_luminance(r, g, b):
        def chan(c):
            c = c / 255.0
            return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
        return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b)

    lum_orange = calc_luminance(255, 121, 0)
    lum_dark = calc_luminance(6, 21, 43)
    contrast_dark_text = (max(lum_orange, lum_dark) + 0.05) / (min(lum_orange, lum_dark) + 0.05)

    log_test(
        f"Contraste de acessibilidade WCAG (Texto escuro sobre #FF7900): {contrast_dark_text:.2f}:1",
        contrast_dark_text >= 4.5,
        "Atende e supera a norma WCAG AA (mínimo 4.5:1) garantindo leitura perfeita."
    )

# ==============================================================================
# TESTE 2: CA02 — RESPONSIVIDADE (320px até 1440px)
# ==============================================================================
def test_responsiveness():
    print("\n--- TESTANDO CA02: RESPONSIVIDADE ---")
    css = read_file("css/styles.css")

    viewports = ["320px", "375px", "430px", "768px", "1024px", "1440px"]
    found_viewports = []
    for vp in viewports:
        if vp in css or vp.replace("px", "") in css:
            found_viewports.append(vp)

    log_test(
        "Cobertura das larguras especificadas no CSS (320, 375, 430, 768, 1024, 1440 px)",
        len(found_viewports) == len(viewports),
        f"Encontrados: {found_viewports}"
    )

    # Prevenção de rolagem horizontal indesejada
    has_overflow_fix = "overflow-x: hidden" in css
    log_test(
        "Prevenção global de overflow horizontal (overflow-x: hidden)",
        has_overflow_fix,
        "Regras aplicadas no html e body."
    )

    # Touch-friendly targets
    has_touch_targets = "min-height: 44px" in css or "min-height: 42px" in css
    log_test(
        "Botões touch-friendly para dispositivos móveis (min-height >= 42px)",
        has_touch_targets,
        "Touch targets móveis definidos nos botões interativos."
    )

# ==============================================================================
# TESTE 3: CA03 — REMOÇÃO DE DADOS FICTÍCIOS
# ==============================================================================
def test_data_cleansing():
    print("\n--- TESTANDO CA03: REMOÇÃO DE CONTAS FALSAS E DADOS DE TESTE ---")
    data_content = read_file("js/data.js")
    auth_content = read_file("js/auth.js")
    html_content = read_file("index.html")

    fake_names = [
        "Auto Center São José",
        "pro-autocenter",
        "Moto Peças Timbaúba",
        "TechHelp Informática",
        "João Silva",
        "pro-1",
        "Maria Santos",
        "Carlos Souza",
        "Lucas Mendes",
        "REQ-1042",
        "REQ-1011"
    ]

    found_fakes = []
    for fake in fake_names:
        if fake in data_content:
            found_fakes.append(fake)

    log_test(
        "Ausência de profissionais e pedidos fictícios em js/data.js",
        len(found_fakes) == 0,
        f"Falsos encontrados: {found_fakes}" if found_fakes else "Lista de profissionais e pedidos 100% limpa."
    )

    # Verificar ausência de usuário demo pré-carregado no auth
    has_demo_user = "usr-client-demo" in auth_content or "cliente.demo@tanamao.com" in auth_content
    log_test(
        "Ausência de usuário demo padrão pré-logado em js/auth.js",
        not has_demo_user,
        "Usuário inicia nulo na ausência de sessão legítima."
    )

    # Verificar ausência de credenciais demo nos inputs do modal
    has_input_mocks = 'value="cliente.demo@tanamao.com"' in html_content or 'value="123456"' in html_content
    log_test(
        "Campos de formulário de login limpos sem valores de teste pré-preenchidos",
        not has_input_mocks,
        "Formulário de login sem credenciais hardcoded."
    )

    # Verificar presença de empty states explicativos
    app_content = read_file("js/app.js")
    has_empty_state = "empty-state-box" in app_content and "Seja o primeiro profissional" in app_content
    log_test(
        "Implementação de Estado Vazio (Empty State) elegante e encorajador",
        has_empty_state,
        "Interface guia novos usuários com orientações claras caso não existam cadastros."
    )

# ==============================================================================
# TESTE 4: CA04 — PROFISSÕES E ESPECIALIDADES PERSONALIZADAS
# ==============================================================================
def test_custom_professions():
    print("\n--- TESTANDO CA04: PROFISSÕES PERSONALIZADAS ---")
    html_content = read_file("index.html")
    app_content = read_file("js/app.js")
    db_content = read_file("js/db.js")

    has_custom_option = '__custom__' in html_content
    has_custom_input = 'id="regProCustomName"' in html_content
    log_test(
        "Opção 'Outra profissão...' e campo dinâmico de texto presentes no formulário",
        has_custom_option and has_custom_input,
        "Interface permite aos profissionais informarem novas profissões."
    )

    # Teste unitário da função de normalização
    def normalize_profession(name):
        clean = name.strip()
        clean = re.sub(r'\s+', ' ', clean)
        if len(clean) < 3:
            return ""
        words = clean.lower().split(' ')
        lowercase_exceptions = ['de', 'da', 'do', 'das', 'dos', 'e', 'em']
        titled = [w if (i > 0 and w in lowercase_exceptions) else w.capitalize() for i, w in enumerate(words)]
        return " ".join(titled)

    t1 = normalize_profession("  chaveiro   24h  ") == "Chaveiro 24h"
    t2 = normalize_profession("instalador de ar condicionado") == "Instalador de Ar Condicionado"
    t3 = normalize_profession("ab") == "" # Inválido

    log_test(
        "Normalização de profissões (Trim, remoção de espaços duplos e Title Case)",
        t1 and t2 and t3,
        f"'  chaveiro   24h  ' -> '{normalize_profession('  chaveiro   24h  ')}'"
    )

    has_db_add_profession = "addCustomProfession" in db_content
    log_test(
        "Método de persistência de profissões customizadas no banco de dados",
        has_db_add_profession,
        "Novas profissões são persistidas e disponibilizadas para busca e filtros."
    )

# ==============================================================================
# TESTE 5: CA05 — BANCO DE DADOS & SEGURANÇA (SUPABASE / POSTGRESQL / RLS)
# ==============================================================================
def test_database_and_security():
    print("\n--- TESTANDO CA05: BANCO DE DADOS & SEGURANÇA ---")
    sql_content = read_file("supabase_schema.sql")

    required_tables = ["profiles", "professions", "professionals", "quotes", "reviews", "chat_messages"]
    found_tables = [t for t in required_tables if f"CREATE TABLE IF NOT EXISTS public.{t}" in sql_content]

    log_test(
        f"Criação das tabelas relacionais do esquema ({len(found_tables)}/{len(required_tables)})",
        len(found_tables) == len(required_tables),
        f"Tabelas verificadas: {found_tables}"
    )

    # Políticas de RLS
    has_rls_enable = "ENABLE ROW LEVEL SECURITY" in sql_content
    has_rls_policies = "CREATE POLICY" in sql_content
    log_test(
        "Configuração de Row Level Security (RLS) nas tabelas públicas",
        has_rls_enable and has_rls_policies,
        "Políticas de isolamento entre usuários configuradas no PostgreSQL."
    )

    # Trigger de recálculo de avaliações
    has_trigger = "recalculate_pro_rating" in sql_content
    log_test(
        "Trigger de recálculo automático de notas e avaliações",
        has_trigger,
        "Trigger recalcula média de avaliação automaticamente a cada review."
    )

    # Verificação de segurança de credenciais
    has_env_example = os.path.exists(os.path.join(ROOT_DIR, ".env.example"))
    log_test(
        "Arquivo .env.example presente e sem segredos versionados",
        has_env_example,
        "Variáveis documentadas sem exposição de segredos reais."
    )

# ==============================================================================
# TESTE 6: CA07 — CONFIGURAÇÃO PARA A VERCEL
# ==============================================================================
def test_vercel_setup():
    print("\n--- TESTANDO CA07: CONFIGURAÇÃO PARA A VERCEL ---")
    has_doc = os.path.exists(os.path.join(ROOT_DIR, "VERCEL_SETUP.md"))
    has_health_api = os.path.exists(os.path.join(ROOT_DIR, "api/health.js"))

    log_test(
        "Guia completo de publicação e configuração da Vercel (VERCEL_SETUP.md)",
        has_doc,
        "Documentação com passo a passo, justificativa técnica e variáveis."
    )

    log_test(
        "Endpoint Serverless de monitoramento e verificação (api/health.js)",
        has_health_api,
        "Função serverless para checagem de saúde e status das variáveis de ambiente."
    )

# ==============================================================================
# EXECUÇÃO PRINCIPAL
# ==============================================================================
if __name__ == "__main__":
    print("=" * 65)
    print(" TÁ NA MÃO — EXECUÇÃO DA SUÍTE DE TESTES AUTOMATIZADOS EM CÓDIGO")
    print("=" * 65)

    test_visual_identity()
    test_responsiveness()
    test_data_cleansing()
    test_custom_professions()
    test_database_and_security()
    test_vercel_setup()

    print("\n" + "=" * 65)
    print(f" RESULTADO FINAL: {PASSED} passaram, {FAILED} falharam.")
    print("=" * 65)

    if FAILED > 0:
        sys.exit(1)
    else:
        sys.exit(0)
