<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Triagem</title>

    <link rel="stylesheet" href="style.css">

    <style>
        .btn-tv {
            background: #28a745;
            color: white;
            border: none;
            padding: 8px 14px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            margin-left: 8px;
        }

        .btn-tv:hover {
            background: #1e7e34;
        }

        .btn-selecionar {
            background: #007bff;
            color: white;
            border: none;
            padding: 8px 14px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        }

        .btn-selecionar:hover {
            background: #0056b3;
        }

        .pacientes-fila {
            margin-bottom: 30px;
            background: #f0f4ff;
            border-radius: 8px;
            padding: 16px;
            border: 1px solid #d0d8f0;
        }

        .pacientes-fila h3 {
            margin-top: 0;
            color: #333;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .pacientes-fila h3 span {
            font-size: 13px;
            font-weight: normal;
            color: #666;
        }

        .fila-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: white;
            border-radius: 6px;
            padding: 10px 14px;
            margin-bottom: 8px;
            border: 1px solid #dce4ff;
        }

        .fila-item strong {
            font-size: 15px;
        }

        .fila-item small {
            color: #888;
            font-size: 12px;
        }

        .acoes {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .btn-abrir-tv {
            display: inline-block;
            background: #17a2b8;
            color: white;
            padding: 8px 14px;
            border-radius: 5px;
            font-size: 14px;
            text-decoration: none;
            cursor: pointer;
            border: none;
        }

        .btn-abrir-tv:hover {
            background: #117a8b;
        }

        #resultado {
            margin: 15px 0;
            padding: 12px;
            border-radius: 6px;
            font-weight: bold;
        }

        #resultado.verde {
            background: #d4edda;
            color: #155724;
        }

        #resultado.amarelo {
            background: #fff3cd;
            color: #856404;
        }

        #resultado.vermelho {
            background: #f8d7da;
            color: #721c24;
        }
    </style>
</head>

<body>

<div class="container">

    <!-- CABEÇALHO -->

    <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:20px;
    ">

        <h2 style="margin:0;">
            🏥 Triagem Hospitalar
        </h2>

        <button
            class="btn-abrir-tv"
            onclick="window.open('tv.html','_blank')"
        >
            📺 Abrir Tela da TV
        </button>

    </div>


    <!-- FILA -->

    <div class="pacientes-fila">

        <h3>

            Pacientes Aguardando Triagem

            <span>
                Selecione o paciente para iniciar a triagem
            </span>

        </h3>


        <div id="fila-pacientes">

            <p style="color:#888; text-align:center;">
                Carregando...
            </p>

        </div>


        <button
            onclick="carregarPacientes()"
            style="
                margin-top:8px;
                background:#6c757d;
                color:white;
                border:none;
                padding:6px 12px;
                border-radius:4px;
                cursor:pointer;
                font-size:13px;
            "
        >
            🔄 Atualizar lista
        </button>

    </div>


    <hr>


    <!-- FORMULÁRIO -->

    <h3>
        Formulário de Triagem
    </h3>


    <input
        id="pacienteId"
        type="hidden"
    >


    <input
        id="nome"
        placeholder="Nome do paciente"
        readonly
    >


    <select id="sintoma">

        <option value="">
            Selecione o sintoma
        </option>

        <option value="dor_leve">
            Dor leve
        </option>

        <option value="resfriado">
            Resfriado
        </option>

        <option value="coriza">
            Coriza
        </option>

        <option value="tosse">
            Tosse
        </option>

        <option value="febre">
            Febre
        </option>

        <option value="vomito">
            Vômito
        </option>

        <option value="diarreia">
            Diarreia
        </option>

        <option value="falta_ar_moderada">
            Falta de ar moderada
        </option>

        <option value="falta_ar_grave">
            Falta de ar grave
        </option>

        <option value="infarto">
            Suspeita de infarto
        </option>

        <option value="avc">
            Suspeita de AVC
        </option>

        <option value="convulsao">
            Convulsão
        </option>

        <option value="hemorragia">
            Hemorragia
        </option>

    </select>


    <input
        id="temp"
        type="number"
        step="0.1"
        placeholder="Temperatura"
    >


    <input
        id="alergia"
        placeholder="Alergias"
    >


    <textarea
        id="observacao"
        placeholder="Observações"
    ></textarea>


    <div id="resultado"></div>


    <button onclick="salvar()">
        💾 Salvar Triagem
    </button>

</div>


<script>


// ==========================================
// CARREGAR PACIENTES
// ==========================================

function carregarPacientes() {

    fetch("/pacientes")

        .then(response => {

            if (!response.ok) {
                throw new Error("Erro ao carregar pacientes");
            }

            return response.json();

        })

        .then(pacientes => {

            const div =
                document.getElementById("fila-pacientes");


            // Aceita os dois status para evitar
            // problemas com pacientes antigos.

            const fila = pacientes.filter(p =>
                p.status === "triagem" ||
                p.status === "aguardando_triagem"
            );


            if (fila.length === 0) {

                div.innerHTML = `
                    <p style="
                        color:#888;
                        text-align:center;
                    ">
                        Nenhum paciente aguardando triagem.
                    </p>
                `;

                return;
            }


            div.innerHTML = "";


            fila.forEach(p => {

                const item =
                    document.createElement("div");

                item.className = "fila-item";


                item.innerHTML = `

                    <div>

                        <strong>
                            ${p.nome}
                        </strong>

                        <br>

                        <small>
                            CPF:
                            ${p.cpf || "—"}

                            |

                            Tipo:
                            ${p.tipo || "—"}
                        </small>

                    </div>


                    <div class="acoes">

                        <button
                            class="btn-selecionar"
                            onclick="selecionarPaciente(${p.id})"
                        >
                            👤 Selecionar
                        </button>


                        <button
                            class="btn-tv"
                            onclick="chamarNaTV('${escaparTexto(p.nome)}')"
                        >
                            📺 Chamar na TV
                        </button>

                    </div>

                `;


                div.appendChild(item);

            });

        })

        .catch(error => {

            console.error(error);

            document.getElementById(
                "fila-pacientes"
            ).innerHTML = `

                <p style="
                    color:red;
                    text-align:center;
                ">
                    Erro ao carregar pacientes.
                </p>

            `;

        });
}



