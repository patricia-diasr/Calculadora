const numeros: string[] = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];  // Array de algarismos
const operacoes: string[] = ["+", "-", "*", "/"];     // Array de operações disponíveis

let digponto: boolean = true; // Permite colocar ponto
let negativo: boolean = true;      // Estado número negativo
let conta: any = "";          // String da conta
let result: any = "";         // String auxiliar de resultado
let resultado: string = "";     // String do resultado

const elConta = document.querySelector("#contaTexto");
const elResultado = document.querySelector("#resultadoTexto")

let historico: string[] = [];
const elHistorico = document.querySelector("#historico");
const elContainerHistorico = document.querySelector("#containerHistorico");
localStorage.setItem("historico", "[]");

// Função chamada ao clicar uma tecla
function clicar(tecla: string): void {
    if (tecla == "del" || tecla == "Backspace") {  // Se a tecla escolhida é o Backspace chama função cliqueDeletar
        cliqueDeletar();
    }
    if (tecla == "C" || tecla == "c" || tecla == "Delete") {   // Se a tecla escolhida é o C zera configuaração
        digponto = true;
        negativo = true;
        conta = "";
        result = "";
        resultado = "";
        if (elConta !== null) {
            elConta.textContent = conta;
        }
        if (elResultado !== null) {
            elResultado.textContent = resultado;
        }
    }
    if (tecla in numeros) {     // Se a tecla escolhida é um número chama função cliqueNumero
        cliqueNumero(tecla);
    }
    if (operacoes.indexOf(tecla) != -1) {    // Se a tecla escolhida é um operacao chama função cliqueOperacoes
        cliqueOperacoes(tecla);
    }
    if (tecla == "." || tecla == ",") { // Se a tecla escolhida é o . chama função cliquePonto
        cliquePonto();
    }
    if (tecla == "%") {               // Se a tecla escolhida é o % chama função cliquePorcent
        cliquePorcent();
    }
    if (tecla == "neg") {          // Se a tecla escolhida é o +/- chama função cliqueNegativo
        cliqueNegativo();
    }

    result = calcular(); 
    resultado = isNaN(result) ? "" : result < 0 ? `(${result.toString()})` : result;  // Atualiza resultado no visor, verificando se ele é um número

    if (tecla == "=" || tecla == "Enter") {  // Se a tecla escolhida é o =, chama a função cliqueIgual
        cliqueIgual();
    }

    if (elConta !== null) {
        elConta.textContent = conta;
    }

    if (elResultado !== null) {
        elResultado.textContent = resultado;
    }
}

// Função para números
function cliqueNumero(numero: string): void {
    if (numero == "0" && conta != "") {        // Se for zero
        let primeiroNumero = conta[acharPosUltOperacao()+1];   // Primeiro número após ultima operação
        if (primeiroNumero == "0" && digponto) {   // Verifica se 0 esta sendo repetido, se sim, não permite
            return;
        }
    }
    else if (acharPosUltOperacao()+2 == conta.length && conta[conta.length-1] == "0") {  // Se esse é o segundo número digitado, e o primeiro é 0, apaga-se o 0
        cliqueDeletar();
    }
    if (conta[conta.length-1] == ")") {   // Se ultimo caracter é ), coloca *
        conta += "*";
        digponto = true;
    }
    conta += numero;
    if (elConta !== null) {
        elConta.textContent = conta;
    }
    if (elResultado !== null) {
        elResultado.textContent = resultado;
    }
}

// Função para operaçõesS
function cliqueOperacoes(operacao: string): void {
    if (conta != "" && !(conta[conta.length-1] == "-" && conta[conta.length-2] == "(")) {    // Se conta não estiver vazia
        digponto = true;    // Permite que seja colocado ponto
        if (!negativo) {   // Se um número negativo está aberto, ele será fechado
            cliqueNegativo();
        }
        else if (numeros.indexOf(conta[conta.length-1]) == -1 && conta[conta.length-1] != ")") {   // Se o ultimo caracter não é um número nem um parenteses, apaga o ultimo caracter
            cliqueDeletar();
        }
        conta += operacao;
        if (elConta !== null) {
            elConta.textContent = conta;
        }
        if (elResultado !== null) {
            elResultado.textContent = resultado;
        }
    }
}

