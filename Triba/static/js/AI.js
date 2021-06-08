"use strict";

// za igru
var korijen;
var brojac = 0;

// konstante
var maxBrojStanja = 35;
var maxDubina = 3;

class Cvor {
	constructor(id, v, s, igrac, trougao) {
		this.id = id;
		this.skor = v;
		this.djeca = [];
		this.roditelj = null;
		this.stanje = s; // [niz povucenih duzi, broj slobodnih polja i razlika zauzetih polja igraca A i B]
		this.igrac = igrac;
		this.trougao = trougao;
	}
}

function miniMaxAlphaBeta(stanje, trenutnoNaPotezu) {
	if(trenutnoNaPotezu == 0)
		korijen = new Cvor(0, Infinity, stanje, "A", []);
	else
		korijen = new Cvor(0, Infinity, stanje, "B", []);
	brojac++;

	var [potez, _] = miniMaxAlphaBetaRek(korijen, trenutnoNaPotezu, -Infinity, Infinity, 0);
    
	return potez;
}

function miniMaxAlphaBetaRek(trenutni, sadNaPotezu, alpha, beta, dubina) {
	var igrac;
	var potez = trenutni.trougao;
	if(dubina == maxDubina) {
		trenutni.skor = skorStanja(trenutni.stanje, sadNaPotezu);
	}
	else if (sadNaPotezu == 0) { // maxi igrac
		igrac = "B";
		var maxSkor = -Infinity
		var sljedecaStanja = mogucaSljedecaStanja(trenutni.stanje, sadNaPotezu);

		if (sljedecaStanja.length == 0) {
			trenutni.skor = skorStanja(trenutni.stanje, 1-sadNaPotezu);
			return [potez, trenutni.skor];
		}

		for (var i = 0 ; i < sljedecaStanja.length ; i++) {
			var s = [sljedecaStanja[i][0], sljedecaStanja[i][1], sljedecaStanja[i][2]];
			var novi = new Cvor(brojac, Infinity, s, igrac);
			brojac+=1;
			novi.roditelj = trenutni;
			novi.trougao = sljedecaStanja[i][3];
			trenutni.djeca.push(novi);
			var [_, noviSkor] = miniMaxAlphaBetaRek(novi, 1-sadNaPotezu, alpha, beta, dubina+1);
			if(noviSkor > maxSkor) {
				maxSkor = noviSkor;
				potez = novi.trougao;
			}
			alpha =	Math.max(alpha, maxSkor);
			if(beta <= alpha) {
				break;
			} 
		}
		trenutni.skor = maxSkor;	
	}
	else { // mini igrac
		igrac = "A";
		var minSkor = Infinity
		var sljedecaStanja = mogucaSljedecaStanja(trenutni.stanje, sadNaPotezu);

		if (sljedecaStanja.length == 0) {
			trenutni.skor = skorStanja(trenutni.stanje, 1-sadNaPotezu);
			return [potez, trenutni.skor];
		}

		for (var i = 0 ; i < sljedecaStanja.length ; i++) {
			var s = [sljedecaStanja[i][0], sljedecaStanja[i][1], sljedecaStanja[i][2]];
			var novi = new Cvor(brojac, -Infinity, s, igrac);
			brojac+=1;
			novi.roditelj = trenutni;
			novi.trougao = sljedecaStanja[i][3];
			trenutni.djeca.push(novi);
			var [_, noviSkor] = miniMaxAlphaBetaRek(novi, 1-sadNaPotezu, alpha, beta, dubina+1);
			if(noviSkor < minSkor) {
				minSkor = noviSkor;
				potez = novi.trougao;
			}
			beta = Math.min(beta, minSkor);
			if(beta <= alpha) {
				break;
			}
		}
		trenutni.skor = minSkor;
	}
	return [potez, trenutni.skor];
}

function brojPreostalihPoteza(s) {
	var slobodnaPoljaSad = s[1];
	var brojPoteza = 0;
	for(var i1 = 0 ; i1 < slobodnaPoljaSad.length ; i1++)
		for(var i2 = 0 ; i2 < slobodnaPoljaSad.length ; i2++)
			for(var i3 = 0 ; i3 < slobodnaPoljaSad.length ; i3++) {
				var t1 = slobodnaPoljaSad[i1], t2 = slobodnaPoljaSad[i2], t3 = slobodnaPoljaSad[i3];
				if(nemaIstiPar(t1[0], t1[1], t2[0], t2[1], t3[0], t3[1]) && mozeSeDodatiTrougaoAI([[t1[0], t1[1]], [t2[0], t2[1]], [t3[0], t3[1]]], s)) {
					brojPoteza++;
				}
			}	
	return brojPoteza;
}

