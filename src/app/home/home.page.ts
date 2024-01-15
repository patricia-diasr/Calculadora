import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { IonicModule, MenuController } from '@ionic/angular';

@Component({
	selector: 'app-home',
	templateUrl: 'home.page.html',
	styleUrls: ['home.page.scss'],
	standalone: true,
	imports: [IonicModule, CommonModule],
})

export class HomePage {

	numeros: any = ['0','1','2','3','4','5','6','7','8','9'];  // Array de algarismos
	operacoes: any = ['+','-','*','/'];     // Array de operações disponíveis

	digponto: any = true;      // Permite colocar ponto
	negativo: any = true;      // Estado número negativo
	conta: any = '';          // String da conta
	result: any = '';         // String auxiliar de resultado
	resultado: any = '';     // String do resultado

	larguraTela: number = 0;
	limiteCaracteres: number = 27;

	historico: any = [];

	// Define tamanho inicial da tela
	ngOnInit() {
		this.larguraTela = window.innerWidth;
		this.definirLimiteCaracteres();
		localStorage.setItem('historico', '[]')
	}

	constructor(private menuCtrl: MenuController) {}

	abreHistorico() {
		this.menuCtrl.open('historico');
		this.historico = JSON.parse(localStorage.getItem('historico') || '[]');
	}

	// Define tamanho da tela quando esse tamanho muda
	@HostListener('window:resize', ['$event'])
	onResize(event: any) {
		this.definirLimiteCaracteres();
		this.larguraTela = window.innerWidth;
	}

	// Define limite de Caracteres
	definirLimiteCaracteres(){
		if(this.larguraTela >= 1235){
			this.limiteCaracteres = 27;
		} else if (this.larguraTela >= 1029){
			this.limiteCaracteres = 20;
		} else if (this.larguraTela >= 779){
			this.limiteCaracteres = 14;
		} else {
			this.limiteCaracteres = 11;
		}
	}

	// Função chamada ao clicar uma tecla
	clicar(tecla: any): void {
		if(tecla == 'del' || tecla == 'Backspace'){  // Se a tecla escolhida é o Backspace chama função cliqueDeletar
			this.cliqueDeletar();
		}
		if(this.conta.length >= this.limiteCaracteres){   // Limite de caracteres
			return; 
		}
		if(tecla == 'C' || tecla == 'c' || tecla == 'Delete'){   // Se a tecla escolhida é o C zera configuaração
			this.digponto = true;
			this.negativo = true;
			this.conta = '';
			this.result = '';
			this.resultado = '';
		}
		if (tecla in this.numeros){     // Se a tecla escolhida é um número chama função cliqueNumero
			this.cliqueNumero(tecla);
		}
		if (this.operacoes.indexOf(tecla) != -1){    // Se a tecla escolhida é um operacao chama função cliqueOperacoes
			this.cliqueOperacoes(tecla);
		}
		if(tecla == '.' || tecla == ','){ // Se a tecla escolhida é o . chama função cliquePonto
			this.cliquePonto();
		}
		if(tecla == '%'){               // Se a tecla escolhida é o % chama função cliquePorcent
			this.cliquePorcent();
		}
		if(tecla == 'neg'){          // Se a tecla escolhida é o +/- chama função cliqueNegativo
			this.cliqueNegativo();
		}
	
		this.result = this.calcular(); 
		this.resultado = isNaN(this.result) ? '' : this.result < 0 ? `(${this.result.toString()})` : this.result;  // Atualiza resultado no visor, verificando se ele é um número
	
		if(tecla == '=' || tecla == 'Enter'){  // Se a tecla escolhida é o =, chama a função cliqueIgual
			this.cliqueIgual();
		}
	}
	
	// Função para números
	cliqueNumero(numero: any): void {
		if(numero == '0' && this.conta != ''){        // Se for zero
			let primeiroNumero = this.conta[this.acharPosUltOperacao()+1];// Primeiro número após ultima operação
			if(primeiroNumero == '0' && this.digponto){   // Verifica se 0 esta sendo repitido, se sim não permite
				return;
			}
		}
		else if(this.acharPosUltOperacao()+2 == this.conta.length && this.conta[this.conta.length-1] == '0'){  // Se esse é o segundo número digitado, e o primeiro é 0, apaga-se o 0
			this.cliqueDeletar();
		}
		if(this.conta[this.conta.length-1] == ')'){   // Se ultimo caracter é ), coloca *
			this.conta += '*';
			this.digponto = true;
		}
		this.conta += numero;    // Adiciona número a conta
	}
	