// Função para ponto
function cliquePonto(): void {
    if (conta[conta.length-1] != "." && digponto) {     // Se o ultimo caractere não é um ponto, e é permitido colocar um ponto
        if (numeros.indexOf(conta[conta.length-1]) == -1) {  // Se o ultimo caracter não é um número, colocamos "0."
            conta += "0.";
        }
        else {
            conta += ".";
        }
        digponto = false;
        if (elConta !== null) {
            elConta.textContent = conta;
        }
        if (elResultado !== null) {
            elResultado.textContent = resultado;
        }
    }
}

// Função para apagar
function cliqueDeletar(): void {
    let ultimoDigito = conta[conta.length-1];  // Ultimo caracter  
    if (ultimoDigito == ".") {   // Volta configurações para antes de colocado o ponto
        digponto = true;   
    }
    if (ultimoDigito == ")") {  // Volta configurações para antes de colocado o parenteses
        negativo = false;
        digponto = !verificarDecimal();
    }
    if (ultimoDigito == "-" && conta[conta.length-2] == "(") {  // Apaga (- e volta configurações
        negativo = true;
        conta = conta.slice(0, -1);
    }
    conta = conta.slice(0, -1);  // Apaga o ultimo caracter
    if (elConta !== null) {
        elConta.textContent = conta;
    }
    if (elResultado !== null) {
        elResultado.textContent = resultado;
    }
}

// Função para porcentagem
// Quando usa-se com a multiplicação ou divisão, a calculadora entende como o número divido por 100
// Quando usa-se na soma ou subtração, soma-se/subtrai-se do resultado anterior a porcentagem

function cliquePorcent(): void {
    if (conta != "" && numeros.indexOf(conta[conta.length-1]) != -1) {  // Se a conta não estiver vazia e o ultimo caracter for um número ou um parenteses
        let posUltOperacao = acharPosUltOperacao();       // Posição da ultima operação
        let ultimaOperacao = conta[posUltOperacao];   // Ultima operação utilizada
        let ultimoNumero = Number(conta.slice(posUltOperacao+1));   // Número que acompanha a porcentagem
        let adicionarConta = "";                 // Variavél com conta a ser adicionada
        conta = conta.slice(0,posUltOperacao+1);  // Apaga até a ultima operação
        if (ultimaOperacao == "*" || ultimaOperacao == "/" || posUltOperacao == -1) {   // Se for multiplicação ou divisão, ou se não tiver mais nada no visor
            adicionarConta =`${Number(ultimoNumero)/100}`;          // Divide o ultimo número por 100
        }
        else {
            let aux = eval(conta.slice(0, conta.length - 1));  // Calcula o valor da conta até o momento
            if (aux<0) {                                   // Se for negativo, coloca parenteses                                        
                adicionarConta = "("+arredondarNumero(aux*(ultimoNumero/100))+")";   // Faz calculo da porcentagem
            }
            else {
                adicionarConta += arredondarNumero(aux*(ultimoNumero/100));          // Faz calculo da porcentagem
            }
        }
        conta += adicionarConta;
        if (adicionarConta.indexOf(".") != -1) {                       // Se o valor adicionado é decimal, proibi de colocar outro ponto
            digponto = false ;
        }
    }
    if (elConta !== null) {
        elConta.textContent = conta;
    }
    if (elResultado !== null) {
        elResultado.textContent = resultado;
    }
}

// Função para colocar número negativo
function cliqueNegativo(): void {
    if (negativo) {    // Abrir parenteses de um número negativo
        if (numeros.indexOf(conta[conta.length-1]) != -1 || conta[conta.length-1] == ")") {  // Se ultimo caracter for um parenteses ou um número coloca multiplicação
            conta += "*";
            digponto = true;
        }
        conta += "(-";
        negativo = false;
    }
    else if (conta[conta.length-1] != "-" && conta[conta.length-2] != "(") {  // Fechando número negativo, verifica se não está fechando vazio
        if (conta[conta.length-1] == ".") {  // Apaga ponto se tiver
            cliqueDeletar();
        }
        conta += ")";
        digponto = false;
        negativo = true;
    }
    if (elConta !== null) {
        elConta.textContent = conta;
    }
    if (elResultado !== null) {
        elResultado.textContent = resultado;
    }
}

// Função para tecla de igual
function cliqueIgual(): void {
    let contaAnterior = conta;
    conta = calcular();
    conta = conta<0 ? `(${conta.toString()})` : conta.toString();
    if (conta == "NaN") {
        conta = "0";
        return;
    }
    if (conta.includes(".")) {
        digponto = false;
    }
    gravarHistorico(contaAnterior, conta);
    resultado = "";
    if (elConta !== null) {
        elConta.textContent = conta;
    }
    if (elResultado !== null) {
        elResultado.textContent = resultado;
    }
}

