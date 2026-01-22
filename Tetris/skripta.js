//      tetris-uputstvo     //

let izabraniOblici = [1, 2, 3, 4, 5, 6, 7];
let tezina = 2;

//slike skida i dodaje ako nisu u nizu izabraniOblici
function toglujOblik(num) {
    let index = izabraniOblici.indexOf(num);
    if (index === -1) {
        izabraniOblici.push(num);
        $('#oblik' + num).removeClass('clicked');
    } else {
        izabraniOblici.splice(index, 1);
        $('#oblik' + num).addClass('clicked');
    }
}

//uzima vrednost iz inputa i postavlja je u tezinu
function uzmiTezinu(value) {
    tezina = parseInt(value);
    if(tezina === 1) $('#tezina').text('Lako');
    if(tezina === 2) $('#tezina').text('Srednje');
    if(tezina === 3) $('#tezina').text('Tesko');  
}

//kada se klikne na dugme zapocni igru proverava da li je izabran oblik
$(document).ready(function() {
    $('#dugme_zapocni_igru').click(function(dugme) {
        if (izabraniOblici.length === 0) {
            alert("Morate izabrati barem jedan oblik!");
            dugme.preventDefault();
        }
        else {
            // sacuvaj izabrane oblike u local storage
            localStorage.setItem('izabraniOblici', JSON.stringify(izabraniOblici));
            localStorage.setItem('tezina', JSON.stringify(tezina));
        }
    });
});


/////////////////////////////////////////////////////////////////////////////////

//      tetris-igra     //

