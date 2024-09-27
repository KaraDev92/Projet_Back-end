// variables de jeu

const phrasesJeu = {
    "pierre-ciseaux" : "la pierre casse les ciseaux",
    "ciseaux-papier" : "les ciseaux coupent le papier",
    "papier-pierre": "le papier recouvre la pierre",
    "lezard-papier" : "le lézard mange le papier",
    "pierre-lezard" : "la pierre écrase le lézard",
    "lezard-spock" : "le lézard empoisonne Spock",
    "ciseaux-lezard" : "les ciseaux décapitent le lézard",
    "spock-pierre" : "Spock vaporise la pierre",
    "papier-spock" : "le papier discrédite Spock",
    "spock-ciseaux" : "Spock casse les ciseaux",
    "identique" : "coups identiques, égalité"
};

const reglesJeu = {
    "pierre": {"pierre": ["E", phrasesJeu["identique"]],
            "papier": [0, phrasesJeu["papier-pierre"]],
            "ciseaux": [1, phrasesJeu["pierre-ciseaux"]],
            "lezard": [1, phrasesJeu["pierre-lezard"]],
            "spock": [0, phrasesJeu["spock-pierre"]]},
    "papier": {"pierre": [1, phrasesJeu["papier-pierre"]],
            "papier": ["E", phrasesJeu["identique"]],
            "ciseaux": [0, phrasesJeu["ciseaux-papier"]],
            "lezard": [0, phrasesJeu["lezard-papier"]],
            "spock": [1, phrasesJeu["papier-spock"]]
    },
    "ciseaux": {"pierre": [0, phrasesJeu["pierre-ciseaux"]],
            "papier": [1, phrasesJeu["ciseaux-papier"]],
            "ciseaux": ["E", phrasesJeu["identique"]],
            "lezard": [1, phrasesJeu["ciseaux-lezard"]],
            "spock": [0, phrasesJeu["spock-ciseaux"]]
    },
    "lezard": {"pierre": [0, phrasesJeu["pierre-lezard"]],
            "papier": [1, phrasesJeu["lezard-papier"]],
            "ciseaux": [0, phrasesJeu["ciseaux-lezard"]],
            "lezard": ["E", phrasesJeu["identique"]],
            "spock": [1, phrasesJeu["lezard-spock"]]
    },
    "spock": {"pierre": [1, phrasesJeu["spock-pierre"]],
            "papier": [0, phrasesJeu["papier-spock"]],
            "ciseaux": [1, phrasesJeu["spock-ciseaux"]],
            "lezard": [0, phrasesJeu["lezard-spock"]],
            "spock": ["E", phrasesJeu["identique"]]
    }
};

module.exports.reglesJeu = reglesJeu;
module.exports.phrasesJeu = phrasesJeu;