// ==========================================
// ESCAPAR TEXTO
// ==========================================

function escaparTexto(texto) {

    return String(texto)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');

}



// ==========================================
// SELECIONAR PACIENTE
// ==========================================

function selecionarPaciente(id) {

    fetch("/pacientes/" + id)

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Paciente não encontrado"
                );
            }

            return response.json();

        })

        .then(paciente => {

            document.getElementById(
                "pacienteId"
            ).value = paciente.id;


            document.getElementById(
                "nome"
            ).value = paciente.nome;


            document.getElementById(
                "resultado"
            ).innerHTML = `

                👤 Paciente selecionado:
                <strong>
                    ${paciente.nome}
                </strong>

            `;


            document.getElementById(
                "resultado"
            ).className = "";


            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth"
            });

        })

        .catch(error => {

            console.error(error);

            alert(
                "Não foi possível selecionar o paciente."
            );

        });

}



// ==========================================
// CHAMAR NA TV
// ==========================================

function chamarNaTV(nome) {

    fetch("/tv/chamar", {

        method: "POST",

        headers: {
            "Content-Type":
                "application/json"
        },

        body: JSON.stringify({

            localTipo: "GUICHÊ",

            localNumero: "01",

            paciente: nome

        })

    })

    .then(response => {

        if (!response.ok) {
            throw new Error(
                "Erro ao chamar paciente"
            );
        }

        return response.json();

    })

    .then(() => {

        alert(
            "✅ " +
            nome +
            " foi chamado na TV para o Guichê 01!"
        );

    })

    .catch(error => {

        console.error(error);

        alert(
            "Não foi possível chamar o paciente na TV."
        );

    });

}



// ==========================================
// CLASSIFICAR RISCO
// ==========================================

function classificarRisco(
    sintoma,
    temperatura
) {

    const vermelhos = [

        "infarto",
        "avc",
        "convulsao",
        "hemorragia",
        "falta_ar_grave"

    ];


    const amarelos = [

        "febre",
        "vomito",
        "diarreia",
        "falta_ar_moderada"

    ];


    if (temperatura >= 39) {

        return "vermelho";

    }


    if (vermelhos.includes(sintoma)) {

        return "vermelho";

    }


    if (amarelos.includes(sintoma)) {

        return "amarelo";

    }


    return "verde";

}



// ==========================================
// SALVAR TRIAGEM
// ==========================================

function salvar() {

    const pacienteId =
        document.getElementById(
            "pacienteId"
        ).value;


    const nome =
        document.getElementById(
            "nome"
        ).value;


    const sintoma =
        document.getElementById(
            "sintoma"
        ).value;


    const temperatura =
        Number(
            document.getElementById(
                "temp"
            ).value
        );


    const alergia =
        document.getElementById(
            "alergia"
        ).value;


    const observacao =
        document.getElementById(
            "observacao"
        ).value;


    // ========================================
    // VALIDAR PACIENTE
    // ========================================

    if (!pacienteId) {

        alert(
            "⚠️ Primeiro selecione um paciente da fila."
        );

        return;
    }


    if (!sintoma) {

        alert(
            "⚠️ Selecione o sintoma."
        );

        return;
    }


    if (!temperatura) {

        alert(
            "⚠️ Informe a temperatura."
        );

        return;
    }


    const risco =
        classificarRisco(
            sintoma,
            temperatura
        );


    // ========================================
    // ENVIAR PARA O SERVIDOR
    // ========================================

    fetch("/triagem", {

        method: "POST",

        headers: {
            "Content-Type":
                "application/json"
        },

        body: JSON.stringify({

            pacienteId:
                Number(pacienteId),

            nome,

            sintoma,

            temperatura,

            alergia,

            observacao,

            risco

        })

    })

    .then(response => {

        if (!response.ok) {

            return response.json()
                .then(data => {

                    throw new Error(
                        data.erro ||
                        "Erro ao salvar triagem"
                    );

                });

        }

        return response.json();

    })

    .then(data => {

        console.log(
            "Triagem salva:",
            data
        );


        const resultado =
            document.getElementById(
                "resultado"
            );


        resultado.className = risco;


        resultado.innerHTML = `

            Classificação:
            ${risco.toUpperCase()}

            <br>

            Paciente:
            ${data.nome}

        `;


        alert(
            "✅ Triagem salva com sucesso!"
        );


        // Limpar formulário

        document.getElementById(
            "pacienteId"
        ).value = "";


        document.getElementById(
            "nome"
        ).value = "";


        document.getElementById(
            "sintoma"
        ).value = "";


        document.getElementById(
            "temp"
        ).value = "";


        document.getElementById(
            "alergia"
        ).value = "";


        document.getElementById(
            "observacao"
        ).value = "";


        // Atualizar fila

        carregarPacientes();

    })

    .catch(error => {

        console.error(error);

        alert(
            "❌ Erro ao salvar a triagem:\n" +
            error.message
        );

    });

}



// ==========================================
// INICIAR
// ==========================================

carregarPacientes();


// Atualiza a fila a cada 10 segundos

setInterval(
    carregarPacientes,
    10000
);


</script>

</body>
</html>           chat o buton da triagem nao ta funcionando