	// Função para operações
	cliqueOperacoes(operacao: any): void {
		if(this.conta != '' && !(this.conta[this.conta.length-1] == '-' && this.conta[this.conta.length-2] == '(')){    // Se conta não estiver vazia
			this.digponto = true;    // Permite que seja colocado ponto
			if(!this.negativo){     // Se um número negativo está aberto, ele será fechado
				this.cliqueNegativo();
			}
			else if(this.numeros.indexOf(this.conta[this.conta.length-1]) == -1 && this.conta[this.conta.length-1] != ')'){   // Se o ultimo caracter não é um número nem um parenteses, apaga o ultimo caracter
				this.cliqueDeletar();
			}
			this.conta += operacao;  // Adiciona a operação
		}
	}
	
	// Função para ponto
	cliquePonto(): void {
		if(this.conta[this.conta.length-1] != '.' && this.digponto){     // Se o ultimo caractere não é um ponto, e é permitido colocar um ponto
			if(this.numeros.indexOf(this.conta[this.conta.length-1]) == -1){  // Se o ultimo caracter não é um número, colocamos 0.
				this.conta += '0.';
			}
			else{    // Se não colocamlos só o ponto
				this.conta += '.';
			}
			this.digponto = false;    // Proibimos de colocar outro ponto no mesmo número
		}
	}
	
	// Função para apagar
	cliqueDeletar(): void {
		let ultimoDigito = this.conta[this.conta.length-1];  // Ultimo caracter  
		if(ultimoDigito == '.'){   // Volta configurações para antes de colocado o ponto
			this.digponto = true;   
		}
		if(ultimoDigito == ')'){  // Volta configurações para antes de colocado o parenteses
			this.negativo = false;
			this.digponto = !this.verificarDecimal();  // Verifica se pode colocar um ponto
		}
		if(ultimoDigito == '-' && this.conta[this.conta.length-2] == '('){  // Apaga (- e volta configurações
			this.negativo = true;
			this.conta = this.conta.slice(0, -1);
		}
		this.conta = this.conta.slice(0, -1);  // Apaga o ultimo caracter
	}
	
	// Função para porcentagem
	
	// Pelo o que pesquisamos, a porcentagem funciona um pouco diferente dependendo da calculadora
	// Baseamos nessa na calculadora do Android 13.0.8
	// Quando usa-se com a multiplicação ou divisão, a calculadora entende como o número divido por 100
	// Quando usa-se na soma ou subtração, soma-se/subtrai-se do resultado anterior a porcentagem
	
	cliquePorcent(): void {
		if(this.conta != '' && this.numeros.indexOf(this.conta[this.conta.length-1]) != -1){  // Se a conta não estiver vazia e o ultimo caracter for um número ou um parenteses
			let posUltOperacao = this.acharPosUltOperacao();       // Posição da ultima operação
			let ultimaOperacao = this.conta[posUltOperacao];   // Ultima operação utilizada
			let ultimoNumero = Number(this.conta.slice(posUltOperacao+1));   // Número que acompanha a porcentagem
			let adicionarConta = '';                 // Variavél com conta a ser adicionada
			this.conta = this.conta.slice(0,posUltOperacao+1);  // Apaga até a ultima operação
			if (ultimaOperacao == '*' || ultimaOperacao == '/' || posUltOperacao == -1){   // Se for multiplicação ou divisão, ou se não tiver mais nada no visor
				adicionarConta =`${Number(ultimoNumero)/100}`;          // Divide o ultimo número por 100
			}
			else{
				let aux = eval(this.conta.slice(0, this.conta.length - 1));  // Calcula o valor da conta até o momento
				if(aux<0){                                   // Se for negativo, coloca parenteses                                        
					adicionarConta = '('+aux*(ultimoNumero/100)+')';   // Faz calculo da porcentagem
				}
				else{
					adicionarConta += aux*(ultimoNumero/100);          // Faz calculo da porcentagem
				}
			}
			this.conta += adicionarConta;                                   // Adiciona a conta
			if(adicionarConta.indexOf('.') != -1){                       // Se o valor adicionado é decimal, proibi de colocar outro ponto
				this.digponto = false ;
			}
		}
	}
	
