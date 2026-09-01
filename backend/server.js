O ChatGPT disse:
Claro. Aqui está exatamente o server.js que você me enviou, sem alterações:

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "../frontend")));

const DB_FILE = path.join(__dirname, "db.json");


// ======================================================
// BANCO DE DADOS
// ======================================================

function readDB() {

    if (!fs.existsSync(DB_FILE)) {

        return {
            usuarios: [],
            pacientes: [],
            triagens: [],
            consultas: [],
            tv_chamada: null,
            tv_historico: []
        };
    }

    try {

        const db = JSON.parse(
            fs.readFileSync(DB_FILE, "utf8")
        );

        if (!db.usuarios) db.usuarios = [];
        if (!db.pacientes) db.pacientes = [];
        if (!db.triagens) db.triagens = [];
        if (!db.consultas) db.consultas = [];

        if (!Object.prototype.hasOwnProperty.call(db, "tv_chamada")) {
            db.tv_chamada = null;
        }

        if (!db.tv_historico) {
            db.tv_historico = [];
        }

        return db;

    } catch (error) {

        console.error(
            "Erro ao ler db.json:",
            error
        );

        return {
            usuarios: [],
            pacientes: [],
            triagens: [],
            consultas: [],
            tv_chamada: null,
            tv_historico: []
        };
    }
}


// ======================================================
// SALVAR BANCO
// ======================================================

function writeDB(data) {

    try {

        fs.writeFileSync(
            DB_FILE,
            JSON.stringify(data, null, 2),
            "utf8"
        );

    } catch (error) {

        console.error(
            "Erro ao salvar db.json:",
            error
        );

        throw error;
    }
}


// ======================================================
// LOGIN
// ======================================================

app.post("/login", (req, res) => {

    const db = readDB();

    const usuario = req.body.usuario;
    const senha = req.body.senha;

    const user = db.usuarios.find(u =>
        u.usuario === usuario &&
        u.senha === senha
    );

    if (!user) {

        return res.status(401).json({
            erro: "Login inválido"
        });
    }

    console.log(
        "Login realizado:",
        user.usuario,
        "-",
        user.tipo
    );

    res.json(user);
});


// ======================================================
// ATENDIMENTO
// CADASTRAR PACIENTE
// ======================================================

app.post("/atendimento", (req, res) => {

    const db = readDB();

    if (!req.body.nome) {

        return res.status(400).json({
            erro: "Nome do paciente é obrigatório"
        });
    }

    const paciente = {

        id: Date.now(),

        nome: req.body.nome,

        cpf: req.body.cpf || "",

        tipo: req.body.tipo || "",

        status: "aguardando_triagem",

        createdAt: new Date().toISOString()
    };

    db.pacientes.push(paciente);

    writeDB(db);

    console.log(
        "Paciente cadastrado:",
        paciente
    );

    res.status(201).json(paciente);
});


// ======================================================
// LISTAR PACIENTES
// ======================================================

app.get("/pacientes", (req, res) => {

    const db = readDB();

    res.json(db.pacientes);
});


// ======================================================
// BUSCAR PACIENTE POR ID
// ======================================================

app.get("/pacientes/:id", (req, res) => {

    const db = readDB();

    const id = Number(req.params.id);

    const paciente = db.pacientes.find(
        p => p.id === id
    );

    if (!paciente) {

        return res.status(404).json({
            erro: "Paciente não encontrado"
        });
    }

    res.json(paciente);
});


// ======================================================
// TRIAGEM
// ======================================================