$(document).ready(function() {
    //uzimanje vrednosti iz storaga
    let poeni = 0;
    let izabraniOblici = JSON.parse(localStorage.getItem('izabraniOblici')) || [1, 2, 3, 4, 5, 6, 7];
    let tezina = JSON.parse(localStorage.getItem('tezina')) || 2;

    //teren podaci
    const redovi=20;
    const kolone=10;
    let teren = [];

    //oblik podaci
    let trenutniOblik = 0;
    let trenutnoX = 0;
    let trenutnoY = 0;

    //oblici
    let oblici = {
        1: [
            [0,0,1,0],
            [0,0,1,0],
            [0,0,1,0],
            [0,0,1,0]],
        2: [
            [0,0,0,0],
            [0,2,2,0],
            [0,2,2,0],
            [0,0,0,0]],
        3: [
            [0,0,3,0],
            [0,3,3,0],
            [0,0,3,0],
            [0,0,0,0]],
        4: [
            [0,0,4,0],
            [0,0,4,0],
            [0,4,4,0],
            [0,0,0,0]],
        5: [
            [0,5,0,0],
            [0,5,0,0],
            [0,5,5,0],
            [0,0,0,0]],
        6: [
            [0,0,6,0],
            [0,6,6,0],
            [0,6,0,0],
            [0,0,0,0]],
        7: [
            [0,7,0,0],
            [0,7,7,0],
            [0,0,7,0],
            [0,0,0,0]]
    };
    const boje = {
        0: 'black',
        1: 'cyan',
        2: 'yellow',
        3: 'purple',
        4: 'blue',
        5: 'orange',
        6: 'red',
        7: 'green'
    };

    //namestanje za canvas glavni
    const canvas = document.getElementById('igra');
    const ctx = canvas.getContext('2d');

    let sirinaCelije, visinaCelije;

    function podesiVelicinu() {
        const dostupnaVisina = window.innerHeight * 0.95; // 95% of height to prevent overflow
        canvas.height = dostupnaVisina;
        canvas.width = dostupnaVisina / 2; // Keep 10:20 ratio
        sirinaCelije = canvas.width / kolone;
        visinaCelije = canvas.height / redovi;
    }

    function inicijalizujTeren() {
        teren = [];
        for (let i = -5; i < redovi; i++) {
            teren[i] = [];
            for (let j = 0; j < kolone; j++) {
                teren[i][j] = 0;
            }
        }
    }

    window.addEventListener('resize', () => {
        adjustCanvasSize();
        // Redraw everything immediately so the grid doesn't disappear
        nacrtajTeren();
        if (trenutniOblik) {
            nacrtajOblik(trenutniOblik, trenutnoX, trenutnoY);
        }
    });

    //namestanje za canvas za sledeci oblik
    const _2canvas2 = document.getElementById('sledeciOblik');
    const _2ctx2 = _2canvas2.getContext('2d');
    const _2velicinaPolja2 = 50;
    const _2brPolja2 = 4;

    _2canvas2.width = _2brPolja2 * _2velicinaPolja2;
    _2canvas2.height = _2brPolja2 * _2velicinaPolja2;
    
    //crtanje terena
    function nacrtajTeren() {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < redovi; i++) {
            for (let j = 0; j < kolone; j++) {
                // Draw existing blocks from the array
                if (teren[i] && teren[i][j] !== 0) {
                    ctx.fillStyle = boje[teren[i][j]];
                    ctx.fillRect(j * sirinaCelije + 0.5, i * visinaCelije + 0.5, sirinaCelije - 1, visinaCelije - 1);
                }
                // Draw grid lines
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 0.1;
                ctx.strokeRect(j * sirinaCelije, i * visinaCelije, sirinaCelije, visinaCelije);
            }
        }
    }

    // Initial Setup
    podesiVelicinu();
    inicijalizujTeren();

    // Fix for Window Resize
    $(window).resize(function() {
        podesiVelicinu();
        nacrtajTeren();
        // Redraw current moving piece
        if (trenutniOblik) {
            nacrtajOblik(trenutniOblik, trenutnoX, trenutnoY);
        }
    });

    //crtanje oblika
    function nacrtajOblik(tip, x, y) {
        let oblik = oblici[tip];
        trenutniOblik = tip;
        trenutnoX = x;
        trenutnoY = y;
        for (let i = 0; i < oblik.length; i++) {
            for (let j = 0; j < oblik[i].length; j++) {
                if (oblik[i][j]) {
                    ctx.fillStyle = boje[tip];
                    ctx.fillRect((j + trenutnoX) * sirinaCelije + 0.5, (i + trenutnoY) * visinaCelije + 0.5, sirinaCelije - 1, visinaCelije - 1);
                    teren[trenutnoY + i][trenutnoX + j] = oblik[i][j];
                }
            }
        }
    }

    //stvaranje oblika gore na sredini i smisljanje sledeceg oblika
    let sledeciOblik = izabraniOblici[Math.floor(Math.random() * izabraniOblici.length)];
    let broj_random_rotacija = Math.floor(Math.random() * 3);
    function stvoriOblik() {
        if(uslovZaZaustaviIgru()) {
            zaustaviIgru();
            return;
        }
        //trenutni oblik crtanje + random rotacija
        nacrtajOblik(sledeciOblik, 3, -3);
        for(let i = 0; i < broj_random_rotacija; i++) {
            rotacija()
        }
        //priprema sledeceg oblika
        sledeciOblik = izabraniOblici[Math.floor(Math.random() * izabraniOblici.length)];
        broj_random_rotacija = Math.floor(Math.random() * 3);        
        _2nacrtajTeren2();
        _2nacrtajOblik2(sledeciOblik, broj_random_rotacija);
    }

    //pomocne funkcije za pomeranje oblika
    function obrisiOblik() {
        let oblik = oblici[trenutniOblik];
        for (let i = 0; i < oblik.length; i++) {
            for (let j = 0; j < oblik[i].length; j++) {
                if (oblik[i][j]) {
                    ctx.fillStyle = 'black';
                    ctx.fillRect((j + trenutnoX) * sirinaCelije, (i + trenutnoY) * visinaCelije, sirinaCelije, visinaCelije);
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = 0.1;
                    ctx.strokeRect((j + trenutnoX) * sirinaCelije, (i + trenutnoY) * visinaCelije, sirinaCelije, visinaCelije);
                    teren[trenutnoY + i][trenutnoX + j] = 0;
                }
            }
        }
    }

    function kolizijaZadrzavanje() {
        let oblik = oblici[trenutniOblik];
        //svi redovi osim poslednjeg
        for (let i = 0; i < oblik.length - 1; i++) {
            for (let j = 0; j < oblik[i].length; j++) {
                if (oblik[i][j]) {
                    if ((trenutnoY + i + 1 >= redovi) || ((teren[trenutnoY + i + 1][trenutnoX + j] !== 0) && (oblik[i + 1][j] === 0))) {
                        return true;
                    }
                }
            }
        }
        //za poslednji red
        let i = oblik.length - 1;
        for (let j = 0; j < oblik[i].length; j++) {
            if (oblik[i][j]) {
                if ((trenutnoY + i + 1 >= redovi) || (teren[trenutnoY + i + 1][trenutnoX + j] !== 0)) {
                    return true;
                }
            }
        }
        return false;
    }

    //puna linija
    function obrisiLiniju(red) {
        //svi osim prvog reda
        for (let i = red; i > 0; i--) {
            for (let j = 0; j < kolone; j++) {
                ctx.fillStyle = boje[teren[i - 1][j]];
                ctx.fillRect(j * sirinaCelije + 0.5, i * visinaCelije + 0.5, sirinaCelije - 1, visinaCelije - 1);
                teren[i][j] = teren[i - 1][j];
            }
        }
        //prvi red
        for (let j = 0; j < kolone; j++) {
            ctx.fillStyle = 'black';
            ctx.fillRect(j * sirinaCelije, 0 * visinaCelije, sirinaCelije, visinaCelije);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 0.1;
            ctx.strokeRect(j * sirinaCelije, 0 * visinaCelije, sirinaCelije, visinaCelije);
            teren[0][j] = 0;
        }
    }

    function punaLinija() {
        for (let i = 0; i < redovi; i++) {
            let puna = true;
            for (let j = 0; j < kolone; j++) {
                if (teren[i][j] === 0) {
                    puna = false;
                    break;
                }
            }
            if (puna) {
                obrisiLiniju(i);
                poeni++;
                tezina += 0.1;
                igra();
            }
        }
    }

    //konstantno padanje tekuceg oblika
    function padanje() {
        if (kolizijaZadrzavanje()) {
            punaLinija();
            stvoriOblik();
        } else {
            obrisiOblik();
            trenutnoY++;
            nacrtajOblik(trenutniOblik, trenutnoX, trenutnoY);
            console.log(teren);//ispis za konzolu
        }
    }

    // zasutavljanje igre (prebaceno u stvori oblik)
    function uslovZaZaustaviIgru() {
        for (let j = 0; j < kolone; j++) {
            if ((teren[0][j] !== 0)) {
                return true;
            }
        }
        return false;
    }

    //zaustavljanje igre
    function zaustaviIgru() {
        clearInterval(petlja);
        petlja = null;
        paused = true;
        
        $('#poeni').text(poeni);
        $('#poruka').removeClass('sakriveno');
        $('#pauza').addClass('sakriveno');
        $('#restart').addClass('sakriveno');

        //dugme za odlazak na rezultate
        $('#sacuvaj').click(function(dugme) {
            let ime = $('#ime').val();
            if (!ime) {
                alert("Morate uneti ime!");
                dugme.preventDefault();
            }
            else {
                // sacuvaj ime i poene
                localStorage.setItem('ime', ime);
                localStorage.setItem('poeni', poeni);
                localStorage.setItem('krajnjaTezina', tezina);
                localStorage.setItem('brojKoriscenihOblika', izabraniOblici.length);
            }
        });
    }
    
    //ptlja u kojoj se odvija igra
    let petlja;
    function igra() {
        clearInterval(petlja);
        petlja = setInterval(function() {
            padanje();
            apdejtujSkor()
        }, 1000 / tezina);
    }
    
    //provera kolizije za pomeranje oblika
    function kolizijaLevo(){
        let oblik = oblici[trenutniOblik];
        for (let i = 0; i < oblik.length; i++) {
            for (let j = 0; j < oblik[i].length; j++) {
                if (oblik[i][j]) {
                    if (trenutnoX + j - 1 < 0) {
                        return true;
                    }
                    if ((teren[trenutnoY + i][trenutnoX + j - 1] !== 0) && ((oblik[i][j - 1] === 0) || ((j - 1) < 0))) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function kolizijaDesno(){
        let oblik = oblici[trenutniOblik];
        for (let i = 0; i < oblik.length; i++) {
            for (let j = 0; j < oblik[i].length; j++) {
                if (oblik[i][j]) {
                    if (trenutnoX + j + 1 >= kolone) {
                        return true;
                    }
                    if ((teren[trenutnoY + i][trenutnoX + j + 1] !== 0) && ((oblik[i][j + 1] === 0) || ((j + 1) > oblik[i].length - 1))) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    //funkcije za strelica
    function levo() {
        if (!kolizijaLevo()) {
            obrisiOblik();
            trenutnoX--;
            nacrtajOblik(trenutniOblik, trenutnoX, trenutnoY);
        }
    }

    function desno() {
        if (!kolizijaDesno()) {
            obrisiOblik();
            trenutnoX++;
            nacrtajOblik(trenutniOblik, trenutnoX, trenutnoY);
        }
    }

    function rotacija() {
        let oblik = oblici[trenutniOblik];
        let novaMatrica = [];
        for (let i = 0; i < oblik.length; i++) {
            novaMatrica[i] = [];
        }
        for (let i = 0; i < oblik.length; i++) {
            for (let j = 0; j < oblik.length; j++) {
                novaMatrica[i][j] = oblik[oblik.length - 1 - j][i];
            }
        }
        //provera da li je validna ta rotacija
        for (let i = 0; i < novaMatrica.length; i++) {
            for (let j = 0; j < novaMatrica[i].length; j++) {
                if (novaMatrica[i][j]) {
                    if ((teren[trenutnoY + i][trenutnoX + j] !== 0) && (oblik[i][j] === 0)) {
                        return;
                    }
                    if ((trenutnoX + j < 0) || (trenutnoX + j >= kolone)) {
                        return;
                    }
                }
            }
        }
        obrisiOblik();
        oblici[trenutniOblik] = novaMatrica;
        nacrtajOblik(trenutniOblik, trenutnoX, trenutnoY);
    }

    //pomeranje oblika listeneri
    $(document).keydown(function(event) {
        if (!paused) {
            switch (event.key) {
                case 'ArrowLeft':
                    levo(); 
                    break;
                case 'ArrowRight':
                    desno(); 
                    break;
                case 'ArrowDown':
                    padanje();
                    break;
                case 'ArrowUp':
                    rotacija();
                    break;
            }
        }
    });

    //pokretanje igre
    function pokreniIgru() {
        clearInterval(petlja);
        tezina = JSON.parse(localStorage.getItem('tezina')) || 2;
        poeni = 0;
        
        inicijalizujTeren(); // Initialize the data array
        podesiVelicinu();    // Set canvas pixels
        nacrtajTeren();      // Draw the black background
        
        stvoriOblik();
        igra();
    }

    pokreniIgru();


    // dugmici sa strane //
    //pauziraj/nastavi
    let paused = false;
    $('#pauza').click(function() {
        if (petlja) {
            paused = true;
            clearInterval(petlja);
            petlja = null;
        } else {
            paused = false;
            igra();
        }
    });
    
    //restartovanje igre
    $('#restart').click(function() {
        pokreniIgru();
    });

    // skor sa strane //
    //slanje vrednosti u polja za skor
    function apdejtujSkor() {
        $('#rezultat').text(poeni);
        $('#nivo').text(Math.floor(tezina));
        $('#podnivo').text(Math.round((tezina - Math.floor(tezina)) * 10));
    }

    //sledeci oblik
    function _2nacrtajTeren2() {
        for (let i = 0; i < _2brPolja2; i++) {
            for (let j = 0; j < _2brPolja2; j++) {
                let x = j * _2velicinaPolja2;
                let y = i * _2velicinaPolja2;                
                _2ctx2.fillStyle = 'black';
                _2ctx2.fillRect(x, y, _2velicinaPolja2, _2velicinaPolja2);
                _2ctx2.strokeStyle = 'white';
                _2ctx2.lineWidth = 0.1;
                _2ctx2.strokeRect(x, y, _2velicinaPolja2, _2velicinaPolja2);
            }
        }
    }

    function _2nacrtajOblik2(tip, brojRotiranja) {
        let oblik = oblici[tip];
        for (let rotacija = 0; rotacija < brojRotiranja; rotacija++) {
            let novaMatrica = [];
            for (let i = 0; i < oblik.length; i++) {
                novaMatrica[i] = [];
            }
            for (let i = 0; i < oblik.length; i++) {
                for (let j = 0; j < oblik.length; j++) {
                    novaMatrica[i][j] = oblik[oblik.length - 1 - j][i];
                }
            }
            oblik = novaMatrica;
        }
        for (let i = 0; i < oblik.length; i++) {
            for (let j = 0; j < oblik[i].length; j++) {
                if (oblik[i][j]) {
                    _2ctx2.fillStyle = boje[tip];
                    _2ctx2.fillRect(j * _2velicinaPolja2 + 0.5, i * _2velicinaPolja2 + 0.5, _2velicinaPolja2 - 1, _2velicinaPolja2 - 1);
                }
            }
        }
    }


    $(window).resize(function() {
        adjustCanvasSize();
        // Re-draw the background/terrain so it doesn't flicker/disappear
        nacrtajTerenIznova(); 
    });

    // Helper to redraw the board state after a resize
    function nacrtajTerenIznova() {
        for (let i = 0; i < redovi; i++) {
            for (let j = 0; j < kolone; j++) {
                // Draw background
                ctx.fillStyle = 'black';
                ctx.fillRect(j * sirinaCelije, i * visinaCelije, sirinaCelije, visinaCelije);
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 0.1;
                ctx.strokeRect(j * sirinaCelije, i * visinaCelije, sirinaCelije, visinaCelije);
                
                // Draw existing blocks in the terrain
                if (teren[i] && teren[i][j] !== 0) {
                    ctx.fillStyle = boje[teren[i][j]];
                    ctx.fillRect(j * sirinaCelije + 0.5, i * visinaCelije + 0.5, sirinaCelije - 1, visinaCelije - 1);
                }
            }
        }
    }

});


/////////////////////////////////////////////////////////////////////////////////

//      tetris-rezultati     //

$(document).ready(function() {
    //uzimanje podataka
    let ime = localStorage.getItem('ime');
    let poeni = parseInt(localStorage.getItem('poeni'));
    let krajnjaTezina = parseFloat(localStorage.getItem('krajnjaTezina'));
    let brojKoriscenihOblika = parseInt(localStorage.getItem('brojKoriscenihOblika'));

    //slanje podataka u polja
    $('#ime_rezultat').text(ime);
    $('#rezultat_rezultat').text(poeni);
    $('#nivo_rezultat').text(Math.floor(krajnjaTezina));
    $('#podnivo_rezultat').text(Math.round((krajnjaTezina - Math.floor(krajnjaTezina)) * 10));
    $('#oblici_rezultat').text(brojKoriscenihOblika === 7 ? 'da' : 'ne');

    //uzimanje podataka o  sacuvanim igracima iz local storage
    let sacuvaniIgraci = JSON.parse(localStorage.getItem('igraci'));

    //niz pocetnih igraca ako u local storagu nisam imao igrace
    let igraci = sacuvaniIgraci ? sacuvaniIgraci : [
        { ime: "Pocetni_Igrac_1", poeni: 2, tezina: 2, oblici: "Da" },
        { ime: "Pocetni_Igrac_2", poeni: 1, tezina: 3, oblici: "Da" },
        { ime: "Pocetni_Igrac_3", poeni: 1, tezina: 2, oblici: "Ne" },
        { ime: "Pocetni_Igrac_4", poeni: 0, tezina: 2, oblici: "Ne" },
        { ime: "Pocetni_Igrac_5", poeni: 0, tezina: 1, oblici: "Da" }
    ];

    //novi igrac
    let noviIgrac = {
        ime: ime,
        poeni: poeni,
        tezina: Math.floor(krajnjaTezina),
        oblici: brojKoriscenihOblika === 7 ? 'Da' : 'Ne'
    };

    //provera da li vec postoji igrac sa tim imenom
    let postoji = -1;
    for (let i = 0; i < igraci.length; i++) {
        if (igraci[i].ime === noviIgrac.ime) {
            postoji = i;
            break;
        }
    }
    //ako ne postoji dodaj igraca ako postoji samo mu updejtuj skor
    if (postoji === -1) {
        igraci.push(noviIgrac);
    }
    else{
        igraci[postoji].poeni = poeni;
        igraci[postoji].tezina = Math.floor(krajnjaTezina);
        igraci[postoji].oblici = brojKoriscenihOblika === 7 ? 'Da' : 'Ne';
    }

    //sortiranje igraca po poenima a ako su im isti poeni po tezini
    igraci.sort((a, b) => {
        if (b.poeni === a.poeni) {
            return b.tezina - a.tezina;
        }
        return b.poeni - a.poeni;
    });

    //samo 5 najboljih igraca ostaje
    if (igraci.length > 5) {
        igraci.pop();
    }

    //azuriranje tabbele
    for (let i = 0; i < igraci.length; i++) {
        $(`#ime`+i).text(igraci[i].ime);
        $(`#poeni`+i).text(igraci[i].poeni);
        $(`#tezina`+i).text(igraci[i].tezina);
        $(`#oblici`+i).text(igraci[i].oblici);
    }

    //sacuvaj rezultate
    localStorage.setItem('igraci', JSON.stringify(igraci));

    //resetuj skorove dugme
    $('#dugme_resetuj_rezultate').click(function() {
        if (confirm("Da li ste sigurni da zelite da resetujete sve rezultate?")) {
            localStorage.clear();
            location.reload();
        }
    });

});