	// Função para colocar número negativo
	cliqueNegativo(): void {
		if(this.negativo){    // Abrir parenteses de um número negativo
			if(this.numeros.indexOf(this.conta[this.conta.length-1]) != -1 || this.conta[this.conta.length-1] == ')'){  // Se ultimo caracter for um parenteses ou um número coloca multiplicação
				this.conta += '*';
				this.digponto = true;
			}
			this.conta += '(-';  // Adiciona sinal de nagativo
			this.negativo = false;  // Avisa que está digitando o número negativo
		}
		else if(this.conta[this.conta.length-1] != '-' && this.conta[this.conta.length-2] != '('){  // Fechando número negativo, verifica se não está fechando vazio
			if(this.conta[this.conta.length-1] == '.'){  // Apaga ponto se tiver
				this.cliqueDeletar();
			}
			this.conta += ')';
			this.digponto = false;
			this.negativo = true;
		}
	}
	
	// Função para tecla de igual
	cliqueIgual(): void {
		let contaAnterior = this.conta;
		this.conta = this.calcular();
		this.conta = this.conta<0 ? `(${this.conta.toString()})` : this.conta.toString();
		this.gravarHistorico(contaAnterior, this.conta);
		this.resultado = ''
	}
	
	// Função para calcular resultado
	calcular(): any {
		let resultado = Number(eval(this.conta));
		return resultado;
	}

	async gravarHistorico(conta:string, resultado: number) {
		let historico = localStorage.getItem('historico') || '[]';
		let arrayHistorico = JSON.parse(historico);
		arrayHistorico.unshift([resultado, conta]);
		localStorage.setItem('historico', JSON.stringify(arrayHistorico));
	}
	
	// Função para achar ultima operação uutilizada
	acharPosUltOperacao(): any {   // Retorna ultima vez que uma operação foi usada
		for(let i = this.conta.length; i--; i > 0){
			if(this.operacoes.indexOf(this.conta[i]) != -1){
				return i;
			}
		}
		return -1;
	}
	
	// Função que verifica se o ultimo número digitado é decimal
	verificarDecimal(): any {
		let posUltOperacao = this.acharPosUltOperacao(); 
		for(let i=this.conta.length; i--; i>posUltOperacao){
			if(this.conta[i] == '.'){
				return true;
			}
		}
		return false;
	}

	// Aciona método clicar pelo teclado
	@HostListener('document:keydown', ['$event'])
	handleKeyboardEvent(event: KeyboardEvent): void {
		this.clicar(event.key)
	}

	// Tema

    root: any = document.documentElement;
	theme: any = {
		light(){
			document.documentElement.style.setProperty('--ion-color-primary','#f4f5f8');
			document.documentElement.style.setProperty('--ion-color-secondary','#FF9BEB');
			document.documentElement.style.setProperty('--ion-color-tertiary','#B0FF9B');
			document.documentElement.style.setProperty('--ion-color-quaternary','#B3499D');
			document.documentElement.style.setProperty('--font-color','#6DB35B');
			document.documentElement.style.setProperty('--claro', 'none');
			document.documentElement.style.setProperty('--escuro', 'block');
		},
		dark(){
			document.documentElement.style.setProperty('--ion-color-primary','#012340');
			document.documentElement.style.setProperty('--ion-color-secondary','#025939');
			document.documentElement.style.setProperty('--ion-color-tertiary','#027333');
			document.documentElement.style.setProperty('--ion-color-quaternary','#04D939');
			document.documentElement.style.setProperty('--font-color','#f4f5f8');
			document.documentElement.style.setProperty('--claro', 'block');
			document.documentElement.style.setProperty('--escuro', 'none');
		}
	}
	
}