app.post("/triagem", (req, res) => {

    const db = readDB();

    const pacienteId =
        Number(req.body.pacienteId);


    // -----------------------------------------------
    // LOCALIZAR PACIENTE
    // -----------------------------------------------

    let paciente = null;

    if (pacienteId) {

        paciente = db.pacientes.find(
            p => p.id === pacienteId
        );

        if (!paciente) {

            return res.status(404).json({
                erro: "Paciente não encontrado"
            });
        }
    }


    // -----------------------------------------------
    // DADOS
    // -----------------------------------------------

    const sintoma =
        req.body.sintoma || "";

    const temperatura =
        Number(req.body.temperatura);


    const alergia =
        req.body.alergia || "";


    const observacao =
        req.body.observacao || "";


    // -----------------------------------------------
    // CLASSIFICAÇÃO DE RISCO
    // -----------------------------------------------

    let risco = req.body.risco;


    const sintomasVermelhos = [
        "infarto",
        "avc",
        "convulsao",
        "hemorragia",
        "falta_ar_grave"
    ];


    const sintomasAmarelos = [
        "febre",
        "vomito",
        "diarreia",
        "falta_ar_moderada"
    ];


    if (temperatura >= 39) {

        risco = "vermelho";

    } else if (
        sintomasVermelhos.includes(sintoma)
    ) {

        risco = "vermelho";

    } else if (
        temperatura >= 38
    ) {

        risco = "amarelo";

    } else if (
        sintomasAmarelos.includes(sintoma)
    ) {

        risco = "amarelo";

    } else {

        risco = "verde";
    }


    // -----------------------------------------------
    // CRIAR TRIAGEM
    // -----------------------------------------------

    const triagem = {

        id: Date.now(),

        pacienteId:
            paciente
                ? paciente.id
                : null,

        nome:
            paciente
                ? paciente.nome
                : (req.body.nome || ""),

        cpf:
            paciente
                ? paciente.cpf
                : (req.body.cpf || ""),

        sintoma,

        temperatura:
            Number.isFinite(temperatura)
                ? temperatura
                : null,

        alergia,

        observacao,

        risco,

        status: "aguardando_medico",

        createdAt:
            new Date().toISOString()
    };


    // -----------------------------------------------
    // SALVAR TRIAGEM
    // -----------------------------------------------

    db.triagens.push(triagem);


    // -----------------------------------------------
    // ATUALIZAR PACIENTE
    // -----------------------------------------------

    if (paciente) {

        paciente.status =
            "aguardando_medico";

        paciente.triagemId =
            triagem.id;

        paciente.risco =
            triagem.risco;

        paciente.sintoma =
            triagem.sintoma;

        paciente.temperatura =
            triagem.temperatura;

        paciente.alergia =
            triagem.alergia;

        paciente.observacao =
            triagem.observacao;

        paciente.triagem =
            triagem;
    }


    // -----------------------------------------------
    // SALVAR
    // -----------------------------------------------

    writeDB(db);

    console.log(
        "Triagem salva:",
        triagem
    );

    res.status(201).json(triagem);
});


// ======================================================
// LISTAR TRIAGENS
// ======================================================

app.get("/triagens", (req, res) => {

    const db = readDB();

    res.json(db.triagens);
});


// ======================================================
// BUSCAR TRIAGEM POR ID
// ======================================================

app.get("/triagens/:id", (req, res) => {

    const db = readDB();

    const id =
        Number(req.params.id);

    const triagem =
        db.triagens.find(
            t => t.id === id
        );

    if (!triagem) {

        return res.status(404).json({
            erro: "Triagem não encontrada"
        });
    }

    res.json(triagem);
});


// ======================================================
// TV - CHAMAR PACIENTE
// ======================================================

app.post("/tv/chamar", (req, res) => {

    const db = readDB();

    const chamada = {

        id:
            Date.now().toString(),

        localTipo:
            req.body.localTipo || "GUICHÊ",

        localNumero:
            req.body.localNumero || "01",

        paciente:
            req.body.paciente || "",

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
        chamada
    );

    res.json(chamada);
});


// ======================================================
// TV - CONSULTAR CHAMADA
// ======================================================

app.get("/tv/chamada", (req, res) => {

    const db = readDB();

    res.json({

        chamada:
            db.tv_chamada,

        historico:
            db.tv_historico
    });
});


// ======================================================
// LISTA DE MEDICAÇÕES
// ======================================================

app.get(
    "/lista-medicacoes",
    (req, res) => {

        res.json([

            "Dipirona",

            "Paracetamol",

            "Ibuprofeno",

            "Amoxicilina",

            "Azitromicina",

            "Loratadina",

            "Omeprazol",

            "Buscopan",

            "Dramin",

            "Soro fisiológico"

        ]);
    }
);


// ======================================================
// CONSULTA MÉDICA
// ======================================================

app.post("/consulta", (req, res) => {

    const db = readDB();

    const consulta = {

        id:
            Date.now(),

        pacienteId:
            req.body.pacienteId || null,

        paciente:
            req.body.paciente || "",

        diagnostico:
            req.body.diagnostico || "",

        medicacao:
            req.body.medicacao || "",

        obs:
            req.body.obs || "",

        createdAt:
            new Date().toISOString()
    };


    db.consultas.push(
        consulta
    );


    writeDB(db);


    res.status(201).json(
        consulta
    );
});


// ======================================================
// LISTAR CONSULTAS
// ======================================================

app.get("/medicacoes", (req, res) => {

    const db = readDB();

    res.json(
        db.consultas
    );
});


// ======================================================
// INICIAR SERVIDOR
// ======================================================

const PORT =
    process.env.PORT || 3000;


app.listen(
    PORT,
    () => {

        console.log(
            `Servidor rodando na porta ${PORT}`
        );

        console.log(
            `Banco de dados: ${DB_FILE}`
        );
    }
);