// Função para calcular resultado
function calcular(): number {
    let resultado = arredondarNumero(eval(conta));
    return resultado;
}

// Função que grava conta no histórico
async function gravarHistorico(conta:string, resultado: number) {
    let historico = localStorage.getItem("historico") || "[]";
    let arrayHistorico = JSON.parse(historico);
    if (arrayHistorico.length > 0 && ((arrayHistorico[0][0] == resultado && arrayHistorico[0][1] == conta) || (conta == String(resultado)))) {   // Impede de repetir no histórico
        return
    }
    arrayHistorico.unshift([resultado, conta]);
    localStorage.setItem("historico", JSON.stringify(arrayHistorico));
}

// Função para quando se é clicado em um valor do histórico
function cliqueHistorico(valor: string) {
    if (valor.includes(".")) {
        digponto = false;
    }
    cliqueNumero(valor);

    if (elConta !== null) {
        elConta.textContent = conta;
    }
    if (elResultado !== null) {
        elResultado.textContent = resultado;
    }
}

// Verifica fechamento do histórico
if (elContainerHistorico !== null){
    elContainerHistorico.addEventListener("click", (event) => {
        if (event.target !== null && event.target !== elHistorico){
            abreHistorico()
        }
    })
}

// Abre/fecha histórico
function abreHistorico():void {
    if (elContainerHistorico !== null) {
        elContainerHistorico.classList.toggle("visivel");
        gerarHistorico()
    }
}

// Gera elementos do histórico
function gerarHistorico():void {
    historico = JSON.parse(localStorage.getItem("historico") || "[]");
    if (historico.length !== 0){
        let elUl = document.querySelector("#listaHistorico");
        if (elUl !== null) {
            elUl.innerHTML = "";
        }
        historico.forEach(item => {
            let elLi = document.createElement("li");
            if (elLi !== null) {
                elLi.onclick = function() {
                    cliqueHistorico(item[0]);
                };
            }            
            elLi.innerHTML = `
                <span class="resultado">${item[0]}</span>
                <span class="conta">${item[1]}</span>
            `;
            if (elUl !== null) {
                elUl.appendChild(elLi);
            }
        });
    }
}

// Função para achar ultima operação uutilizada
function acharPosUltOperacao(): number {
    for (let i = conta.length; i--; i > 0) {
        if (operacoes.indexOf(conta[i]) != -1) {
            return i;
        }
    }
    return -1;
}

// Função que verifica se o ultimo número digitado é decimal
function verificarDecimal(): boolean {
    let posUltOperacao = acharPosUltOperacao(); 
    for (let i=conta.length; i--; i>posUltOperacao) {
        if (conta[i] == ".") {
            return true;
        }
    }
    return false;
}

// Arredonda número se ele for decimal com mais de 3 casas
function arredondarNumero(numero: number): number {
    let numeroString = numero.toString();
    numeroString = numeroString.replace(/(?:0)+1$/, "");
    return parseFloat(numeroString);
}

// Aciona método clicar pelo teclado
document.body.addEventListener("keydown", (event) => {
    clicar(event.key)
})


// Tema

type ThemeType = {
    light: () => void;
    dark: () => void;
};

const theme: ThemeType = {
    light() {
        document.documentElement.style.setProperty("--color-primary","#f4f5f8");
        document.documentElement.style.setProperty("--color-secondary","#FF9BEB");
        document.documentElement.style.setProperty("--color-tertiary","#B0FF9B");
        document.documentElement.style.setProperty("--color-quaternary","#6DB35B");
        document.documentElement.style.setProperty("--font-color","#B3499D");
        document.documentElement.style.setProperty("--claro", "none");
        document.documentElement.style.setProperty("--escuro", "block");
    },
    dark() {
        document.documentElement.style.setProperty("--color-primary","#012340");
        document.documentElement.style.setProperty("--color-secondary","#025939");
        document.documentElement.style.setProperty("--color-tertiary","#027333");
        document.documentElement.style.setProperty("--color-quaternary","#04D939");
        document.documentElement.style.setProperty("--font-color","#f4f5f8");
        document.documentElement.style.setProperty("--claro", "block");
        document.documentElement.style.setProperty("--escuro", "none");
    }
};

