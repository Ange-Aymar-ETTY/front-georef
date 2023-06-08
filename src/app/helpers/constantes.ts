export class Constantes {

  static codeErreur = {
    type: {
      Internet: '225_1',
      TimeOut: '225_2',
      Technique: '225_3',
      Metier: '225_4'
    },
    message: {
      messageAttente: 'Veuillez patienter.\nNous procédons à des vérifications.\nCette opération peut prendre quelques minutes.',
      messageInternet: 'Veuillez vérifier votre connexion et réessayez ultérieurement.',
      messageTechnique: 'Service temporairement indisponible.\nVeuillez réessayer ultérieurement.',
      messageMetier: 'Veuillez renseigner tous les champs.',
      messageTimeout: 'Votre demande n\'a pas abouti.\nVeuillez vérifier votre connexion internet et réessayez ultérieurement.',
      messageConnexionTimeout: 'Votre tentative de connexion a échoué.\nVeuillez réessayer ultérieurement.',
      messageDashboardFail: 'La mise à jour de vos données a échoué.\nVeuillez réessayer ultérieurement.'
    }
  };

  static validationMessages = {
    general: [
      { type: 'required', message: 'Ce champ est obligatoire' }
    ],
    login: [
      { type: 'required', message: 'Le login est obligatoire.' }
    ],
    password: [
      { type: 'required', message: 'Le mot de passe est obligatoire.' },
      { type: 'invalidLength', message: 'Contenir entre 8 et 20 caractères.' },
      { type: 'needMinuscule', message: 'Contenir au moins une minuscule (*)' },
      { type: 'needMajuscule', message: 'Contenir au moins une majuscule (*)' },
      { type: 'needChiffre', message: 'Contenir au moins un chiffre (*)' },
      { type: 'needNonAlpha', message: 'Contenir au moins un caractère non-alphanumérique (*)' },
      { type: 'needUnicode', message: 'Contenir au moins un caractère unicode (*)' },
      { type: 'passwordNotMatch', message: 'Les mots de passe saisis sont incorrects' },
      { type: 'passwordMatch', message: 'L\'ancien et le nouveau mot de pas sont identiques' },
    ],
    email: [
      { type: 'required', message: `L'adresse e-mail est obligatoire` },
      { type: 'email', message: `L'adresse e-mail est invalide` }
    ],
    telephone: [
      { type: 'required', message: 'Le numéro de téléphone est obligatoire' },
      { type: 'telephoneInvalid', message: 'Le numéro de téléphone est invalide' }
    ],
    noms: [
      { type: 'required', message: 'Le nom est obligatoire.' }
    ],
    prenoms: [
      { type: 'required', message: 'Le prénom est obligatoire.' }
    ],
    date: [
      { type: 'required', message: 'La date est obligatoire.' },
      { type: 'compareDate', message: 'Date incorrecte' },
    ],
    selected: [
      { type: 'required', message: 'Séléctionné un élément' }
    ],
    dates: {
      date_debut: [
        { type: 'required', message: 'La Date de début est obigatoire.' }
      ],
      date_fin: [
        { type: 'required', message: 'La Date de fin est obigatoire.' }
      ],
    }
  };

  static eventTitle = {
    toaster: {
      success: 'show-toaster',
      fail: 'show-toaster-fail',
      info: 'show-toaster-info',
    },

    loading: {
      show: 'loadingOn',
      hide: 'loadingOff'
    }
  }

  static mapTiles = {
    urlTemplate: {
      base: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      street: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    },
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
}
