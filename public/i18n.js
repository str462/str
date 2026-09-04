/* PriceCheckr i18n: one locale system for the existing static frontend. */
(function () {
  const LOCALES = ['en','de','fr','es','it','nl','pl'];
  const META = {
    en:{name:'English',flag:'🇬🇧',html:'en',intl:'en-US'},
    de:{name:'Deutsch',flag:'🇩🇪',html:'de',intl:'de-DE'},
    fr:{name:'Français',flag:'🇫🇷',html:'fr',intl:'fr-FR'},
    es:{name:'Español',flag:'🇪🇸',html:'es',intl:'es-ES'},
    it:{name:'Italiano',flag:'🇮🇹',html:'it',intl:'it-IT'},
    nl:{name:'Nederlands',flag:'🇳🇱',html:'nl',intl:'nl-NL'},
    pl:{name:'Polski',flag:'🇵🇱',html:'pl',intl:'pl-PL'}
  };
  const B = (en,de,fr,es,it,nl,pl) => ({en,de,fr,es,it,nl,pl});
  const T = {
    'FASTEST WAY':B('FASTEST WAY','SCHNELLSTER WEG','LE PLUS RAPIDE','LA FORMA MÁS RÁPIDA','IL MODO PIÙ RAPIDO','SNELSTE MANIER','NAJSZYBSZY SPOSÓB'),
    'Paste a product link':B('Paste a product link','Produktlink einfügen','Collez un lien produit','Pega un enlace de producto','Incolla un link prodotto','Plak een productlink','Wklej link do produktu'),
    'amazon.com/...':B('amazon.com/...','amazon.de/...','amazon.fr/...','amazon.es/...','amazon.it/...','amazon.nl/...','amazon.pl/...'),
    'Works with Amazon, eBay, Walmart and other stores.':B('Works with Amazon, eBay, Walmart and other stores.','Funktioniert mit Amazon, eBay, Walmart und anderen Shops.','Compatible avec Amazon, eBay, Walmart et d’autres boutiques.','Funciona con Amazon, eBay, Walmart y otras tiendas.','Funziona con Amazon, eBay, Walmart e altri negozi.','Werkt met Amazon, eBay, Walmart en andere winkels.','Działa z Amazon, eBay, Walmart i innymi sklepami.'),
    'Try an example':B('Try an example','Beispiel testen','Voir un exemple','Probar un ejemplo','Prova un esempio','Probeer een voorbeeld','Wypróbuj przykład'),
    'Other ways to check':B('Other ways to check','Weitere Prüfmethoden','Autres façons de vérifier','Otras formas de comprobar','Altri modi per controllare','Andere manieren om te controleren','Inne sposoby sprawdzenia'),
    'Results in seconds':B('Results in seconds','Ergebnisse in Sekunden','Résultats en quelques secondes','Resultados en segundos','Risultati in pochi secondi','Resultaten in enkele seconden','Wynik w kilka sekund'),
    'LIVE EXAMPLE':B('LIVE EXAMPLE','LIVE-BEISPIEL','EXEMPLE EN DIRECT','EJEMPLO EN VIVO','ESEMPIO LIVE','LIVE VOORBEELD','PRZYKŁAD NA ŻYWO'),
    'See what a result looks like':B('See what a result looks like','So sieht ein Ergebnis aus','Voir à quoi ressemble un résultat','Mira cómo es un resultado','Guarda un esempio di risultato','Bekijk hoe een resultaat eruitziet','Zobacz, jak wygląda wynik'),
    'No API call. No signup. Just a sample.':B('No API call. No signup. Just a sample.','Kein API-Aufruf. Keine Registrierung. Nur ein Beispiel.','Aucun appel API. Aucune inscription. Juste un exemple.','Sin llamada API. Sin registro. Solo un ejemplo.','Nessuna chiamata API. Nessuna registrazione. Solo un esempio.','Geen API-aanroep. Geen registratie. Alleen een voorbeeld.','Bez wywołania API. Bez rejestracji. Tylko przykład.'),
    'See example →':B('See example →','Beispiel ansehen →','Voir l’exemple →','Ver ejemplo →','Vedi esempio →','Bekijk voorbeeld →','Zobacz przykład →'),
    'SAMPLE RESULT':B('SAMPLE RESULT','BEISPIELERGEBNIS','RÉSULTAT EXEMPLE','RESULTADO DE EJEMPLO','RISULTATO DI ESEMPIO','VOORBEELDRESULTAAT','PRZYKŁADOWY WYNIK'),
    'Example Amazon listing':B('Example Amazon listing','Beispielangebot von Amazon','Annonce Amazon d’exemple','Ejemplo de anuncio de Amazon','Esempio di offerta Amazon','Voorbeeldlisting van Amazon','Przykładowa oferta Amazon'),
    'DEAL SCORE':B('DEAL SCORE','DEAL-SCORE','SCORE DE L’OFFRE','PUNTUACIÓN DE LA OFERTA','PUNTEGGIO DELL’OFFERTA','DEAL-SCORE','OCENA OFERTY'),
    'STRONG DEAL':B('STRONG DEAL','STARKES ANGEBOT','BONNE OFFRE','BUENA OFERTA','BUONA OFFERTA','STERKE DEAL','DOBRA OFERTA'),
    'Good value at this price':B('Good value at this price','Gutes Preis-Leistungs-Verhältnis','Bon rapport qualité-prix à ce tarif','Buena relación calidad-precio a este precio','Buon rapporto qualità-prezzo a questo prezzo','Goede prijs-kwaliteit voor deze prijs','Dobry stosunek jakości do ceny'),
    'CURRENT PRICE':B('CURRENT PRICE','AKTUELLER PREIS','PRIX ACTUEL','PRECIO ACTUAL','PREZZO ATTUALE','HUIDIGE PRIJS','AKTUALNA CENA'),
    'FAIR RANGE':B('FAIR RANGE','FAIRER BEREICH','FOURCHETTE ÉQUITABLE','RANGO JUSTO','FASCIA EQUA','EERLIJKE RANGE','UCZCIWY ZAKRES'),
    'CONFIDENCE':B('CONFIDENCE','SICHERHEIT','CONFIANCE','CONFIANZA','FIDUCIA','VERTROUWEN','PEWNOŚĆ'),
    'High':B('High','Hoch','Élevée','Alta','Alta','Hoog','Wysoka'),
    'Price position, buying risks and better offers are shown in the full report.':B('Price position, buying risks and better offers are shown in the full report.','Preisposition, Kaufrisiken und bessere Angebote findest du im vollständigen Bericht.','La position du prix, les risques d’achat et les meilleures offres sont présentés dans le rapport complet.','La posición del precio, los riesgos de compra y las mejores ofertas aparecen en el informe completo.','La posizione del prezzo, i rischi d’acquisto e le offerte migliori sono mostrati nel report completo.','De prijspositie, aankooprisico’s en betere aanbiedingen staan in het volledige rapport.','Pozycja cenowa, ryzyka zakupu i lepsze oferty są pokazane w pełnym raporcie.'),
    'Check your product free →':B('Check your product free →','Prüfe dein Produkt kostenlos →','Vérifiez votre produit gratuitement →','Comprueba tu producto gratis →','Controlla gratis il tuo prodotto →','Controleer je product gratis →','Sprawdź produkt za darmo →'),
    'Example data shown for illustration only.':B('Example data shown for illustration only.','Beispieldaten dienen nur zur Veranschaulichung.','Données d’exemple à titre illustratif uniquement.','Datos de ejemplo solo para ilustración.','Dati di esempio solo a scopo illustrativo.','Voorbeeldgegevens zijn alleen ter illustratie.','Dane przykładowe wyłącznie ilustracyjne.'),
    'We use optional analytics to understand which parts of the site help visitors.':B('We use optional analytics to understand which parts of the site help visitors.','Wir verwenden optionale Analysen, um zu verstehen, welche Teile der Website Besuchern helfen.','Nous utilisons des analyses facultatives pour comprendre quelles parties du site aident les visiteurs.','Usamos analíticas opcionales para entender qué partes del sitio ayudan a los visitantes.','Usiamo analisi facoltative per capire quali parti del sito aiutano i visitatori.','We gebruiken optionele analytics om te begrijpen welke delen van de site bezoekers helpen.','Używamy opcjonalnych danych analitycznych, aby zrozumieć, które części strony pomagają odwiedzającym.'),
    'Allow analytics':B('Allow analytics','Analysen erlauben','Autoriser les analyses','Permitir analíticas','Consenti analisi','Analytics toestaan','Zezwól na analitykę'),
    'Not now':B('Not now','Nicht jetzt','Pas maintenant','Ahora no','Non ora','Niet nu','Nie teraz'),
    'Check a product':B('Check a product','Produkt prüfen','Vérifier un produit','Comprobar un producto','Controlla un prodotto','Product controleren','Sprawdź produkt'),
    'Dashboard':B('Dashboard','Übersicht','Tableau de bord','Panel','Dashboard','Dashboard','Panel'),
    'My Checks':B('My Checks','Meine Prüfungen','Mes analyses','Mis análisis','Le mie analisi','Mijn controles','Moje analizy'),
    'Wishlist':B('Wishlist','Wunschliste','Liste de souhaits','Lista de deseos','Lista desideri','Verlanglijst','Lista życzeń'),
    'Price Alerts':B('Price Alerts','Preisalarm','Alertes de prix','Alertas de precios','Avvisi prezzo','Prijsalerts','Alerty cenowe'),
    'Account':B('Account','Konto','Compte','Cuenta','Account','Account','Konto'),
    'Open navigation':B('Open navigation','Navigation öffnen','Ouvrir la navigation','Abrir navegación','Apri navigazione','Navigatie openen','Otwórz nawigację'),
    'Close navigation':B('Close navigation','Navigation schließen','Fermer la navigation','Cerrar navegación','Chiudi navigazione','Navigatie sluiten','Zamknij nawigację'),
    'AI SHOPPING DECISION ASSISTANT':B('AI SHOPPING DECISION ASSISTANT','KI-KAUFENTSCHEIDUNGSASSISTENT','ASSISTANT IA POUR VOS ACHATS','ASISTENTE IA PARA DECISIONES DE COMPRA','ASSISTENTE IA PER GLI ACQUISTI','AI-AANKOOPASSISTENT','ASYSTENT AI DO DECYZJI ZAKUPOWYCH'),
    'Are you overpaying?':B('Are you overpaying?','Zahlen Sie zu viel?','Payez-vous trop cher ?','¿Estás pagando de más?','Stai pagando troppo?','Betaal je te veel?','Czy przepłacasz?'),
    'Before you spend, know the price, the real value, the best place to buy and the smarter alternatives. One free check. One simple buying decision.':B('Before you spend, know the price, the real value, the best place to buy and the smarter alternatives. One free check. One simple buying decision.','Bevor du kaufst: Kenne den Preis, den echten Wert, den besten Kaufort und bessere Alternativen. Eine kostenlose Prüfung. Eine einfache Kaufentscheidung.','Avant de dépenser, découvrez le prix, la vraie valeur, le meilleur endroit pour acheter et les alternatives plus pertinentes. Une vérification gratuite. Une décision d’achat simple.','Antes de gastar, conoce el precio, el valor real, el mejor lugar para comprar y alternativas más inteligentes. Una comprobación gratis. Una decisión de compra sencilla.','Prima di spendere, scopri il prezzo, il valore reale, dove conviene acquistare e le alternative migliori. Un controllo gratuito. Una decisione semplice.','Weet wat je betaalt, wat het product echt waard is, waar je het beste kunt kopen en welke alternatieven slimmer zijn. Eén gratis controle. Eén eenvoudige aankoopbeslissing.','Zanim wydasz pieniądze, poznaj cenę, rzeczywistą wartość, najlepsze miejsce zakupu i lepsze alternatywy. Jedno bezpłatne sprawdzenie. Jedna prosta decyzja zakupowa.'),
    '✦ Fresh market evidence':B('✦ Fresh market evidence','✦ Aktuelle Marktdaten','✦ Données de marché récentes','✦ Datos de mercado actualizados','✦ Dati di mercato aggiornati','✦ Actuele marktgegevens','✦ Aktualne dane rynkowe'),
    '✓ Simple BUY / WAIT / COMPARE verdict':B('✓ Simple BUY / WAIT / COMPARE verdict','✓ Klare KAUFEN / WARTEN / VERGLEICHEN-Empfehlung','✓ Verdict simple ACHETER / ATTENDRE / COMPARER','✓ Veredicto simple COMPRAR / ESPERAR / COMPARAR','✓ Verdetto semplice ACQUISTA / ATTENDI / CONFRONTA','✓ Duidelijk KOOP / WACHT / VERGELIJK-oordeel','✓ Prosty werdykt KUP / CZEKAJ / PORÓWNAJ'),
    '⌁ Real product offers when available':B('⌁ Real product offers when available','⌁ Echte Angebote, wenn verfügbar','⌁ Offres réelles lorsqu’elles sont disponibles','⌁ Ofertas reales cuando están disponibles','⌁ Offerte reali quando disponibili','⌁ Echte productaanbiedingen indien beschikbaar','⌁ Rzeczywiste oferty, gdy są dostępne'),
    'Product link':B('Product link','Produktlink','Lien du produit','Enlace del producto','Link del prodotto','Productlink','Link do produktu'),
    'Screenshot':B('Screenshot','Screenshot','Capture d’écran','Captura de pantalla','Screenshot','Schermafbeelding','Zrzut ekranu'),
    'Product URL':B('Product URL','Produkt-URL','URL du produit','URL del producto','URL del prodotto','Product-URL','URL produktu'),
    'Product screenshot':B('Product screenshot','Produktscreenshot','Capture du produit','Captura del producto','Screenshot del prodotto','Productscreenshot','Zrzut ekranu produktu'),
    'Choose a photo or take a picture':B('Choose a photo or take a picture','Foto auswählen oder aufnehmen','Choisir une photo ou prendre une photo','Elige una foto o haz una foto','Scegli una foto o scatta una foto','Kies een foto of maak een foto','Wybierz zdjęcie lub zrób zdjęcie'),
    "Can't use a product link?":B("Can't use a product link?","Produktlink nicht verfügbar?","Vous ne pouvez pas utiliser de lien produit ?","¿No puedes usar un enlace de producto?","Non puoi usare un link prodotto?","Kun je geen productlink gebruiken?","Nie możesz użyć linku do produktu?"),
    'Optional fallback':B('Optional fallback','Optionale Alternative','Solution de secours facultative','Alternativa opcional','Alternativa opzionale','Optionele fallback','Opcjonalna alternatywa'),
    'Product name, model or SKU':B('Product name, model or SKU','Produktname, Modell oder SKU','Nom, modèle ou SKU du produit','Nombre, modelo o SKU del producto','Nome, modello o SKU del prodotto','Productnaam, model of SKU','Nazwa produktu, model lub SKU'),
    'Current price':B('Current price','Aktueller Preis','Prix actuel','Precio actual','Prezzo attuale','Huidige prijs','Aktualna cena'),
    'Your market':B('Your market','Dein Markt','Votre marché','Tu mercado','Il tuo mercato','Jouw markt','Twój rynek'),
    '· detected automatically':B('· detected automatically','· automatisch erkannt','· détecté automatiquement','· detectado automáticamente','· rilevato automaticamente','· automatisch gedetecteerd','· wykryto automatycznie'),
    'Check this product':B('Check this product','Produkt prüfen','Vérifier ce produit','Comprobar este producto','Controlla questo prodotto','Dit product controleren','Sprawdź ten produkt'),
    'Free first check':B('Free first check','Erste Prüfung kostenlos','Première vérification gratuite','Primera comprobación gratis','Prima analisi gratuita','Eerste controle gratis','Pierwsze sprawdzenie bezpłatne'),
    'No credit card required':B('No credit card required','Keine Kreditkarte erforderlich','Aucune carte bancaire requise','No se requiere tarjeta','Nessuna carta richiesta','Geen creditcard nodig','Karta kredytowa nie jest wymagana'),
    'Cancel anytime':B('Cancel anytime','Jederzeit kündbar','Annulation à tout moment','Cancela cuando quieras','Annulla in qualsiasi momento','Op elk moment opzegbaar','Anuluj w dowolnym momencie'),
    'THE DEALCHECK DIFFERENCE':B('THE DEALCHECK DIFFERENCE','DER DEALCHECK-UNTERSCHIED','LA DIFFÉRENCE DEALCHECK','LA DIFERENCIA DE DEALCHECK','LA DIFFERENZA DEALCHECK','HET DEALCHECK-VERSCHIL','RÓŻNICA DEALCHECK'),
    "Don't just find a price.":B("Don't just find a price.",'Finde nicht nur einen Preis.','Ne cherchez pas seulement un prix.','No busques solo un precio.','Non cercare solo un prezzo.','Vind niet alleen een prijs.','Nie szukaj tylko ceny.'),
    'Find the better decision.':B('Find the better decision.','Finde die bessere Entscheidung.','Trouvez la meilleure décision.','Encuentra la mejor decisión.','Trova la scelta migliore.','Vind de betere beslissing.','Znajdź lepszą decyzję.'),
    'We turn a product listing into a simple shopping decision — then show the evidence, offers and alternatives behind it.':B('We turn a product listing into a simple shopping decision — then show the evidence, offers and alternatives behind it.','Wir machen aus einem Produktangebot eine klare Kaufentscheidung und zeigen die dahinterliegenden Daten, Angebote und Alternativen.','Nous transformons une fiche produit en décision d’achat simple, avec les preuves, offres et alternatives qui la soutiennent.','Convertimos una oferta de producto en una decisión de compra sencilla y mostramos las pruebas, ofertas y alternativas que hay detrás.','Trasformiamo una scheda prodotto in una decisione d’acquisto semplice, mostrando prove, offerte e alternative.','We maken van een productvermelding een eenvoudige aankoopbeslissing en tonen de onderliggende gegevens, aanbiedingen en alternatieven.','Zamieniamy ofertę produktu w prostą decyzję zakupową, pokazując dane, oferty i alternatywy stojące za oceną.'),
    'Is this price fair?':B('Is this price fair?','Ist dieser Preis fair?','Ce prix est-il juste ?','¿Es justo este precio?','Questo prezzo è corretto?','Is deze prijs eerlijk?','Czy ta cena jest uczciwa?'),
    'Where is the stronger offer?':B('Where is the stronger offer?','Wo gibt es das bessere Angebot?','Où trouver la meilleure offre ?','¿Dónde está la mejor oferta?','Dove si trova l’offerta migliore?','Waar is de sterkere aanbieding?','Gdzie jest lepsza oferta?'),
    'Is there a better option?':B('Is there a better option?','Gibt es eine bessere Option?','Existe-t-il une meilleure option ?','¿Hay una opción mejor?','C’è un’opzione migliore?','Is er een betere optie?','Czy jest lepsza opcja?'),
    'PRICE':B('PRICE','PREIS','PRIX','PRECIO','PREZZO','PRIJS','CENA'),
    'VALUE':B('VALUE','WERT','VALEUR','VALOR','VALORE','WAARDE','WARTOŚĆ'),
    'RISKS':B('RISKS','RISIKEN','RISQUES','RIESGOS','RISCHI','RISICO’S','RYZYKO'),
    'WHERE TO BUY':B('WHERE TO BUY','WO KAUFEN','OÙ ACHETER','DÓNDE COMPRAR','DOVE ACQUISTARE','WAAR KOPEN','GDZIE KUPIĆ'),
    'Are you paying more than you should?':B('Are you paying more than you should?','Zahlen Sie mehr als nötig?','Payez-vous plus que nécessaire ?','¿Estás pagando más de lo necesario?','Stai pagando più del necessario?','Betaal je meer dan nodig?','Czy płacisz więcej, niż trzeba?'),
    'Is the product worth its current price?':B('Is the product worth its current price?','Ist das Produkt seinen aktuellen Preis wert?','Le produit vaut-il son prix actuel ?','¿Vale el producto su precio actual?','Il prodotto vale il prezzo attuale?','Is het product de huidige prijs waard?','Czy produkt jest wart swojej obecnej ceny?'),
    'What should you know before buying?':B('What should you know before buying?','Was solltest du vor dem Kauf wissen?','Que faut-il savoir avant d’acheter ?','¿Qué debes saber antes de comprar?','Cosa dovresti sapere prima di acquistare?','Wat moet je weten voordat je koopt?','Co warto wiedzieć przed zakupem?'),
    'Which verified offer looks strongest?':B('Which verified offer looks strongest?','Welches verifizierte Angebot ist am besten?','Quelle offre vérifiée semble la meilleure ?','¿Qué oferta verificada parece mejor?','Quale offerta verificata sembra migliore?','Welke geverifieerde aanbieding is het sterkst?','Która zweryfikowana oferta wygląda najlepiej?'),
    'YOUR FREE CHECK':B('YOUR FREE CHECK','DEINE KOSTENLOSE PRÜFUNG','VOTRE VÉRIFICATION GRATUITE','TU COMPROBACIÓN GRATUITA','LA TUA ANALISI GRATUITA','JE GRATIS CONTROLE','TWOJE BEZPŁATNE SPRAWDZENIE'),
    'INITIAL PRICE SIGNAL':B('INITIAL PRICE SIGNAL','ERSTES PREISSIGNAL','PREMIER SIGNAL DE PRIX','SEÑAL INICIAL DE PRECIO','SEGNALE INIZIALE DI PREZZO','EERSTE PRIJSSIGNAAL','WSTĘPNY SYGNAŁ CENOWY'),
    'PRICE DESERVES A SECOND LOOK':B('PRICE DESERVES A SECOND LOOK','PREIS SOLLTE NOCHMALS GEPRÜFT WERDEN','LE PRIX MÉRITE UN SECOND EXAMEN','EL PRECIO MERECE UNA SEGUNDA MIRADA','IL PREZZO MERITA UN SECONDO CONTROLLO','DE PRIJS VERDIENT EEN TWEEDE KIJK','CENA WYMAGA PONOWNEGO SPRAWDZENIA'),
    'POTENTIAL OVERPAYMENT':B('POTENTIAL OVERPAYMENT','MÖGLICHE ÜBERZAHLUNG','SURPAIEMENT POSSIBLE','POSIBLE SOBREPRECIO','POSSIBILE SOVRAPPREZZO','MOGELIJKE OVERBETALING','MOŻLIWA NADPŁATA'),
    'INITIAL SIGNAL':B('INITIAL SIGNAL','ERSTES SIGNAL','SIGNAL INITIAL','SEÑAL INICIAL','SEGNALE INIZIALE','EERSTE SIGNAAL','WSTĘPNY SYGNAŁ'),
    'What looks good':B('What looks good','Was gut aussieht','Ce qui semble positif','Lo que parece bueno','Cosa sembra positivo','Wat er goed uitziet','Co wygląda dobrze'),
    'What to consider':B('What to consider','Was zu beachten ist','Points à considérer','Qué tener en cuenta','Cosa considerare','Waar je op moet letten','Na co zwrócić uwagę'),
    'No strong positive signal was verified yet.':B('No strong positive signal was verified yet.','Noch kein starkes positives Signal verifiziert.','Aucun signal positif fort n’a encore été vérifié.','Todavía no se ha verificado una señal positiva clara.','Non è ancora stato verificato un segnale positivo forte.','Er is nog geen sterk positief signaal geverifieerd.','Nie zweryfikowano jeszcze wyraźnego pozytywnego sygnału.'),
    'No major concern was verified yet.':B('No major concern was verified yet.','Noch kein wesentlicher Kritikpunkt verifiziert.','Aucun problème majeur n’a encore été vérifié.','Todavía no se ha verificado ningún problema importante.','Non è ancora emersa una criticità importante verificata.','Er is nog geen belangrijk aandachtspunt geverifieerd.','Nie zweryfikowano jeszcze istotnego problemu.'),
    'PREMIUM REVEALS THE PURCHASE':B('PREMIUM REVEALS THE PURCHASE','PREMIUM ZEIGT DIE KAUFENTSCHEIDUNG','PREMIUM RÉVÈLE LA DÉCISION D’ACHAT','PREMIUM REVELA LA DECISIÓN DE COMPRA','PREMIUM MOSTRA LA DECISIONE D’ACQUISTO','PREMIUM TOONT DE AANKOOPBESLISSING','PREMIUM POKAZUJE DECYZJĘ ZAKUPOWĄ'),
    'We found more. You decide.':B('We found more. You decide.','Wir haben mehr gefunden. Du entscheidest.','Nous avons trouvé davantage. À vous de décider.','Hemos encontrado más. Tú decides.','Abbiamo trovato di più. Decidi tu.','We hebben meer gevonden. Jij beslist.','Znaleźliśmy więcej. Ty decydujesz.'),
    'Best place to buy':B('Best place to buy','Bester Kaufort','Meilleur endroit pour acheter','Mejor lugar para comprar','Dove conviene acquistare','Beste plek om te kopen','Najlepsze miejsce zakupu'),
    'Better alternatives':B('Better alternatives','Bessere Alternativen','Meilleures alternatives','Mejores alternativas','Alternative migliori','Betere alternatieven','Lepsze alternatywy'),
    'Buying risks':B('Buying risks','Kaufrisiken','Risques liés à l’achat','Riesgos de compra','Rischi d’acquisto','Aankooprisico’s','Ryzyko zakupu'),
    'Your target price':B('Your target price','Dein Zielpreis','Votre prix cible','Tu precio objetivo','Il tuo prezzo obiettivo','Jouw richtprijs','Twoja cena docelowa'),
    'One simple upgrade':B('ONE SIMPLE UPGRADE','EINFACHES UPGRADE','UNE SEULE AMÉLIORATION','UNA MEJORA SENCILLA','UN SEMPLICE UPGRADE','ÉÉNVOUDIGE UPGRADE','PROSTE ULEPSZENIE'),
    'Know the better option before you pay.':B('Know the better option before you pay.','Kenne die bessere Option, bevor du bezahlst.','Découvrez la meilleure option avant de payer.','Conoce la mejor opción antes de pagar.','Conosci l’opzione migliore prima di pagare.','Ken de betere optie voordat je betaalt.','Poznaj lepszą opcję, zanim zapłacisz.'),
    'Unlock Premium':B('Unlock Premium','Premium freischalten','Débloquer Premium','Desbloquear Premium','Sblocca Premium','Premium ontgrendelen','Odblokuj Premium'),
    'YOUR PRICE':B('YOUR PRICE','DEIN PREIS','VOTRE PRIX','TU PRECIO','IL TUO PREZZO','JOUW PRIJS','TWOJA CENA'),
    'FAIR PRICE':B('FAIR PRICE','FAIRER PREIS','PRIX ÉQUITABLE','PRECIO JUSTO','PREZZO EQUO','EERLIJKE PRIJS','UCZCIWA CENA'),
    'SMART TARGET':B('SMART TARGET','SMARTE ZIELPREIS','PRIX CIBLE INTELLIGENT','OBJETIVO INTELIGENTE','TARGET INTELLIGENTE','SLIM DOEL','INTELIGENTNY CEL'),
    'VALUE':B('VALUE','WERT','VALEUR','VALOR','VALORE','WAARDE','WARTOŚĆ'),
    'CONFIDENCE':B('CONFIDENCE','SICHERHEIT','CONFIANCE','CONFIANZA','FIDUCIA','VERTROUWEN','PEWNOŚĆ'),
    'Estimated':B('Estimated','Geschätzt','Estimé','Estimado','Stimato','Geschat','Szacunkowo'),
    'Evidence-based':B('Evidence-based','Datenbasiert','Fondé sur les données','Basado en datos','Basato sui dati','Op basis van gegevens','Na podstawie danych'),
    'Limited':B('Limited','Begrenzt','Limitée','Limitada','Limitata','Beperkt','Ograniczona'),
    '01 · BEST CURRENT OFFER':B('01 · BEST CURRENT OFFER','01 · BESTES AKTUELLES ANGEBOT','01 · MEILLEURE OFFRE ACTUELLE','01 · MEJOR OFERTA ACTUAL','01 · MIGLIORE OFFERTA ATTUALE','01 · BESTE HUIDIGE AANBIEDING','01 · NAJLEPSZA AKTUALNA OFERTA'),
    '✓ EVIDENCE MATCH':B('✓ EVIDENCE MATCH','✓ DATENABGLEICH','✓ CORRESPONDANCE DES DONNÉES','✓ COINCIDENCIA DE EVIDENCIA','✓ CORRISPONDENZA DELLE PROVE','✓ BEWIJSOVEREENKOMST','✓ ZGODNOŚĆ Z DANYMI'),
    'Go to this offer ↗':B('Go to this offer ↗','Zu diesem Angebot ↗','Voir cette offre ↗','Ver esta oferta ↗','Vai a questa offerta ↗','Naar deze aanbieding ↗','Przejdź do oferty ↗'),
    '02 · PRICE POSITION':B('02 · PRICE POSITION','02 · PREISPOSITION','02 · POSITION DU PRIX','02 · POSICIÓN DEL PRECIO','02 · POSIZIONE DEL PREZZO','02 · PRIJSKARAKTER','02 · POZYCJA CENOWA'),
    'Below market':B('Below market','Unter Marktpreis','Sous le marché','Por debajo del mercado','Sotto il mercato','Onder de markt','Poniżej rynku'),
    'Above market':B('Above market','Über Marktpreis','Au-dessus du marché','Por encima del mercado','Sopra il mercato','Boven de markt','Powyżej rynku'),
    '03 · WHY THIS SCORE':B('03 · WHY THIS SCORE','03 · WARUM DIESE BEWERTUNG','03 · POURQUOI CETTE NOTE','03 · POR QUÉ ESTA PUNTUACIÓN','03 · PERCHÉ QUESTO PUNTEGGIO','03 · WAAROM DEZE SCORE','03 · DLACZEGO TAKA OCENA'),
    '04 · YOUR SIMPLE BUYING PATH':B('04 · YOUR SIMPLE BUYING PATH','04 · DEIN EINFACHER KAUFPFAD','04 · VOTRE PARCOURS D’ACHAT SIMPLE','04 · TU CAMINO DE COMPRA','04 · IL TUO PERCORSO D’ACQUISTO','04 · JOUW EENVOUDIGE AANKOOPPAD','04 · TWOJA PROSTA ŚCIEŻKA ZAKUPOWA'),
    'Know your price':B('Know your price','Kenne deinen Preis','Connaissez votre prix','Conoce tu precio','Conosci il tuo prezzo','Ken je prijs','Poznaj swoją cenę'),
    'See the better offer':B('See the better offer','Sieh das bessere Angebot','Voir la meilleure offre','Mira la mejor oferta','Vedi l’offerta migliore','Bekijk de betere aanbieding','Zobacz lepszą ofertę'),
    'Compare alternatives':B('Compare alternatives','Alternativen vergleichen','Comparer les alternatives','Compara alternativas','Confronta le alternative','Vergelijk alternatieven','Porównaj alternatywy'),
    'Buy with confidence':B('Buy with confidence','Sicher kaufen','Acheter en confiance','Compra con confianza','Acquista con fiducia','Koop met vertrouwen','Kupuj ze spokojem'),
    '05 · BETTER OPTIONS':B('05 · BETTER OPTIONS','05 · BESSERE OPTIONEN','05 · MEILLEURES OPTIONS','05 · MEJORES OPCIONES','05 · OPZIONI MIGLIORI','05 · BETERE OPTIES','05 · LEPSZE OPCJE'),
    'WHAT WE LIKE':B('WHAT WE LIKE','WAS UNS GEFÄLLT','CE QUE NOUS AIMONS','LO QUE NOS GUSTA','COSA CI PIACE','WAT WE GOED VINDEN','CO NAM SIĘ PODOBA'),
    'WHAT TO CONSIDER':B('WHAT TO CONSIDER','WAS ZU BEACHTEN IST','À PRENDRE EN COMPTE','QUÉ TENER EN CUENTA','COSA CONSIDERARE','WAAR JE OP MOET LETTEN','NA CO ZWRÓCIĆ UWAGĘ'),
    'BEFORE YOU BUY':B('BEFORE YOU BUY','VOR DEM KAUF','AVANT D’ACHETER','ANTES DE COMPRAR','PRIMA DI ACQUISTARE','VOORDAT JE KOOPT','PRZED ZAKUPEM'),
    '06 · PRICE EVIDENCE':B('06 · PRICE EVIDENCE','06 · PREISNACHWEISE','06 · PREUVES DE PRIX','06 · EVIDENCIA DE PRECIOS','06 · PROVE DI PREZZO','06 · PRIJSBEWIJS','06 · DANE CENOWE'),
    'Save the decision':B('SAVE THE DECISION','KAUFENTSCHEIDUNG SPEICHERN','ENREGISTRER LA DÉCISION','GUARDAR LA DECISIÓN','SALVA LA DECISIONE','BESLISSING OPSLAAN','ZAPISZ DECYZJĘ'),
    "Don't lose this deal.":B("Don't lose this deal.",'Verpasse dieses Angebot nicht.','Ne laissez pas passer cette offre.','No pierdas esta oferta.','Non lasciarti sfuggire questa offerta.','Mis deze deal niet.','Nie przegap tej okazji.'),
    'Save product':B('Save product','Produkt speichern','Enregistrer le produit','Guardar producto','Salva prodotto','Product opslaan','Zapisz produkt'),
    'Set target':B('Set target','Zielpreis setzen','Définir le prix cible','Fijar objetivo','Imposta obiettivo','Doel instellen','Ustaw cel'),
    'Target price':B('Target price','Zielpreis','Prix cible','Precio objetivo','Prezzo obiettivo','Doelprijs','Cena docelowa'),
    'YOUR DASHBOARD':B('YOUR DASHBOARD','DEINE ÜBERSICHT','VOTRE TABLEAU DE BORD','TU PANEL','LA TUA DASHBOARD','JOUW DASHBOARD','TWÓJ PANEL'),
    'Stay ahead of your next purchase.':B('Stay ahead of your next purchase.','Sei deiner nächsten Kaufentscheidung voraus.','Gardez une longueur d’avance sur votre prochain achat.','Anticípate a tu próxima compra.','Anticipa il tuo prossimo acquisto.','Blijf je volgende aankoop voor.','Bądź o krok przed kolejnym zakupem.'),
    'Everything you save in DEALCHECK lives here on this device.':B('Everything you save in DEALCHECK lives here on this device.','Alles, was du in DEALCHECK speicherst, bleibt auf diesem Gerät.','Tout ce que vous enregistrez dans DEALCHECK reste sur cet appareil.','Todo lo que guardas en DEALCHECK permanece en este dispositivo.','Tutto ciò che salvi in DEALCHECK resta su questo dispositivo.','Alles wat je in DEALCHECK opslaat, blijft op dit apparaat.','Wszystko, co zapiszesz w DEALCHECK, pozostaje na tym urządzeniu.'),
    'Total checks':B('Total checks','Prüfungen insgesamt','Vérifications totales','Comprobaciones totales','Analisi totali','Totaal aantal controles','Łączna liczba sprawdzeń'),
    'Analyses saved':B('Analyses saved','Gespeicherte Analysen','Analyses enregistrées','Análisis guardados','Analisi salvate','Opgeslagen analyses','Zapisane analizy'),
    'Saved products':B('Saved products','Gespeicherte Produkte','Produits enregistrés','Productos guardados','Prodotti salvati','Opgeslagen producten','Zapisane produkty'),
    'Active targets':B('Active targets','Aktive Zielpreise','Prix cibles actifs','Objetivos activos','Target attivi','Actieve doelen','Aktywne cele'),
    'Price targets':B('Price targets','Zielpreise','Prix cibles','Precios objetivo','Prezzi obiettivo','Doelprijzen','Ceny docelowe'),
    'Potential savings':B('Potential savings','Mögliche Ersparnis','Économies potentielles','Ahorro potencial','Risparmio potenziale','Mogelijke besparing','Potencjalna oszczędność'),
    'Estimated only':B('Estimated only','Nur geschätzt','Estimation uniquement','Solo estimación','Solo stima','Alleen schatting','Tylko szacunek'),
    'Recent checks':B('Recent checks','Letzte Prüfungen','Vérifications récentes','Comprobaciones recientes','Analisi recenti','Recente controles','Ostatnie sprawdzenia'),
    'View all':B('View all','Alle anzeigen','Tout voir','Ver todo','Vedi tutto','Alles bekijken','Zobacz wszystko'),
    'No checks yet.':B('No checks yet.','Noch keine Prüfungen.','Aucune vérification pour le moment.','Aún no hay comprobaciones.','Nessuna analisi ancora.','Nog geen controles.','Brak sprawdzeń.'),
    'Start with a product you are considering.':B('Start with a product you are considering.','Beginne mit einem Produkt, das du in Betracht ziehst.','Commencez avec un produit que vous envisagez d’acheter.','Empieza con un producto que estés considerando.','Inizia con un prodotto che stai valutando.','Begin met een product dat je overweegt.','Zacznij od produktu, który rozważasz.'),
    'Active subscription':B('Active subscription','Aktives Abonnement','Abonnement actif','Suscripción activa','Abbonamento attivo','Actief abonnement','Aktywna subskrypcja'),
    'MY CHECKS':B('MY CHECKS','MEINE PRÜFUNGEN','MES ANALYSES','MIS ANÁLISIS','LE MIE ANALISI','MIJN CONTROLES','MOJE SPRAWDZENIA'),
    'Your analysis history.':B('Your analysis history.','Deine Analysehistorie.','Votre historique d’analyses.','Tu historial de análisis.','La cronologia delle tue analisi.','Je analysegeschiedenis.','Historia Twoich analiz.'),
    'Saved reports and recent product checks.':B('Saved reports and recent product checks.','Gespeicherte Berichte und aktuelle Produktprüfungen.','Rapports enregistrés et analyses récentes.','Informes guardados y comprobaciones recientes.','Report salvati e analisi recenti.','Opgeslagen rapporten en recente productcontroles.','Zapisane raporty i ostatnie sprawdzenia produktów.'),
    'New check':B('New check','Neue Prüfung','Nouvelle vérification','Nueva comprobación','Nuova analisi','Nieuwe controle','Nowe sprawdzenie'),
    'No saved checks yet.':B('No saved checks yet.','Noch keine gespeicherten Prüfungen.','Aucune analyse enregistrée.','Aún no hay comprobaciones guardadas.','Nessuna analisi salvata.','Nog geen opgeslagen controles.','Brak zapisanych sprawdzeń.'),
    'Your first analysis will appear here.':B('Your first analysis will appear here.','Deine erste Analyse erscheint hier.','Votre première analyse apparaîtra ici.','Tu primer análisis aparecerá aquí.','La tua prima analisi apparirà qui.','Je eerste analyse verschijnt hier.','Twoja pierwsza analiza pojawi się tutaj.'),
    'WISHLIST':B('WISHLIST','WUNSCHLISTE','LISTE DE SOUHAITS','LISTA DE DESEOS','LISTA DESIDERI','VERLANGLIJST','LISTA ŻYCZEŃ'),
    'Products worth waiting for.':B('Products worth waiting for.','Produkte, auf die sich das Warten lohnt.','Des produits qui valent la peine d’attendre.','Productos por los que vale la pena esperar.','Prodotti per cui vale la pena aspettare.','Producten waarop het wachten waard is.','Produkty, na które warto poczekać.'),
    'Keep your target prices close so buying feels simple when the right moment arrives.':B('Keep your target prices close so buying feels simple when the right moment arrives.','Behalte deine Zielpreise im Blick, damit der Kauf im richtigen Moment einfach ist.','Gardez vos prix cibles à portée de main pour acheter simplement au bon moment.','Mantén tus precios objetivo a mano para comprar cuando llegue el momento adecuado.','Tieni a portata di mano i tuoi prezzi obiettivo per acquistare al momento giusto.','Houd je doelprijzen bij de hand, zodat kopen eenvoudig wordt wanneer het juiste moment komt.','Miej swoje ceny docelowe pod ręką, aby łatwo kupić, gdy nadejdzie właściwy moment.'),
    'Find another deal →':B('Find another deal →','Ein weiteres Angebot finden →','Trouver une autre offre →','Buscar otra oferta →','Trova un’altra offerta →','Vind een andere deal →','Znajdź inną okazję →'),
    'Saved':B('Saved','Gespeichert','Enregistré','Guardado','Salvato','Opgeslagen','Zapisano'),
    'Seller not specified':B('Seller not specified','Verkäufer nicht angegeben','Vendeur non indiqué','Vendedor no especificado','Venditore non specificato','Verkoper niet opgegeven','Sprzedawca nieokreślony'),
    'Not set':B('Not set','Nicht festgelegt','Non défini','No establecido','Non impostato','Niet ingesteld','Nie ustawiono'),
    'Set target price':B('Set target price','Zielpreis festlegen','Définir le prix cible','Fijar precio objetivo','Imposta prezzo obiettivo','Doelprijs instellen','Ustaw cenę docelową'),
    'Save':B('Save','Speichern','Enregistrer','Guardar','Salva','Opslaan','Zapisz'),
    'e.g. 299':B('e.g. 299','z. B. 299','ex. 299','p. ej. 299','es. 299','bijv. 299','np. 299'),
    'Saved ':B('Saved ','Gespeichert ','Enregistré ','Guardado ','Salvato ','Opgeslagen ','Zapisano '),
    'Your wishlist is empty.':B('Your wishlist is empty.','Deine Wunschliste ist leer.','Votre liste de souhaits est vide.','Tu lista de deseos está vacía.','La tua lista desideri è vuota.','Je verlanglijst is leeg.','Twoja lista życzeń jest pusta.'),
    'Save a product after a Premium report.':B('Save a product after a Premium report.','Speichere ein Produkt nach einem Premium-Bericht.','Enregistrez un produit après un rapport Premium.','Guarda un producto después de un informe Premium.','Salva un prodotto dopo un report Premium.','Sla een product op na een Premium-rapport.','Zapisz produkt po raporcie Premium.'),
    'PRICE ALERTS':B('PRICE ALERTS','PREISALARM','ALERTES DE PRIX','ALERTAS DE PRECIOS','AVVISI PREZZO','PRIJSALERTS','ALERTY CENOWE'),
    'Know when your target is reached.':B('Know when your target is reached.','Wisse, wann dein Zielpreis erreicht ist.','Sachez quand votre prix cible est atteint.','Sabrás cuándo se alcanza tu precio objetivo.','Scopri quando viene raggiunto il tuo prezzo obiettivo.','Weet wanneer je doelprijs is bereikt.','Dowiedz się, kiedy osiągnięta zostanie cena docelowa.'),
    'Enable notifications':B('Enable notifications','Benachrichtigungen aktivieren','Activer les notifications','Activar notificaciones','Attiva notifiche','Meldingen inschakelen','Włącz powiadomienia'),
    'How alerts work on this device':B('How alerts work on this device','So funktionieren Alarme auf diesem Gerät','Comment fonctionnent les alertes sur cet appareil','Cómo funcionan las alertas en este dispositivo','Come funzionano gli avvisi su questo dispositivo','Zo werken meldingen op dit apparaat','Jak działają alerty na tym urządzeniu'),
    'Target reached':B('Target reached','Ziel erreicht','Objectif atteint','Objetivo alcanzado','Obiettivo raggiunto','Doel bereikt','Cel osiągnięty'),
    'Watching':B('Watching','Beobachtung','Surveillance','En seguimiento','Monitoraggio','In de gaten','Obserwacja'),
    'Check now':B('Check now','Jetzt prüfen','Vérifier maintenant','Comprobar ahora','Controlla ora','Nu controleren','Sprawdź teraz'),
    'No price targets yet.':B('No price targets yet.','Noch keine Zielpreise.','Aucun prix cible pour le moment.','Aún no hay precios objetivo.','Nessun prezzo obiettivo ancora.','Nog geen doelprijzen.','Brak cen docelowych.'),
    'Save a product and set a target after a Premium report.':B('Save a product and set a target after a Premium report.','Speichere ein Produkt und setze nach einem Premium-Bericht einen Zielpreis.','Enregistrez un produit et définissez un prix cible après un rapport Premium.','Guarda un producto y fija un objetivo después de un informe Premium.','Salva un prodotto e imposta un obiettivo dopo un report Premium.','Sla een product op en stel na een Premium-rapport een doelprijs in.','Zapisz produkt i ustaw cel po raporcie Premium.'),
    'ACCOUNT & SUBSCRIPTION':B('ACCOUNT & SUBSCRIPTION','KONTO & ABONNEMENT','COMPTE & ABONNEMENT','CUENTA Y SUSCRIPCIÓN','ACCOUNT E ABBONAMENTO','ACCOUNT & ABONNEMENT','KONTO I SUBSKRYPCJA'),
    'Your profile.':B('Your profile.','Dein Profil.','Votre profil.','Tu perfil.','Il tuo profilo.','Je profiel.','Twój profil.'),
    'Keep your email and billing access in one place.':B('Keep your email and billing access in one place.','Verwalte E-Mail und Abrechnung an einem Ort.','Gérez votre e-mail et votre facturation au même endroit.','Gestiona tu correo y facturación en un solo lugar.','Gestisci e-mail e fatturazione in un unico posto.','Beheer e-mail en facturatie op één plek.','Zarządzaj e-mailem i płatnościami w jednym miejscu.'),
    'No account yet':B('No account yet','Noch kein Konto','Pas encore de compte','Aún no hay cuenta','Nessun account','Nog geen account','Brak konta'),
    'Email profile':B('Email profile','E-Mail-Profil','Profil e-mail','Perfil de correo','Profilo e-mail','E-mailprofiel','Profil e-mail'),
    'Your profile is created automatically after your first Premium payment.':B('Your profile is created automatically after your first Premium payment.','Dein Profil wird nach deiner ersten Premium-Zahlung automatisch erstellt.','Votre profil est créé automatiquement après votre premier paiement Premium.','Tu perfil se crea automáticamente después de tu primer pago Premium.','Il tuo profilo viene creato automaticamente dopo il primo pagamento Premium.','Je profiel wordt automatisch aangemaakt na je eerste Premium-betaling.','Twój profil zostanie utworzony automatycznie po pierwszej płatności Premium.'),
    'Change email':B('Change email','E-Mail ändern','Modifier l’e-mail','Cambiar correo','Cambia e-mail','E-mail wijzigen','Zmień e-mail'),
    'Create profile':B('Create profile','Profil erstellen','Créer un profil','Crear perfil','Crea profilo','Profiel maken','Utwórz profil'),
    'SUBSCRIPTION':B('SUBSCRIPTION','ABONNEMENT','ABONNEMENT','SUSCRIPCIÓN','ABBONAMENTO','ABONNEMENT','SUBSKRYPCJA'),
    'Premium active':B('Premium active','Premium aktiv','Premium actif','Premium activo','Premium attivo','Premium actief','Premium aktywne'),
    'Free plan':B('Free plan','Kostenloser Tarif','Offre gratuite','Plan gratuito','Piano gratuito','Gratis abonnement','Plan bezpłatny'),
    'Your Premium access is active. Manage billing securely through Stripe.':B('Your Premium access is active. Manage billing securely through Stripe.','Dein Premium-Zugang ist aktiv. Verwalte die Abrechnung sicher über Stripe.','Votre accès Premium est actif. Gérez la facturation en toute sécurité via Stripe.','Tu acceso Premium está activo. Gestiona la facturación de forma segura mediante Stripe.','Il tuo accesso Premium è attivo. Gestisci la fatturazione in sicurezza tramite Stripe.','Je Premium-toegang is actief. Beheer facturatie veilig via Stripe.','Twój dostęp Premium jest aktywny. Zarządzaj płatnościami bezpiecznie przez Stripe.'),
    'One complete first analysis is free. Premium starts with a $0.99 starter payment and a 3-day Premium trial.':B('One complete first analysis is free. Premium starts with a $0.99 starter payment and a 3-day Premium trial.','Eine vollständige erste Analyse ist kostenlos. Premium beginnt mit einer Startzahlung von 0,99 $ und einer 3-tägigen Premium-Testphase.','Une première analyse complète est gratuite. Premium commence par un paiement initial de 0,99 $ et un essai Premium de 3 jours.','El primer análisis completo es gratis. Premium comienza con un pago inicial de 0,99 $ y una prueba Premium de 3 días.','La prima analisi completa è gratuita. Premium inizia con un pagamento iniziale di 0,99 $ e una prova Premium di 3 giorni.','Eén volledige eerste analyse is gratis. Premium begint met een startbetaling van $0,99 en een proefperiode van 3 dagen.','Pierwsza pełna analiza jest bezpłatna. Premium zaczyna się od opłaty startowej 0,99 USD i 3-dniowego okresu próbnego.'),
    'Manage billing':B('Manage billing','Abrechnung verwalten','Gérer la facturation','Gestionar facturación','Gestisci fatturazione','Facturatie beheren','Zarządzaj płatnościami'),
    'Terms':B('Terms','Bedingungen','Conditions','Términos','Termini','Voorwaarden','Warunki'),
    'Privacy':B('Privacy','Datenschutz','Confidentialité','Privacidad','Privacy','Privacy','Prywatność'),
    'Refund & withdrawal':B('Refund & withdrawal','Erstattung & Widerruf','Remboursement & rétractation','Reembolso y desistimiento','Rimborso e recesso','Terugbetaling & herroeping','Zwroty i odstąpienie'),
    'Contact':B('Contact','Kontakt','Contact','Contacto','Contatti','Contact','Kontakt'),
    'Know before you buy.':B('Know before you buy.','Informiere dich vor dem Kauf.','Sachez avant d’acheter.','Infórmate antes de comprar.','Informati prima di acquistare.','Weet wat je koopt.','Wiedz, zanim kupisz.'),
    'Analyzing':B('ANALYZING','ANALYSE LÄUFT','ANALYSE EN COURS','ANALIZANDO','ANALISI IN CORSO','ANALYSEERT','ANALIZA'),
    'Checking fresh market evidence…':B('Checking fresh market evidence…','Aktuelle Marktdaten werden geprüft…','Vérification des données de marché récentes…','Comprobando datos de mercado actualizados…','Controllo dei dati di mercato aggiornati…','Actuele marktgegevens worden gecontroleerd…','Sprawdzanie aktualnych danych rynkowych…'),
    'This can take a little while. We are matching the product and current offers.':B('This can take a little while. We are matching the product and current offers.','Das kann etwas dauern. Wir gleichen das Produkt mit aktuellen Angeboten ab.','Cela peut prendre un moment. Nous comparons le produit aux offres actuelles.','Puede tardar un poco. Estamos comparando el producto con las ofertas actuales.','Potrebbe richiedere un po’. Stiamo confrontando il prodotto con le offerte attuali.','Dit kan even duren. We koppelen het product aan actuele aanbiedingen.','To może chwilę potrwać. Dopasowujemy produkt do aktualnych ofert.'),
    'DEALCHECK PREMIUM':B('DEALCHECK PREMIUM','DEALCHECK PREMIUM','DEALCHECK PREMIUM','DEALCHECK PREMIUM','DEALCHECK PREMIUM','DEALCHECK PREMIUM','DEALCHECK PREMIUM'),
    'Turn your check into a confident purchase.':B('Turn your check into a confident purchase.','Mach aus deiner Prüfung einen sicheren Kauf.','Transformez votre analyse en achat en toute confiance.','Convierte tu comprobación en una compra segura.','Trasforma la tua analisi in un acquisto consapevole.','Maak van je controle een zekere aankoop.','Zamień analizę w pewny zakup.'),
    'Premium removes the guesswork: see the best current offer, real alternatives, the price worth waiting for and the details that can change the decision.':B('Premium removes the guesswork: see the best current offer, real alternatives, the price worth waiting for and the details that can change the decision.','Premium nimmt das Rätselraten heraus: Sieh das beste aktuelle Angebot, echte Alternativen, einen sinnvollen Zielpreis und die Details, die die Entscheidung ändern können.','Premium élimine les incertitudes : meilleure offre actuelle, vraies alternatives, prix qui vaut la peine d’attendre et détails qui peuvent changer la décision.','Premium elimina las dudas: mejor oferta actual, alternativas reales, precio por el que merece la pena esperar y detalles que pueden cambiar la decisión.','Premium elimina i dubbi: migliore offerta attuale, alternative reali, prezzo per cui vale la pena aspettare e dettagli che possono cambiare la decisione.','Premium neemt het giswerk weg: bekijk de beste huidige aanbieding, echte alternatieven, een prijs die het wachten waard is en details die de beslissing kunnen veranderen.','Premium eliminuje zgadywanie: najlepsza aktualna oferta, prawdziwe alternatywy, cena warta czekania i szczegóły, które mogą zmienić decyzję.'),
    "TODAY'S STARTER OFFER":B("TODAY'S STARTER OFFER",'STARTANGEBOT HEUTE',"OFFRE DE DÉPART DU JOUR",'OFERTA INICIAL DE HOY',"OFFERTA INIZIALE DI OGGI",'STARTAANBOD VANDAAG','DZISIEJSZA OFERTA STARTOWA'),
    '3-day Premium access included':B('3-day Premium access included','3 Tage Premium inklusive','Accès Premium de 3 jours inclus','Acceso Premium de 3 días incluido','Accesso Premium di 3 giorni incluso','3 dagen Premium inbegrepen','3 dni Premium w cenie'),
    'Full report + evidence':B('Full report + evidence','Vollständiger Bericht + Nachweise','Rapport complet + preuves','Informe completo + evidencias','Report completo + prove','Volledig rapport + bewijs','Pełny raport + dane'),
    'Best verified place to buy':B('Best verified place to buy','Bester verifizierter Kaufort','Meilleur endroit vérifié pour acheter','Mejor lugar verificado para comprar','Miglior posto verificato per acquistare','Beste geverifieerde plek om te kopen','Najlepsze zweryfikowane miejsce zakupu'),
    'Better-value alternatives':B('Better-value alternatives','Alternativen mit besserem Preis-Leistungs-Verhältnis','Alternatives au meilleur rapport qualité-prix','Alternativas con mejor relación calidad-precio','Alternative con miglior rapporto qualità-prezzo','Alternatieven met betere prijs-kwaliteit','Alternatywy o lepszej wartości'),
    'Score breakdown + target price':B('Score breakdown + target price','Bewertungsaufteilung + Zielpreis','Détail de la note + prix cible','Desglose de puntuación + precio objetivo','Dettaglio punteggio + prezzo obiettivo','Score-uitleg + doelprijs','Rozbicie oceny + cena docelowa'),
    'Saved checks, wishlist & alerts':B('Saved checks, wishlist & alerts','Gespeicherte Prüfungen, Wunschliste & Alarme','Analyses, liste de souhaits et alertes enregistrées','Comprobaciones, lista y alertas guardadas','Analisi, lista desideri e avvisi salvati','Opgeslagen controles, verlanglijst en alerts','Zapisane sprawdzenia, lista życzeń i alerty'),
    'Full name':B('Full name','Vollständiger Name','Nom complet','Nombre completo','Nome completo','Volledige naam','Imię i nazwisko'),
    'Your name':B('Your name','Dein Name','Votre nom','Tu nombre','Il tuo nome','Je naam','Twoje imię i nazwisko'),
    'Email':B('Email','E-Mail','E-mail','Correo','E-mail','E-mail','E-mail'),
    'Starter offer':B('Starter offer','Startangebot','Offre de départ','Oferta inicial','Offerta iniziale','Startaanbod','Oferta startowa'),
    'or pay by card':B('or pay by card','oder per Karte zahlen','ou payer par carte','o pagar con tarjeta','oppure paga con carta','of betaal met kaart','lub zapłać kartą'),
    'Pay $0.99 and start trial →':B('Pay $0.99 and start trial →','0,99 $ zahlen und Testphase starten →','Payer 0,99 $ et commencer l’essai →','Pagar 0,99 $ y empezar la prueba →','Paga 0,99 $ e inizia la prova →','Betaal $0,99 en start de proefperiode →','Zapłać 0,99 USD i rozpocznij okres próbny →'),
    'Not now':B('Not now','Nicht jetzt','Pas maintenant','Ahora no','Non ora','Niet nu','Nie teraz'),
    'By continuing, you authorize DEALCHECK to charge $0.99 today. Your 3-day Premium trial starts immediately. After the trial, $35/month will be charged automatically until you cancel. Your payment method is securely stored by Stripe for recurring billing. Cancel anytime subject to the applicable terms and law.':B('By continuing, you authorize DEALCHECK to charge $0.99 today. Your 3-day Premium trial starts immediately. After the trial, $35/month will be charged automatically until you cancel. Your payment method is securely stored by Stripe for recurring billing. Cancel anytime subject to the applicable terms and law.','Mit deiner Fortsetzung erlaubst du DEALCHECK, heute 0,99 $ zu berechnen. Deine 3-tägige Premium-Testphase startet sofort. Danach werden bis zur Kündigung automatisch 35 $/Monat berechnet. Deine Zahlungsmethode wird von Stripe sicher für wiederkehrende Zahlungen gespeichert. Du kannst jederzeit gemäß den geltenden Bedingungen und Gesetzen kündigen.','En continuant, vous autorisez DEALCHECK à débiter 0,99 $ aujourd’hui. Votre essai Premium de 3 jours commence immédiatement. Après l’essai, 35 $/mois seront débités automatiquement jusqu’à résiliation. Votre moyen de paiement est conservé en sécurité par Stripe pour la facturation récurrente. Annulation à tout moment selon les conditions applicables et la loi.','Al continuar, autorizas a DEALCHECK a cobrarte 0,99 $ hoy. Tu prueba Premium de 3 días comienza de inmediato. Después, se cobrarán 35 $/mes automáticamente hasta que canceles. Stripe almacena de forma segura tu método de pago para la facturación recurrente. Puedes cancelar cuando quieras según las condiciones y la ley aplicables.','Continuando, autorizzi DEALCHECK ad addebitare 0,99 $ oggi. La prova Premium di 3 giorni inizia subito. Dopo la prova, verranno addebitati automaticamente 35 $/mese fino alla cancellazione. Stripe conserva in modo sicuro il tuo metodo di pagamento per gli addebiti ricorrenti. Puoi annullare in qualsiasi momento secondo i termini applicabili e la legge.','Door verder te gaan, geef je DEALCHECK toestemming om vandaag $0,99 in rekening te brengen. Je proefperiode van 3 dagen Premium begint direct. Daarna wordt automatisch $35/maand in rekening gebracht totdat je opzegt. Stripe bewaart je betaalmethode veilig voor terugkerende betalingen. Je kunt op elk moment opzeggen volgens de toepasselijke voorwaarden en wetgeving.','Kontynuując, upoważniasz DEALCHECK do pobrania dziś 0,99 USD. 3-dniowy okres próbny Premium rozpoczyna się od razu. Po okresie próbnym do czasu rezygnacji automatycznie pobierane będzie 35 USD/mies. Stripe bezpiecznie przechowuje metodę płatności do płatności cyklicznych. Możesz anulować w dowolnym momencie zgodnie z obowiązującymi warunkami i prawem.'),
    'SAVE YOUR DEALCHECK':B('SAVE YOUR DEALCHECK','DEALCHECK SPEICHERN','ENREGISTRER VOTRE DEALCHECK','GUARDA TU DEALCHECK','SALVA IL TUO DEALCHECK','SLA JE DEALCHECK OP','ZAPISZ SWÓJ DEALCHECK'),
    'Create your profile.':B('Create your profile.','Erstelle dein Profil.','Créez votre profil.','Crea tu perfil.','Crea il tuo profilo.','Maak je profiel.','Utwórz swój profil.'),
    'Use only your email. No Google account or password is required in this MVP.':B('Use only your email. No Google account or password is required in this MVP.','Verwende nur deine E-Mail. Für diese MVP-Version sind kein Google-Konto und kein Passwort erforderlich.','Utilisez uniquement votre e-mail. Aucun compte Google ni mot de passe n’est requis dans ce MVP.','Usa solo tu correo. En este MVP no se requiere cuenta de Google ni contraseña.','Usa solo la tua e-mail. In questo MVP non servono account Google o password.','Gebruik alleen je e-mail. Voor deze MVP is geen Google-account of wachtwoord nodig.','Użyj tylko e-maila. W tej wersji MVP nie jest potrzebne konto Google ani hasło.'),
    'Continue with email →':B('Continue with email →','Mit E-Mail fortfahren →','Continuer avec l’e-mail →','Continuar con correo →','Continua con e-mail →','Doorgaan met e-mail →','Kontynuuj przez e-mail →'),
    'Terms of Use':B('Terms of Use','Nutzungsbedingungen','Conditions d’utilisation','Términos de uso','Termini di utilizzo','Gebruiksvoorwaarden','Warunki korzystania'),
    'Refund & withdrawal':B('Refund & withdrawal','Erstattung & Widerruf','Remboursement & rétractation','Reembolso y desistimiento','Rimborso e recesso','Terugbetaling & herroeping','Zwroty i odstąpienie'),
    'Product image':B('Product image','Produktbild','Image du produit','Imagen del producto','Immagine del prodotto','Productafbeelding','Zdjęcie produktu'),
    'View source ↗':B('View source ↗','Quelle öffnen ↗','Voir la source ↗','Ver fuente ↗','Vedi fonte ↗','Bron bekijken ↗','Zobacz źródło ↗'),
    'Check offer ↗':B('Check offer ↗','Angebot prüfen ↗','Vérifier l’offre ↗','Comprobar oferta ↗','Controlla offerta ↗','Aanbieding bekijken ↗','Sprawdź ofertę ↗'),
    'SMART ALTERNATIVE':B('SMART ALTERNATIVE','SMARTE ALTERNATIVE','ALTERNATIVE PERTINENTE','ALTERNATIVA INTELIGENTE','ALTERNATIVA INTELLIGENTE','SLIM ALTERNATIEF','INTELIGENTNA ALTERNATYWA'),
    'Current offer':B('Current offer','Aktuelles Angebot','Offre actuelle','Oferta actual','Offerta attuale','Huidige aanbieding','Aktualna oferta'),
    'Explore':B('Explore','Entdecken','Explorer','Explorar','Esplora','Ontdek','Odkryj'),
    'No verified comparable product yet':B('No verified comparable product yet','Noch kein verifiziertes Vergleichsprodukt','Aucun produit comparable vérifié pour le moment','Aún no hay un producto comparable verificado','Nessun prodotto comparabile verificato','Nog geen geverifieerd vergelijkbaar product','Brak zweryfikowanego porównywalnego produktu'),
    "We won't invent an alternative. Compare the exact product using live shopping results instead.":B("We won't invent an alternative. Compare the exact product using live shopping results instead.",'Wir erfinden keine Alternative. Vergleiche das exakte Produkt stattdessen mit aktuellen Einkaufsergebnissen.','Nous n’inventerons pas d’alternative. Comparez plutôt le produit exact avec les résultats d’achat en direct.','No inventaremos una alternativa. Compara el producto exacto con resultados de compra actuales.','Non inventeremo un’alternativa. Confronta invece il prodotto esatto con risultati di acquisto aggiornati.','We verzinnen geen alternatief. Vergelijk het exacte product met actuele winkelresultaten.','Nie wymyślamy alternatyw. Porównaj dokładny produkt z aktualnymi wynikami zakupów.'),
    'Compare on Google Shopping':B('Compare on Google Shopping','Mit Google Shopping vergleichen','Comparer sur Google Shopping','Comparar en Google Shopping','Confronta su Google Shopping','Vergelijken op Google Shopping','Porównaj w Google Shopping'),
    'Search on Amazon':B('Search on Amazon','Auf Amazon suchen','Rechercher sur Amazon','Buscar en Amazon','Cerca su Amazon','Zoeken op Amazon','Szukaj na Amazonie'),
    'Check camelcamelcamel price history':B('Check camelcamelcamel price history','Preisentwicklung bei camelcamelcamel prüfen','Voir l’historique des prix sur camelcamelcamel','Consultar historial de precios en camelcamelcamel','Controlla lo storico prezzi su camelcamelcamel','Bekijk prijsgeschiedenis op camelcamelcamel','Sprawdź historię cen na camelcamelcamel'),
    'Limited price evidence':B('Limited price evidence','Begrenzte Preisdaten','Données de prix limitées','Evidencia de precios limitada','Dati di prezzo limitati','Beperkte prijsgegevens','Ograniczone dane cenowe'),
    "We couldn't verify enough live sources to show a comparison. Verify the final price at checkout.":B("We couldn't verify enough live sources to show a comparison. Verify the final price at checkout.",'Wir konnten nicht genügend aktuelle Quellen für einen Vergleich verifizieren. Prüfe den Endpreis beim Checkout.','Nous n’avons pas pu vérifier suffisamment de sources actuelles pour afficher une comparaison. Vérifiez le prix final au paiement.','No pudimos verificar suficientes fuentes actuales para mostrar una comparación. Comprueba el precio final al pagar.','Non abbiamo potuto verificare abbastanza fonti aggiornate per mostrare un confronto. Verifica il prezzo finale al checkout.','We konden niet genoeg actuele bronnen verifiëren voor een vergelijking. Controleer de eindprijs bij het afrekenen.','Nie udało się zweryfikować wystarczającej liczby aktualnych źródeł. Sprawdź cenę końcową przy płatności.'),
    'Current':B('Current','Aktuell','Actuel','Actual','Attuale','Huidig','Aktualna'),
    'Checked ':B('Checked ','Geprüft ','Vérifié ','Comprobado ','Verificato ','Gecontroleerd ','Sprawdzono '),
    'No verified winner':B('No verified winner','Kein verifizierter Gewinner','Aucun gagnant vérifié','No hay ganador verificado','Nessun vincitore verificato','Geen geverifieerde winnaar','Brak zweryfikowanego zwycięzcy'),
    'No reliable current offer was strong enough to recommend.':B('No reliable current offer was strong enough to recommend.','Kein zuverlässiges aktuelles Angebot war stark genug für eine Empfehlung.','Aucune offre actuelle fiable n’était assez solide pour être recommandée.','Ninguna oferta actual fiable fue suficientemente sólida para recomendarla.','Nessuna offerta attuale affidabile era abbastanza valida da essere consigliata.','Geen betrouwbare huidige aanbieding was sterk genoeg om aan te bevelen.','Żadna wiarygodna aktualna oferta nie była wystarczająco dobra, by ją polecić.'),
    'No verified purchase link':B('No verified purchase link','Kein verifizierter Kauflink','Aucun lien d’achat vérifié','No hay enlace de compra verificado','Nessun link d’acquisto verificato','Geen geverifieerde aankooplink','Brak zweryfikowanego linku zakupu'),
    'Check final price, shipping, tax, warranty and returns at checkout.':B('Check final price, shipping, tax, warranty and returns at checkout.','Prüfe beim Checkout Endpreis, Versand, Steuern, Garantie und Rückgabe.','Vérifiez au paiement le prix final, la livraison, les taxes, la garantie et les retours.','Comprueba al pagar el precio final, envío, impuestos, garantía y devoluciones.','Verifica al checkout prezzo finale, spedizione, tasse, garanzia e resi.','Controleer bij het afrekenen prijs, verzending, belasting, garantie en retourvoorwaarden.','Sprawdź przy płatności cenę końcową, wysyłkę, podatki, gwarancję i zwroty.'),
    'No specific concern verified; this does not guarantee a clean bill of health.':B('No specific concern verified; this does not guarantee a clean bill of health.','Kein konkreter Kritikpunkt verifiziert; das garantiert keinen problemlosen Zustand.','Aucun problème précis vérifié ; cela ne garantit pas l’absence de défauts.','No se ha verificado ningún problema concreto; esto no garantiza que todo esté perfecto.','Nessuna criticità specifica verificata; ciò non garantisce l’assenza di problemi.','Geen specifiek aandachtspunt geverifieerd; dit garandeert niet dat alles in orde is.','Nie zweryfikowano konkretnego problemu; nie oznacza to braku wad.'),
    'Verify seller, returns, warranty and final checkout total.':B('Verify seller, returns, warranty and final checkout total.','Prüfe Verkäufer, Rückgabe, Garantie und den endgültigen Gesamtpreis.','Vérifiez le vendeur, les retours, la garantie et le total final.','Verifica vendedor, devoluciones, garantía y total final.','Verifica venditore, resi, garanzia e totale finale.','Controleer verkoper, retouren, garantie en eindtotaal.','Sprawdź sprzedawcę, zwroty, gwarancję i końcową kwotę.'),
    'SAVE THE DECISION':B('SAVE THE DECISION','KAUFENTSCHEIDUNG SPEICHERN','ENREGISTRER LA DÉCISION','GUARDAR LA DECISIÓN','SALVA LA DECISIONE','BESLISSING OPSLAAN','ZAPISZ DECYZJĘ'),
    'Your first analysis is free.':B('Your first analysis is free.','Deine erste Analyse ist kostenlos.','Votre première analyse est gratuite.','Tu primer análisis es gratis.','La tua prima analisi è gratuita.','Je eerste analyse is gratis.','Twoja pierwsza analiza jest bezpłatna.'),
    'No complicated setup':B('NO COMPLICATED SETUP','KEINE KOMPLIZIERTE EINRICHTUNG','AUCUNE CONFIGURATION COMPLEXE','SIN CONFIGURACIÓN COMPLICADA','NESSUNA CONFIGURAZIONE COMPLICATA','GEEN INGEWIKKELDE INSTELLING','BEZ SKOMPLIKOWANEJ KONFIGURACJI'),
    'NO GUARANTEES':B('NO GUARANTEES','KEINE GARANTIEN','AUCUNE GARANTIE','SIN GARANTÍAS','NESSUNA GARANZIA','GEEN GARANTIES','BEZ GWARANCJI'),
    'YOUR CHOICE':B('YOUR CHOICE','DEINE ENTSCHEIDUNG','VOTRE CHOIX','TU ELECCIÓN','LA TUA SCELTA','JOUW KEUZE','TWÓJ WYBÓR'),
    'Start with your first free check.':B('Start with your first free check.','Beginne mit deiner kostenlosen Prüfung.','Commencez par votre première vérification gratuite.','Empieza con tu primera comprobación gratuita.','Inizia con la tua prima analisi gratuita.','Begin met je eerste gratis controle.','Zacznij od pierwszego bezpłatnego sprawdzenia.'),
    'Evidence and uncertainty are shown honestly.':B('Evidence and uncertainty are shown honestly.','Daten und Unsicherheit werden ehrlich dargestellt.','Les preuves et l’incertitude sont présentées honnêtement.','Las evidencias y la incertidumbre se muestran con honestidad.','Prove e incertezza sono mostrate in modo trasparente.','Bewijs en onzekerheid worden eerlijk weergegeven.','Dane i niepewność są przedstawiane uczciwie.'),
    'Cancel Premium anytime.':B('Cancel Premium anytime.','Premium jederzeit kündbar.','Annulez Premium à tout moment.','Cancela Premium cuando quieras.','Annulla Premium in qualsiasi momento.','Premium op elk moment opzegbaar.','Anuluj Premium w dowolnym momencie.'),
    'Terms of Use':B('Terms of Use','Nutzungsbedingungen','Conditions d’utilisation','Términos de uso','Termini di utilizzo','Gebruiksvoorwaarden','Warunki korzystania'),
    'Privacy':B('Privacy','Datenschutz','Confidentialité','Privacidad','Privacy','Privacy','Prywatność'),
    'Refund & withdrawal':B('Refund & withdrawal','Erstattung & Widerruf','Remboursement & rétractation','Reembolso y desistimiento','Rimborso e recesso','Terugbetaling & herroeping','Zwroty i odstąpienie'),

    'DEALCHECK — Know before you buy':B('DEALCHECK — Know before you buy','DEALCHECK — Informiere dich vor dem Kauf','DEALCHECK — Sachez avant d’acheter','DEALCHECK — Infórmate antes de comprar','DEALCHECK — Informati prima di acquistare','DEALCHECK — Weet wat je koopt','DEALCHECK — Wiedz, zanim kupisz'),
    'Are you':B('Are you','Zahlst du','Payez-vous','¿Estás','Stai','Betaal je','Czy'),
    'overpaying?':B('overpaying?','zu viel?','trop cher ?','de más?','troppo?','te veel?','za dużo?'),
    'PNG, JPG or WEBP · up to 5 MB':B('PNG, JPG or WEBP · up to 5 MB','PNG, JPG oder WEBP · bis zu 5 MB','PNG, JPG ou WEBP · jusqu’à 5 Mo','PNG, JPG o WEBP · hasta 5 MB','PNG, JPG o WEBP · fino a 5 MB','PNG, JPG of WEBP · maximaal 5 MB','PNG, JPG lub WEBP · do 5 MB'),
    "We couldn't confidently identify this exact product":B("We couldn't confidently identify this exact product",'Dieses genaue Produkt konnte nicht sicher identifiziert werden','Nous n’avons pas pu identifier précisément ce produit','No hemos podido identificar con seguridad este producto exacto','Non è stato possibile identificare con certezza questo prodotto','We konden dit exacte product niet betrouwbaar identificeren','Nie udało się jednoznacznie zidentyfikować tego produktu'),
    'EXAMPLE DEAL SCORE':B('EXAMPLE DEAL SCORE','BEISPIEL-DEAL-SCORE','EXEMPLE DE SCORE D’OFFRE','EJEMPLO DE PUNTUACIÓN','ESEMPIO DI DEAL SCORE','VOORBEELD DEAL-SCORE','PRZYKŁADOWA OCENA OFERTY'),
    'STRONG DEAL':B('STRONG DEAL','STARKES ANGEBOT','OFFRE EXCELLENTE','OFERTA DESTACADA','OTTIMA OFFERTA','STERKE DEAL','ŚWIETNA OFERTA'),
    'Your first analysis':B('Your first analysis','Deine erste Analyse','Votre première analyse','Tu primer análisis','La tua prima analisi','Je eerste analyse','Twoja pierwsza analiza'),
    'How it works':B('How it works','So funktioniert es','Comment ça marche','Cómo funciona','Come funziona','Hoe het werkt','Jak to działa'),
    'Add a product':B('Add a product','Produkt hinzufügen','Ajouter un produit','Añadir un producto','Aggiungi un prodotto','Product toevoegen','Dodaj produkt'),
    'Paste a link, upload a screenshot or enter the product manually.':B('Paste a link, upload a screenshot or enter the product manually.','Füge einen Link ein, lade einen Screenshot hoch oder gib das Produkt manuell ein.','Collez un lien, importez une capture ou saisissez le produit manuellement.','Pega un enlace, sube una captura o introduce el producto manualmente.','Incolla un link, carica uno screenshot o inserisci il prodotto manualmente.','Plak een link, upload een screenshot of voer het product handmatig in.','Wklej link, prześlij zrzut ekranu lub wpisz produkt ręcznie.'),
    'We analyze it':B('We analyze it','Wir analysieren es','Nous l’analysons','Lo analizamos','Lo analizziamo','We analyseren het','Analizujemy go'),
    'Fresh market evidence is matched to the exact product and your market.':B('Fresh market evidence is matched to the exact product and your market.','Aktuelle Marktdaten werden mit dem genauen Produkt und deinem Markt abgeglichen.','Les données de marché récentes sont comparées au produit exact et à votre marché.','Los datos de mercado actuales se comparan con el producto exacto y tu mercado.','I dati di mercato aggiornati vengono confrontati con il prodotto esatto e il tuo mercato.','Actuele marktgegevens worden gekoppeld aan het exacte product en jouw markt.','Aktualne dane rynkowe są dopasowywane do konkretnego produktu i Twojego rynku.'),
    'Make a smarter decision':B('Make a smarter decision','Triff eine bessere Entscheidung','Prenez une décision plus éclairée','Toma una decisión más inteligente','Prendi una decisione migliore','Maak een slimmere beslissing','Podejmij lepszą decyzję'),
    'See the price position, concerns and where the strongest verified offer is.':B('See the price position, concerns and where the strongest verified offer is.','Sieh die Preisposition, Bedenken und das stärkste verifizierte Angebot.','Voyez la position du prix, les points d’attention et la meilleure offre vérifiée.','Consulta la posición del precio, los aspectos a vigilar y la oferta verificada más sólida.','Vedi la posizione del prezzo, i punti critici e l’offerta verificata migliore.','Bekijk de prijspositie, aandachtspunten en de sterkste geverifieerde aanbieding.','Zobacz pozycję cenową, najważniejsze uwagi i najlepszą zweryfikowaną ofertę.'),
    'No complicated setup':B('NO COMPLICATED SETUP','KEINE KOMPLIZIERTE EINRICHTUNG','AUCUNE CONFIGURATION COMPLEXE','SIN CONFIGURACIÓN COMPLICADA','NESSUNA CONFIGURAZIONE COMPLICATA','GEEN INGEWIKKELDE INSTELLING','BEZ SKOMPLIKOWANEJ KONFIGURACJI'),
    'DEALCHECK is an informational shopping assistant. Always verify the final price, seller, taxes, shipping, warranty and return terms before purchasing.':B('DEALCHECK is an informational shopping assistant. Always verify the final price, seller, taxes, shipping, warranty and return terms before purchasing.','DEALCHECK ist ein informativer Einkaufsassistent. Prüfe vor dem Kauf immer Endpreis, Verkäufer, Steuern, Versand, Garantie und Rückgabebedingungen.','DEALCHECK est un assistant d’achat informatif. Vérifiez toujours le prix final, le vendeur, les taxes, la livraison, la garantie et les conditions de retour avant d’acheter.','DEALCHECK es un asistente informativo de compras. Verifica siempre el precio final, vendedor, impuestos, envío, garantía y devoluciones antes de comprar.','DEALCHECK è un assistente informativo per gli acquisti. Verifica sempre prezzo finale, venditore, tasse, spedizione, garanzia e resi prima di acquistare.','DEALCHECK is een informatieve aankoopassistent. Controleer altijd de eindprijs, verkoper, belastingen, verzending, garantie en retourvoorwaarden voordat je koopt.','DEALCHECK to informacyjny asystent zakupowy. Zawsze sprawdź cenę końcową, sprzedawcę, podatki, wysyłkę, gwarancję i warunki zwrotu przed zakupem.'),
    'is applied automatically — no code required.':B('is applied automatically — no code required.','wird automatisch angewendet — kein Code erforderlich.','est appliqué automatiquement — aucun code requis.','se aplica automáticamente — no necesitas código.','viene applicata automaticamente — nessun codice richiesto.','wordt automatisch toegepast — geen code nodig.','jest stosowana automatycznie — kod nie jest potrzebny.'),
    '$0.99 today':B('$0.99 today','heute 0,99 $','0,99 $ aujourd’hui','0,99 $ hoy','0,99 $ oggi','vandaag $0,99','0,99 USD dzisiaj'),
    '$35/month':B('$35/month','35 $/Monat','35 $/mois','35 $/mes','35 $/mese','$35/maand','35 USD/mies.'),
    'Product':B('Product','Produkt','Produit','Producto','Prodotto','Product','Produkt'),
    'Seller not verified':B('Seller not verified','Verkäufer nicht verifiziert','Vendeur non vérifié','Vendedor no verificado','Venditore non verificato','Verkoper niet geverifieerd','Sprzedawca niezweryfikowany'),

    '✓ INITIAL PRICE SIGNAL':B('✓ INITIAL PRICE SIGNAL','✓ ERSTES PREISSIGNAL','✓ PREMIER SIGNAL DE PRIX','✓ SEÑAL INICIAL DE PRECIO','✓ SEGNALE INIZIALE DI PREZZO','✓ EERSTE PRIJSSIGNAAL','✓ WSTĘPNY SYGNAŁ CENOWY'),
    '⚠ PRICE DESERVES A SECOND LOOK':B('⚠ PRICE DESERVES A SECOND LOOK','⚠ PREIS SOLLTE NOCHMALS GEPRÜFT WERDEN','⚠ LE PRIX MÉRITE UN SECOND EXAMEN','⚠ EL PRECIO MERECE UNA SEGUNDA MIRADA','⚠ IL PREZZO MERITA UN SECONDO CONTROLLO','⚠ DE PRIJS VERDIENT EEN TWEEDE KIJK','⚠ CENA WYMAGA PONOWNEGO SPRAWDZENIA'),
    'The first market signal does not show a clear pricing problem.':B('The first market signal does not show a clear pricing problem.','Das erste Marktsignal zeigt kein klares Preisproblem.','Le premier signal du marché ne montre pas de problème de prix évident.','La primera señal del mercado no muestra un problema de precio claro.','Il primo segnale di mercato non mostra un problema di prezzo evidente.','Het eerste marktsignaal toont geen duidelijk prijsprobleem.','Wstępny sygnał rynkowy nie wskazuje na wyraźny problem z ceną.'),
    'You may be paying ':B('You may be paying ','Möglicherweise zahlst du ','Vous payez peut-être ','Puede que estés pagando ','Potresti pagare ','Mogelijk betaal je ','Możliwe, że płacisz '),
    'more than the fair range suggests':B('more than the fair range suggests','mehr als die faire Spanne nahelegt','plus que ne le suggère la fourchette équitable','más de lo que indica el rango justo','più di quanto suggerisca la fascia equa','meer dan de eerlijke bandbreedte aangeeft','więcej, niż sugeruje uczciwy zakres'),
    'Want the full answer?':B('Want the full answer?','Willst du die vollständige Antwort?','Vous voulez la réponse complète ?','¿Quieres la respuesta completa?','Vuoi la risposta completa?','Wil je het volledige antwoord?','Chcesz pełną odpowiedź?'),
    'See the better deal →':B('See the better deal →','Besseres Angebot ansehen →','Voir la meilleure offre →','Ver la mejor oferta →','Vedi l’offerta migliore →','Bekijk de betere deal →','Zobacz lepszą ofertę →'),
    'FAIR MARKET RANGE':B('FAIR MARKET RANGE','FAIRE MARKTSPANNE','FOURCHETTE DE MARCHÉ ÉQUITABLE','RANGO DE MERCADO JUSTO','FASCIA DI MERCATO EQUA','EERLIJKE MARKTBAND','UCZCIWY ZAKRES RYNKOWY'),
    'Limited data':B('Limited data','Begrenzte Daten','Données limitées','Datos limitados','Dati limitati','Beperkte gegevens','Ograniczone dane'),
    'Market evidence':B('Market evidence','Marktdaten','Données de marché','Datos de mercado','Dati di mercato','Marktgegevens','Dane rynkowe'),
    'Premium can explain why':B('Premium can explain why','Premium erklärt warum','Premium peut expliquer pourquoi','Premium puede explicar por qué','Premium può spiegare perché','Premium kan uitleggen waarom','Premium wyjaśnia dlaczego'),
    'PREMIUM BUYING REPORT':B('✦ PREMIUM BUYING REPORT','✦ PREMIUM-KAUFBERICHT','✦ RAPPORT D’ACHAT PREMIUM','✦ INFORME DE COMPRA PREMIUM','✦ REPORT D’ACQUISTO PREMIUM','✦ PREMIUM-AANKOOPRAPPORT','✦ RAPORT ZAKUPOWY PREMIUM'),
    'OUR RECOMMENDATION':B('OUR RECOMMENDATION','UNSERE EMPFEHLUNG','NOTRE RECOMMANDATION','NUESTRA RECOMENDACIÓN','LA NOSTRA RACCOMANDAZIONE','ONZE AANBEVELING','NASZA REKOMENDACJA'),
    'Looks ready to buy.':B('Looks ready to buy.','Sieht kaufbereit aus.','Cela semble prêt à être acheté.','Parece listo para comprar.','Sembra pronto per l’acquisto.','Lijkt klaar om te kopen.','Wygląda na gotowy do zakupu.'),
    'Waiting could make sense.':B('Waiting could make sense.','Warten könnte sinnvoll sein.','Attendre peut être pertinent.','Esperar podría tener sentido.','Aspettare potrebbe essere sensato.','Wachten kan verstandig zijn.','Warto rozważyć czekanie.'),
    'Compare before paying.':B('Compare before paying.','Vergleiche vor dem Bezahlen.','Comparez avant de payer.','Compara antes de pagar.','Confronta prima di pagare.','Vergelijk voordat je betaalt.','Porównaj przed zapłatą.'),
    'Verify more before paying.':B('Verify more before paying.','Prüfe vor dem Bezahlen mehr.','Vérifiez davantage avant de payer.','Verifica más antes de pagar.','Verifica meglio prima di pagare.','Controleer meer voordat je betaalt.','Sprawdź więcej przed zapłatą.'),
    '✦ POTENTIAL SAVING FOUND':B('✦ POTENTIAL SAVING FOUND','✦ MÖGLICHE ERSPARNIS GEFUNDEN','✦ ÉCONOMIE POTENTIELLE TROUVÉE','✦ POSIBLE AHORRO ENCONTRADO','✦ POSSIBILE RISPARMIO TROVATO','✦ MOGELIJKE BESPARING GEVONDEN','✦ ZNALEZIONO POTENCJALNĄ OSZCZĘDNOŚĆ'),
    'We found a current offer below the price you entered. Verify the final checkout total before buying.':B('We found a current offer below the price you entered. Verify the final checkout total before buying.','Wir haben ein aktuelles Angebot unter deinem eingegebenen Preis gefunden. Prüfe vor dem Kauf den endgültigen Gesamtpreis.','Nous avons trouvé une offre actuelle inférieure au prix indiqué. Vérifiez le total final avant d’acheter.','Hemos encontrado una oferta actual por debajo del precio introducido. Verifica el total final antes de comprar.','Abbiamo trovato un’offerta attuale inferiore al prezzo inserito. Verifica il totale finale prima di acquistare.','We vonden een actuele aanbieding onder de ingevoerde prijs. Controleer het eindtotaal voordat je koopt.','Znaleźliśmy aktualną ofertę poniżej podanej ceny. Sprawdź końcową kwotę przed zakupem.'),
    'Current verified options':B('Current verified options','Aktuelle verifizierte Optionen','Options actuelles vérifiées','Opciones actuales verificadas','Opzioni attuali verificate','Actuele geverifieerde opties','Aktualne zweryfikowane opcje'),
    'Only materially comparable picks':B('Only materially comparable picks','Nur wirklich vergleichbare Optionen','Uniquement des options réellement comparables','Solo opciones realmente comparables','Solo opzioni realmente comparabili','Alleen echt vergelijkbare opties','Tylko rzeczywiście porównywalne opcje'),
    'Verify final checkout details':B('Verify final checkout details','Prüfe die finalen Checkout-Daten','Vérifiez les détails finaux du paiement','Verifica los detalles finales del pago','Verifica i dettagli finali del checkout','Controleer de definitieve betaalgegevens','Sprawdź szczegóły końcowej płatności'),
    'Limited evidence.':B('Limited evidence.','Begrenzte Datenlage.','Données limitées.','Evidencia limitada.','Dati limitati.','Beperkte gegevens.','Ograniczone dane.'),
    'BUY':B('BUY','KAUFEN','ACHETER','COMPRAR','ACQUISTA','KOPEN','KUP'),
    'WAIT':B('WAIT','WARTEN','ATTENDRE','ESPERAR','ATTENDI','WACHT','CZEKAJ'),
    'COMPARE':B('COMPARE','VERGLEICHEN','COMPARER','COMPARAR','CONFRONTA','VERGELIJKEN','PORÓWNAJ'),
    'INSUFFICIENT DATA':B('INSUFFICIENT DATA','UNZUREICHENDE DATEN','DONNÉES INSUFFISANTES','DATOS INSUFICIENTES','DATI INSUFFICIENTI','ONVOLDOENDE GEGEVENS','NIEWYSTARCZAJĄCE DANE'),

    'Analysis failed. Try another source.':B('Analysis failed. Try another source.','Analyse fehlgeschlagen. Versuche eine andere Quelle.','L’analyse a échoué. Essayez une autre source.','El análisis falló. Prueba otra fuente.','Analisi non riuscita. Prova un’altra fonte.','Analyse mislukt. Probeer een andere bron.','Analiza nie powiodła się. Spróbuj innego źródła.'),
    'Language: English':B('Language: English','Sprache: Englisch','Langue : anglais','Idioma: inglés','Lingua: inglese','Taal: Engels','Język: angielski'),
    'Language':B('Language','Sprache','Langue','Idioma','Lingua','Taal','Język'),
    "The link or screenshot didn't give us enough to match it precisely. Enter the product name (and price, if you know it) below and check again — this always gives the most accurate result.":B("The link or screenshot didn't give us enough to match it precisely. Enter the product name (and price, if you know it) below and check again — this always gives the most accurate result.",'Der Link oder Screenshot reichte nicht aus, um das genaue Produkt sicher zuzuordnen. Gib unten Produktname und, falls bekannt, Preis ein und prüfe erneut — so erhältst du die genaueste Antwort.','Le lien ou la capture ne nous a pas permis d’identifier précisément le produit. Saisissez ci-dessous le nom du produit et, si vous le connaissez, son prix, puis relancez la vérification — c’est la méthode la plus précise.','El enlace o la captura no dieron suficiente información para identificar el producto exacto. Introduce abajo el nombre del producto y, si lo sabes, el precio, y vuelve a comprobarlo — así obtendrás el resultado más preciso.','Il link o lo screenshot non hanno fornito abbastanza informazioni per identificare con precisione il prodotto. Inserisci qui sotto il nome del prodotto e, se lo conosci, il prezzo, poi controlla di nuovo — è il metodo più accurato.','De link of screenshot gaf niet genoeg informatie om het exacte product te identificeren. Vul hieronder de productnaam en, als je die weet, de prijs in en controleer opnieuw — dit geeft het nauwkeurigste resultaat.','Link lub zrzut ekranu nie zawierały wystarczających informacji, aby dokładnie dopasować produkt. Wpisz poniżej nazwę produktu i, jeśli ją znasz, cenę, a następnie sprawdź ponownie — to daje najdokładniejszy wynik.'),
    '✓ Full report + evidence':B('✓ Full report + evidence','✓ Vollständiger Bericht + Nachweise','✓ Rapport complet + preuves','✓ Informe completo + evidencias','✓ Report completo + prove','✓ Volledig rapport + bewijs','✓ Pełny raport + dane'),
    '✓ Best verified place to buy':B('✓ Best verified place to buy','✓ Bester verifizierter Kaufort','✓ Meilleur endroit vérifié pour acheter','✓ Mejor lugar verificado para comprar','✓ Miglior posto verificato per acquistare','✓ Beste geverifieerde plek om te kopen','✓ Najlepsze zweryfikowane miejsce zakupu'),
    '✓ Better-value alternatives':B('✓ Better-value alternatives','✓ Alternativen mit besserem Preis-Leistungs-Verhältnis','✓ Alternatives au meilleur rapport qualité-prix','✓ Alternativas con mejor relación calidad-precio','✓ Alternative con miglior rapporto qualità-prezzo','✓ Alternatieven met betere prijs-kwaliteit','✓ Alternatywy o lepszej wartości'),
    '✓ Score breakdown + target price':B('✓ Score breakdown + target price','✓ Bewertungsaufteilung + Zielpreis','✓ Détail de la note + prix cible','✓ Desglose de puntuación + precio objetivo','✓ Dettaglio punteggio + prezzo obiettivo','✓ Score-uitleg + doelprijs','✓ Rozbicie oceny + cena docelowa'),
    '✓ Saved checks, wishlist & alerts':B('✓ Saved checks, wishlist & alerts','✓ Gespeicherte Prüfungen, Wunschliste & Alarme','✓ Analyses, liste de souhaits et alertes enregistrées','✓ Comprobaciones, lista y alertas guardadas','✓ Analisi, lista desideri e avvisi salvati','✓ Opgeslagen controles, verlanglijst en alerts','✓ Zapisane sprawdzenia, lista życzeń i alerty'),
    'Real offer, seller, price and one-tap buying link.':B('Real offer, seller, price and one-tap buying link.','Echtes Angebot, Verkäufer, Preis und direkter Kauflink.','Offre réelle, vendeur, prix et lien d’achat direct.','Oferta real, vendedor, precio y enlace directo de compra.','Offerta reale, venditore, prezzo e link diretto all’acquisto.','Echte aanbieding, verkoper, prijs en directe aankooplink.','Rzeczywista oferta, sprzedawca, cena i bezpośredni link zakupu.'),
    'Real comparable products with photos, prices and reasons.':B('Real comparable products with photos, prices and reasons.','Echte vergleichbare Produkte mit Bildern, Preisen und Begründungen.','Produits réellement comparables avec photos, prix et raisons.','Productos comparables reales con fotos, precios y motivos.','Prodotti realmente comparabili con foto, prezzi e motivazioni.','Echte vergelijkbare producten met foto’s, prijzen en redenen.','Rzeczywiste porównywalne produkty ze zdjęciami, cenami i uzasadnieniem.'),
    'Seller, warranty, returns and the details worth checking.':B('Seller, warranty, returns and the details worth checking.','Verkäufer, Garantie, Rückgabe und wichtige Details.','Vendeur, garantie, retours et détails à vérifier.','Vendedor, garantía, devoluciones y detalles que conviene revisar.','Venditore, garanzia, resi e dettagli da controllare.','Verkoper, garantie, retouren en belangrijke details.','Sprzedawca, gwarancja, zwroty i szczegóły warte sprawdzenia.'),
    'A clear price point that makes the decision easier.':B('A clear price point that makes the decision easier.','Ein klarer Preis, der die Entscheidung erleichtert.','Un prix cible clair pour faciliter la décision.','Un precio claro que facilita la decisión.','Un prezzo chiaro che rende più semplice la decisione.','Een duidelijke prijs die de beslissing eenvoudiger maakt.','Jasna cena, która ułatwia decyzję.'),
    'Unlock Premium →':B('Unlock Premium →','Premium freischalten →','Débloquer Premium →','Desbloquear Premium →','Sblocca Premium →','Premium ontgrendelen →','Odblokuj Premium →'),
    'Unlock Premium — $0.99 today':B('Unlock Premium — $0.99 today','Premium freischalten — heute 0,99 $','Débloquer Premium — 0,99 $ aujourd’hui','Desbloquear Premium — 0,99 $ hoy','Sblocca Premium — 0,99 $ oggi','Premium ontgrendelen — vandaag $0,99','Odblokuj Premium — 0,99 USD dzisiaj'),
    'One complete first analysis is free.':B('One complete first analysis is free.','Eine vollständige erste Analyse ist kostenlos.','Une première analyse complète est gratuite.','El primer análisis completo es gratis.','La prima analisi completa è gratuita.','Eén volledige eerste analyse is gratis.','Pierwsza pełna analiza jest bezpłatna.'),
    'Unlimited checking, saved history, alternatives and price targets are designed to turn one analysis into an ongoing buying habit.':B('Unlimited checking, saved history, alternatives and price targets are designed to turn one analysis into an ongoing buying habit.','Unbegrenzte Prüfungen, gespeicherte Historie, Alternativen und Zielpreise machen aus einer Analyse eine dauerhafte Kaufhilfe.','Vérifications illimitées, historique enregistré, alternatives et prix cibles pour transformer une analyse en réflexe d’achat.','Comprobaciones ilimitadas, historial guardado, alternativas y precios objetivo convierten un análisis en un hábito de compra.','Controlli illimitati, cronologia, alternative e prezzi obiettivo trasformano un’analisi in un’abitudine d’acquisto.','Onbeperkte controles, geschiedenis, alternatieven en doelprijzen maken van één analyse een blijvende aankooproutine.','Nielimitowane sprawdzanie, historia, alternatywy i ceny docelowe pomagają zamienić analizę w stały nawyk zakupowy.'),
    'ANALYZING':B('ANALYZING','ANALYSE LÄUFT','ANALYSE EN COURS','ANALIZANDO','ANALISI IN CORSO','ANALYSEERT','ANALIZA'),
    'NO COMPLICATED SETUP':B('NO COMPLICATED SETUP','KEINE KOMPLIZIERTE EINRICHTUNG','AUCUNE CONFIGURATION COMPLEXE','SIN CONFIGURACIÓN COMPLICADA','NESSUNA CONFIGURAZIONE COMPLICATA','GEEN INGEWIKKELDE INSTELLING','BEZ SKOMPLIKOWANEJ KONFIGURACJI'),
    'United States':B('United States','Vereinigte Staaten','États-Unis','Estados Unidos','Stati Uniti','Verenigde Staten','Stany Zjednoczone'),
    'Europe':B('Europe','Europa','Europe','Europa','Europa','Europa','Europa'),
    'United Kingdom':B('United Kingdom','Vereinigtes Königreich','Royaume-Uni','Reino Unido','Regno Unito','Verenigd Koninkrijk','Wielka Brytania'),
    'India':B('India','Indien','Inde','India','India','India','Indie'),
    'Canada':B('Canada','Kanada','Canada','Canadá','Canada','Canada','Kanada'),
    'Australia':B('Australia','Australien','Australie','Australia','Australia','Australië','Australia'),
    'New Zealand':B('New Zealand','Neuseeland','Nouvelle-Zélande','Nueva Zelanda','Nuova Zelanda','Nieuw-Zeeland','Nowa Zelandia'),
    'Japan':B('Japan','Japan','Japon','Japón','Giappone','Japan','Japonia'),
    'Singapore':B('Singapore','Singapur','Singapour','Singapur','Singapore','Singapore','Singapur'),
    'United Arab Emirates':B('United Arab Emirates','Vereinigte Arabische Emirate','Émirats arabes unis','Emiratos Árabes Unidos','Emirati Arabi Uniti','Verenigde Arabische Emiraten','Zjednoczone Emiraty Arabskie'),
    'South Africa':B('South Africa','Südafrika','Afrique du Sud','Sudáfrica','Sudafrica','Zuid-Afrika','Republika Południowej Afryki'),
    'Brazil':B('Brazil','Brasilien','Brésil','Brasil','Brasile','Brazilië','Brazylia'),
    'Mexico':B('Mexico','Mexiko','Mexique','México','Messico','Mexico','Meksyk'),
    'Other / International':B('Other / International','Andere / International','Autre / International','Otro / Internacional','Altro / Internazionale','Overig / Internationaal','Inne / Międzynarodowe'),
    'AI shopping decision assistant. Check price, value, risks and better places to buy before you pay.':B('AI shopping decision assistant. Check price, value, risks and better places to buy before you pay.','KI-Kaufassistent. Prüfe Preis, Wert, Risiken und bessere Kauforte vor dem Bezahlen.','Assistant IA pour les achats. Vérifiez le prix, la valeur, les risques et les meilleurs endroits où acheter avant de payer.','Asistente IA de compras. Comprueba precio, valor, riesgos y mejores lugares para comprar antes de pagar.','Assistente IA per gli acquisti. Controlla prezzo, valore, rischi e luoghi migliori dove acquistare prima di pagare.','AI-aankoopassistent. Controleer prijs, waarde, risico’s en betere plekken om te kopen voordat je betaalt.','Asystent AI zakupów. Sprawdź cenę, wartość, ryzyko i lepsze miejsca zakupu, zanim zapłacisz.'),
    'DEALCHECK — Know before you buy.':B('DEALCHECK — Know before you buy.','DEALCHECK — Informiere dich vor dem Kauf.','DEALCHECK — Sachez avant d’acheter.','DEALCHECK — Infórmate antes de comprar.','DEALCHECK — Informati prima di acquistare.','DEALCHECK — Weet wat je koopt.','DEALCHECK — Wiedz, zanim kupisz.'),
    'Performance':B('Performance','Leistung','Performances','Rendimiento','Prestazioni','Prestaties','Wydajność'),
    'Build quality':B('Build quality','Verarbeitungsqualität','Qualité de fabrication','Calidad de construcción','Qualità costruttiva','Bouwkwaliteit','Jakość wykonania'),
    'Features':B('Features','Ausstattung','Fonctionnalités','Características','Funzionalità','Functies','Funkcje'),
    'Reliability':B('Reliability','Zuverlässigkeit','Fiabilité','Fiabilidad','Affidabilità','Betrouwbaarheid','Niezawodność'),
    'Price value':B('Price value','Preis-Leistung','Rapport qualité-prix','Relación calidad-precio','Rapporto qualità-prezzo','Prijs-kwaliteit','Stosunek ceny do wartości'),
    'Buy':B('Buy','Kaufen','Acheter','Comprar','Acquista','Kopen','Kup'),
    'Wait':B('Wait','Warten','Attendre','Esperar','Attendi','Wachten','Czekaj'),
    'Compare':B('Compare','Vergleichen','Comparer','Comparar','Confronta','Vergelijken','Porównaj'),
    'Insufficient data':B('Insufficient data','Unzureichende Daten','Données insuffisantes','Datos insuficientes','Dati insufficienti','Onvoldoende gegevens','Niewystarczające dane'),
    'Price checked and watch updated.':B('Price checked and watch updated.','Preis geprüft und Beobachtung aktualisiert.','Prix vérifié et suivi mis à jour.','Precio comprobado y seguimiento actualizado.','Prezzo verificato e monitoraggio aggiornato.','Prijs gecontroleerd en volgen bijgewerkt.','Cena sprawdzona i obserwacja zaktualizowana.'),
    'Target price reached. Nice timing.':B('Target price reached. Nice timing.','Zielpreis erreicht. Gutes Timing.','Prix cible atteint. Bon timing.','Precio objetivo alcanzado. Buen momento.','Prezzo obiettivo raggiunto. Ottimo momento.','Doelprijs bereikt. Goed getimed.','Cena docelowa osiągnięta. Dobry moment.'),
    'Notifications enabled on this device.':B('Notifications enabled on this device.','Benachrichtigungen auf diesem Gerät aktiviert.','Notifications activées sur cet appareil.','Notificaciones activadas en este dispositivo.','Notifiche attivate su questo dispositivo.','Meldingen ingeschakeld op dit apparaat.','Powiadomienia włączone na tym urządzeniu.'),
    'Notifications were not enabled.':B('Notifications were not enabled.','Benachrichtigungen wurden nicht aktiviert.','Les notifications n’ont pas été activées.','Las notificaciones no se activaron.','Le notifiche non sono state attivate.','Meldingen zijn niet ingeschakeld.','Powiadomienia nie zostały włączone.'),
    'Browser notifications are not available on this device.':B('Browser notifications are not available on this device.','Browser-Benachrichtigungen sind auf diesem Gerät nicht verfügbar.','Les notifications du navigateur ne sont pas disponibles sur cet appareil.','Las notificaciones del navegador no están disponibles en este dispositivo.','Le notifiche del browser non sono disponibili su questo dispositivo.','Browsermeldingen zijn niet beschikbaar op dit apparaat.','Powiadomienia przeglądarki nie są dostępne na tym urządzeniu.'),
    'Enter a valid target price.':B('Enter a valid target price.','Gib einen gültigen Zielpreis ein.','Saisissez un prix cible valide.','Introduce un precio objetivo válido.','Inserisci un prezzo obiettivo valido.','Voer een geldige doelprijs in.','Wprowadź prawidłową cenę docelową.'),
    'Target price saved. Background alerts are coming with the monitoring backend.':B('Target price saved. Background alerts are coming with the monitoring backend.','Zielpreis gespeichert. Hintergrundalarme kommen mit dem Monitoring-Backend.','Prix cible enregistré. Les alertes en arrière-plan arriveront avec le backend de suivi.','Precio objetivo guardado. Las alertas en segundo plano llegarán con el backend de monitorización.','Prezzo obiettivo salvato. Gli avvisi in background arriveranno con il backend di monitoraggio.','Doelprijs opgeslagen. Achtergrondmeldingen komen met de monitoring-backend.','Cena docelowa zapisana. Alerty w tle pojawią się wraz z backendem monitoringu.'),
    'Product saved to your wishlist.':B('Product saved to your wishlist.','Produkt zur Wunschliste hinzugefügt.','Produit enregistré dans votre liste de souhaits.','Producto guardado en tu lista de deseos.','Prodotto salvato nella lista desideri.','Product opgeslagen in je verlanglijst.','Produkt zapisany na liście życzeń.'),
    'Secure checkout could not be initialized. Please refresh the page and try again.':B('Secure checkout could not be initialized. Please refresh the page and try again.','Der sichere Checkout konnte nicht initialisiert werden. Lade die Seite neu und versuche es erneut.','Le paiement sécurisé n’a pas pu être initialisé. Actualisez la page et réessayez.','No se pudo iniciar el pago seguro. Actualiza la página e inténtalo de nuevo.','Impossibile inizializzare il checkout sicuro. Ricarica la pagina e riprova.','Veilig afrekenen kon niet worden geïnitialiseerd. Vernieuw de pagina en probeer het opnieuw.','Nie udało się zainicjalizować bezpiecznej płatności. Odśwież stronę i spróbuj ponownie.'),
    'Secure payment could not be loaded.':B('Secure payment could not be loaded.','Die sichere Zahlung konnte nicht geladen werden.','Le paiement sécurisé n’a pas pu être chargé.','No se pudo cargar el pago seguro.','Impossibile caricare il pagamento sicuro.','Veilige betaling kon niet worden geladen.','Nie udało się załadować bezpiecznej płatności.'),
    'Enter your full name and a valid email.':B('Enter your full name and a valid email.','Gib deinen vollständigen Namen und eine gültige E-Mail ein.','Saisissez votre nom complet et une adresse e-mail valide.','Introduce tu nombre completo y un correo válido.','Inserisci nome completo e un’e-mail valida.','Voer je volledige naam en een geldig e-mailadres in.','Wprowadź imię i nazwisko oraz prawidłowy e-mail.'),
    'Preparing secure payment…':B('Preparing secure payment…','Sichere Zahlung wird vorbereitet…','Préparation du paiement sécurisé…','Preparando el pago seguro…','Preparazione del pagamento sicuro…','Veilige betaling voorbereiden…','Przygotowywanie bezpiecznej płatności…'),
    'Confirming payment…':B('Confirming payment…','Zahlung wird bestätigt…','Confirmation du paiement…','Confirmando el pago…','Conferma del pagamento…','Betaling bevestigen…','Potwierdzanie płatności…'),
    'Payment could not be completed. Please try again.':B('Payment could not be completed. Please try again.','Die Zahlung konnte nicht abgeschlossen werden. Bitte versuche es erneut.','Le paiement n’a pas pu être effectué. Réessayez.','No se pudo completar el pago. Inténtalo de nuevo.','Il pagamento non è stato completato. Riprova.','De betaling kon niet worden voltooid. Probeer het opnieuw.','Nie udało się zrealizować płatności. Spróbuj ponownie.'),
    'Payment is processing. Please wait a moment.':B('Payment is processing. Please wait a moment.','Die Zahlung wird verarbeitet. Bitte warte einen Moment.','Le paiement est en cours. Veuillez patienter.','El pago se está procesando. Espera un momento.','Il pagamento è in elaborazione. Attendi un momento.','De betaling wordt verwerkt. Even geduld.','Płatność jest przetwarzana. Poczekaj chwilę.'),
    'Enter a valid email.':B('Enter a valid email.','Gib eine gültige E-Mail ein.','Saisissez une adresse e-mail valide.','Introduce un correo válido.','Inserisci un’e-mail valida.','Voer een geldig e-mailadres in.','Wprowadź prawidłowy e-mail.'),
    'Premium is already active on this account.':B('Premium is already active on this account.','Premium ist für dieses Konto bereits aktiv.','Premium est déjà actif sur ce compte.','Premium ya está activo en esta cuenta.','Premium è già attivo su questo account.','Premium is al actief op dit account.','Premium jest już aktywne na tym koncie.'),

  };
  const LOCALE_KEY = 'pricecheckr_locale';
  let locale = 'en';
  let initialized = false;
  let applying = false;
  const originalText = new WeakMap();

  function normalize(value) {
    const x = String(value || '').toLowerCase();
    const base = x.split('-')[0].split('_')[0];
    return LOCALES.includes(base) ? base : 'en';
  }
  function detect() {
    const saved = localStorage.getItem(LOCALE_KEY);
    if (saved && LOCALES.includes(saved)) return saved;
    const path = location.pathname.split('/').filter(Boolean)[0];
    if (LOCALES.includes(path)) return path;
    const langs = navigator.languages || [navigator.language || 'en'];
    for (const lang of langs) {
      const base = normalize(lang);
      if (base !== 'en' || /^en/i.test(lang)) return base;
    }
    return 'en';
  }
  function get() { return locale; }
  function meta() { return META[locale]; }
  function t(text, target=locale) {
    if (text == null) return text;
    const s = String(text);
    const exact = T[s];
    if (exact) return exact[target] || exact.en || s;
    const trimmed = s.trim();
    if (T[trimmed]) {
      const translated = T[trimmed][target] || T[trimmed].en || trimmed;
      return s.startsWith(' ') ? ' ' + translated : translated;
    }
    return s;
  }
  function keyLabel(key) {
    const normalized = String(key || '').replace(/_/g,' ');
    const map = {
      performance:'Performance', build:'Build quality', features:'Features', reliability:'Reliability', price_value:'Price value'
    };
    return t(map[key] || normalized);
  }
  function translateDynamic(text) {
    const s = String(text);
    if (T[s]) return t(s);
    let m = s.match(/^Saved (.+)$/); if (m) return `${t('Saved ')}${m[1]}`;
    m = s.match(/^Checked (.+)$/); if (m) return `${t('Checked ')}${m[1]}`;
    m = s.match(/^Target (.+) · Current (.+)$/); if (m) return `${t('Target price')} ${m[1]} · ${t('Current price')} ${m[2]}`;
    m = s.match(/^\d+ source\(s\)$/); if (m) return s.replace('source(s)', locale==='en' ? 'source(s)' : (locale==='de'?'Quellen':locale==='fr'?'sources':locale==='es'?'fuentes':locale==='it'?'fonti':locale==='nl'?'bronnen':'źródeł'));
    return s;
  }
  function translateElement(el) {
    if (!(el instanceof Element)) return;
    const attrs = ['placeholder','aria-label','title'];
    attrs.forEach(attr => {
      if (!el.hasAttribute(attr)) return;
      const originalAttr = `data-i18n-${attr}`;
      if (!el.hasAttribute(originalAttr)) el.setAttribute(originalAttr, el.getAttribute(attr));
      el.setAttribute(attr, t(el.getAttribute(originalAttr)));
    });
    if (el.matches('script,style,noscript,textarea')) return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      if (!node.parentElement || node.parentElement.closest('script,style,noscript')) return;
      if (!originalText.has(node)) originalText.set(node, node.nodeValue);
      const original = originalText.get(node);
      const translated = translateDynamic(original);
      if (translated !== node.nodeValue) node.nodeValue = translated;
    });
  }
  function apply(root=document) {
    if (applying) return;
    applying = true;
    try {
      document.documentElement.lang = META[locale].html;
      document.title = t('DEALCHECK — Know before you buy.');
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.content = t('AI shopping decision assistant. Check price, value, risks and better places to buy before you pay.');
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
      canonical.href = `${location.origin}${locale === 'en' ? '/' : `/${locale}`}`;
      document.querySelectorAll('link[data-i18n-hreflang]').forEach(x => x.remove());
      LOCALES.forEach(l => { const link=document.createElement('link'); link.rel='alternate'; link.hreflang=META[l].html; link.href=`${location.origin}${l==='en'?'':`/${l}`}`; link.setAttribute('data-i18n-hreflang','1'); document.head.appendChild(link); });
      if (root instanceof Element) translateElement(root);
      if (root.querySelectorAll) root.querySelectorAll('*').forEach(translateElement);
      renderSwitchers();
    } finally { applying = false; }
  }
  function renderSwitchers() {
    document.querySelectorAll('.language-select').forEach(select => {
      if (select.options.length !== LOCALES.length) {
        select.innerHTML = LOCALES.map(l => `<option value="${l}">${META[l].flag} ${META[l].name}</option>`).join('');
      }
      select.value = locale;
      select.setAttribute('aria-label', `${t('Language')}: ${META[locale].name}`);
    });
  }
  function set(next, persist=true, updateUrl=true) {
    const n = normalize(next);
    locale = n;
    if (persist) localStorage.setItem(LOCALE_KEY, n);
    document.documentElement.lang = META[n].html;
    document.documentElement.dir = 'ltr';
    if (updateUrl && history.replaceState) {
      const targetPath = n === 'en' ? '/' : `/${n}`;
      history.replaceState({}, '', targetPath + location.search + location.hash);
    }
    renderSwitchers();
    apply();
    window.dispatchEvent(new CustomEvent('pricecheckr:localechange', {detail:{locale:n}}));
    return n;
  }
  function init() {
    if (initialized) return;
    initialized = true;
    const saved = localStorage.getItem(LOCALE_KEY);
    locale = detect();
    if (saved && LOCALES.includes(saved)) {
      const pathLocale = location.pathname.split('/').filter(Boolean)[0];
      const desiredPath = saved === 'en' ? '/' : `/${saved}`;
      if (location.pathname !== desiredPath && history.replaceState) history.replaceState({}, '', desiredPath + location.search + location.hash);
    }
    if (location.pathname === '/en' && history.replaceState) history.replaceState({}, '', '/' + location.search + location.hash);
    document.documentElement.lang = META[locale].html;
    document.documentElement.dir = 'ltr';
    document.querySelectorAll('.language-select').forEach(select => {
      select.addEventListener('change', () => { if (window.closeMobileMenu) window.closeMobileMenu(); set(select.value, true, true); });
    });
    renderSwitchers();
    apply();
    const observer = new MutationObserver(mutations => {
      if (applying) return;
      for (const m of mutations) {
        if (m.type === 'childList') m.addedNodes.forEach(n => { if (n.nodeType === 1) apply(n); });
      }
    });
    observer.observe(document.body, {childList:true, subtree:true});
  }
  window.PriceCheckrI18n = {LOCALES,META,t,get,set,getLocale:get,keyLabel,apply,init};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
