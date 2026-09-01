O ChatGPT disse:
Claro. Vamos deixar isso funcionando de forma organizada. Você só precisa substituir o seu server.js pelo código abaixo e depois ajustar o triagem.html.

1. server.js
📁 Coloque este arquivo na sua pasta backend.

Exemplo:

seu-projeto/
├── backend/
│   ├── server.js       ← COLOQUE AQUI
│   └── db.json
│
└── frontend/
    ├── atendimento.html
    ├── triagem.html
    ├── tv.html
    └── style.css

Use este server.js:

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());


// ======================================================
// FRONTEND
// ======================================================

app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);


// ======================================================
// BANCO DE DADOS
// ======================================================

const DB_FILE = path.join(
    __dirname,
    "db.json"
);


function bancoVazio() {

    return {
        usuarios: [],
        pacientes: [],
        triagens: [],
        consultas: [],
        tv_chamada: null,
        tv_historico: []
    };

}


function readDB() {

    if (!fs.existsSync(DB_FILE)) {

        const novoBanco = bancoVazio();

        writeDB(novoBanco);

        return novoBanco;
    }

    try {

        const db = JSON.parse(
            fs.readFileSync(
                DB_FILE,
                "utf8"
            )
        );


        if (!db.usuarios)
            db.usuarios = [];


        if (!db.pacientes)
            db.pacientes = [];


        if (!db.triagens)
            db.triagens = [];


        if (!db.consultas)
            db.consultas = [];


        if (!Object.prototype.hasOwnProperty.call(
            db,
            "tv_chamada"
        )) {

            db.tv_chamada = null;

        }


        if (!db.tv_historico)
            db.tv_historico = [];


        return db;

    } catch (error) {

        console.error(
            "Erro ao ler db.json:",
            error
        );

        return bancoVazio();
    }
}


function writeDB(db) {

    fs.writeFileSync(
        DB_FILE,
        JSON.stringify(
            db,
            null,
            2
        ),
        "utf8"
    );

}


// ======================================================
// ATENDIMENTO
// CADASTRAR PACIENTE
// ======================================================

app.post(
    "/atendimento",
    (req, res) => {

        try {

            const db = readDB();


            if (!req.body.nome) {

                return res.status(400).json({
                    erro:
                        "Nome do paciente é obrigatório"
                });

            }


            const paciente = {

                id: Date.now(),

                nome:
                    req.body.nome || "",

                cpf:
                    req.body.cpf || "",

                datadenascimento:
                    req.body.datadenascimento || "",

                sexo:
                    req.body.sexo || "",

                nomedamae:
                    req.body.nomedamae || "",

                estadocivil:
                    req.body.estadocivil || "",

                endereco:
                    req.body.endereco || "",

                telefone:
                    req.body.telefone || "",

                email:
                    req.body.email || "",

                contatodeemergencia:
                    req.body.contatodeemergencia || "",

                tipo:
                    req.body.tipo || "",

                status:
                    "aguardando_triagem",

                createdAt:
                    new Date().toISOString()

            };


            db.pacientes.push(
                paciente
            );


            writeDB(db);


            console.log(
                "Paciente cadastrado:",
                paciente.nome
            );


            return res.status(201).json(
                paciente
            );

        } catch (error) {

            console.error(
                "Erro no atendimento:",
                error
            );


            return res.status(500).json({
                erro:
                    "Erro ao cadastrar paciente"
            });

        }

    }
);


// ======================================================
// LISTAR PACIENTES
// ======================================================

app.get(
    "/pacientes",
    (req, res) => {

        const db = readDB();

        res.json(
            db.pacientes
        );

    }
);


// ======================================================
// BUSCAR PACIENTE
// ======================================================

app.get(
    "/pacientes/:id",
    (req, res) => {

        const db = readDB();

        const id =
            Number(req.params.id);


        const paciente =
            db.pacientes.find(
                p => p.id === id
            );


        if (!paciente) {

            return res.status(404).json({
                erro:
                    "Paciente não encontrado"
            });

        }


        res.json(
            paciente
        );

    }
);


// ======================================================
// CLASSIFICAÇÃO DE RISCO
// ======================================================

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


    if (
        vermelhos.includes(
            sintoma
        )
    ) {

        return "vermelho";

    }


    if (temperatura >= 38) {

        return "amarelo";

    }


    if (
        amarelos.includes(
            sintoma
        )
    ) {

        return "amarelo";

    }


    return "verde";

}