function skorStanja(s, sadNaPotezu) {
	/*var kraj = krajIgreAI(s);
	if(kraj) {
		if(sadNaPotezu == 0)
			return -Infinity;
		else
			return Infinity;
	}*/
	return s[2];
}

function krajIgreAI(s) {
	var slobodnaPoljaSad = s[1];

	for(var i1 = 0 ; i1 < slobodnaPoljaSad.length ; i1++)
		for(var i2 = 0 ; i2 < slobodnaPoljaSad.length ; i2++)
			for(var i3 = 0 ; i3 < slobodnaPoljaSad.length ; i3++) {
				var t1 = slobodnaPoljaSad[i1], t2 = slobodnaPoljaSad[i2], t3 = slobodnaPoljaSad[i3];
				if(nemaIstiPar(t1[0], t1[1], t2[0], t2[1], t3[0], t3[1]) && mozeSeDodatiTrougaoAI([[t1[0], t1[1]], [t2[0], t2[1]], [t3[0], t3[1]]], s)) {
					return false;
				}
			}
	return true;
}

function mogucaSljedecaStanja(s, sadNaPotezu) {
	var rez = [];
	var slobodnaPoljaSad = s[1];
	var nadjenaStanja = 0;
	shuffle(slobodnaPoljaSad);
	for(var i1 = 0 ; i1 < slobodnaPoljaSad.length ; i1++) {
		if (nadjenaStanja == maxBrojStanja)
					break;
		for(var i2 = 0 ; i2 < slobodnaPoljaSad.length ; i2++) {
			for(var i3 = 0 ; i3 < slobodnaPoljaSad.length ; i3++) {
				var t1 = slobodnaPoljaSad[i1], t2 = slobodnaPoljaSad[i2], t3 = slobodnaPoljaSad[i3];
				if(nemaIstiPar(t1[0], t1[1], t2[0], t2[1], t3[0], t3[1]) && mozeSeDodatiTrougaoAI([[t1[0], t1[1]], [t2[0], t2[1]], [t3[0], t3[1]]], s)) {
					nadjenaStanja++;

					rez.push([kopija(s[0]), kopija(s[1]), s[2], [t1, t2, t3]]);

					rez[rez.length - 1][0].push([t1[0], t1[1], t2[0], t2[1]]);
					rez[rez.length - 1][0].push([t1[0], t1[1], t3[0], t3[1]]);
					rez[rez.length - 1][0].push([t2[0], t2[1], t3[0], t3[1]]);

					zauzmiPoljaAI(t1[0], t1[1], t2[0], t2[1], rez[rez.length - 1], sadNaPotezu);
					zauzmiPoljaAI(t1[0], t1[1], t3[0], t3[1], rez[rez.length - 1], sadNaPotezu);
					zauzmiPoljaAI(t2[0], t2[1], t3[0], t3[1], rez[rez.length - 1], sadNaPotezu);
				}
				if(nadjenaStanja == maxBrojStanja)
						break;
			}
		if(nadjenaStanja == maxBrojStanja)
			break;
		}
	}
	return rez;
}

function zauzmiPoljaAI(x1, y1, x2, y2, stanje, sadNaPotezu) {
	for(var i = 0 ; i < stanje[1].length ; i++)
		if(daLiJeTackaNaDuzi(stanje[1][i][0], stanje[1][i][1], [x1, y1, x2, y2])) {
			stanje[1].splice(i, 1);
			if(sadNaPotezu == 0)
				stanje[2]++;
			else
				stanje[2]--;
		}
}

// Provjerava da li se moze dodati trougao
function mozeSeDodatiTrougaoAI(tacke, s) {
	var duzi = s[0], slobodnaPoljaSad = s[1];
	if(naIstojPravoj(tacke))
		return false;

	if(dodajDuzAI(tacke[0][0], tacke[0][1], tacke[1][0], tacke[1][1], duzi) && 
        dodajDuzAI(tacke[0][0], tacke[0][1], tacke[2][0], tacke[2][1], duzi) && 
        dodajDuzAI(tacke[1][0], tacke[1][1], tacke[2][0], tacke[2][1], duzi)) {
		return true;
	} 
	return false;
}

// Provjerava da li se moze nacrtati duz
function dodajDuzAI(x1, y1, x2, y2, duzi) {

	// Ako duz sijece neku prijasnju duz, ne dodajemo je
	for(var i = 0 ; i < duzi.length ; i++) {
		var d = duzi[i];
		if(sijekuLiSe([x1, y1, x2, y2], d))			
			return false;
	};

	return true;
}