// ======================================================
// SALVAR TRIAGEM
// ======================================================

app.post(
    "/triagem",
    (req, res) => {

        try {

            const db = readDB();


            const pacienteId =
                Number(
                    req.body.pacienteId
                );


            if (!pacienteId) {

                return res.status(400).json({
                    erro:
                        "Paciente não selecionado"
                });

            }


            const paciente =
                db.pacientes.find(
                    p =>
                        p.id === pacienteId
                );


            if (!paciente) {

                return res.status(404).json({
                    erro:
                        "Paciente não encontrado"
                });

            }


            const sintoma =
                req.body.sintoma || "";


            if (!sintoma) {

                return res.status(400).json({
                    erro:
                        "Sintoma não informado"
                });

            }


            const temperatura =
                Number(
                    req.body.temperatura
                );


            if (
                !Number.isFinite(
                    temperatura
                )
            ) {

                return res.status(400).json({
                    erro:
                        "Temperatura inválida"
                });

            }


            const alergia =
                req.body.alergia || "";


            const observacao =
                req.body.observacao || "";


            const risco =
                classificarRisco(
                    sintoma,
                    temperatura
                );


            // ==========================================
            // CRIAR TRIAGEM
            // ==========================================

            const triagem = {

                id: Date.now(),

                pacienteId:
                    paciente.id,

                nome:
                    paciente.nome,

                cpf:
                    paciente.cpf || "",

                sintoma,

                temperatura,

                alergia,

                observacao,

                risco,

                status:
                    "aguardando_medico",

                createdAt:
                    new Date().toISOString()

            };


            // ==========================================
            // SALVAR TRIAGEM
            // ==========================================

            db.triagens.push(
                triagem
            );


            // ==========================================
            // ATUALIZAR PACIENTE
            // ==========================================

            paciente.status =
                "aguardando_medico";


            paciente.triagemId =
                triagem.id;


            paciente.risco =
                risco;


            paciente.sintoma =
                sintoma;


            paciente.temperatura =
                temperatura;


            paciente.alergia =
                alergia;


            paciente.observacao =
                observacao;


            // ==========================================
            // GRAVAR NO DB.JSON
            // ==========================================

            writeDB(db);


            console.log(
                "================================="
            );

            console.log(
                "TRIAGEM SALVA COM SUCESSO"
            );

            console.log(
                "Paciente:",
                paciente.nome
            );

            console.log(
                "Risco:",
                risco
            );

            console.log(
                "Triagem ID:",
                triagem.id
            );

            console.log(
                "================================="
            );


            return res.status(201).json(
                triagem
            );

        } catch (error) {

            console.error(
                "ERRO AO SALVAR TRIAGEM:"
            );

            console.error(
                error
            );


            return res.status(500).json({
                erro:
                    "Erro interno ao salvar triagem"
            });

        }

    }
);


// ======================================================
// LISTAR TRIAGENS
// ======================================================

app.get(
    "/triagens",
    (req, res) => {

        const db = readDB();

        res.json(
            db.triagens
        );

    }
);


// ======================================================
// TV
// ======================================================

app.post(
    "/tv/chamar",
    (req, res) => {

        const db = readDB();


        const chamada = {

            id:
                Date.now().toString(),

            localTipo:
                req.body.localTipo ||
                "GUICHÊ",

            localNumero:
                req.body.localNumero ||
                "01",

            paciente:
                req.body.paciente ||
                "",

            hora:
                new Date().toLocaleTimeString(
                    "pt-BR",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )

        };


        db.tv_chamada =
            chamada;


        db.tv_historico.unshift(
            chamada
        );


        if (
            db.tv_historico.length > 5
        ) {

            db.tv_historico.pop();

        }


        writeDB(db);


        console.log(
            "Paciente chamado na TV:",
            chamada.paciente
        );


        res.json(
            chamada
        );

    }
);


app.get(
    "/tv/chamada",
    (req, res) => {

        const db = readDB();


        res.json({

            chamada:
                db.tv_chamada,

            historico:
                db.tv_historico

        });

    }
);


// ======================================================
// INICIAR SERVIDOR
// ======================================================

const PORT =
    process.env.PORT || 3000;


app.listen(
    PORT,
    () => {

        console.log("");
        console.log(
            "================================="
        );

        console.log(
            `Servidor rodando em: http://localhost:${PORT}`
        );

        console.log(
            `Banco: ${DB_FILE}`
        );

        console.log(
            "================================="
        );

    }
);
