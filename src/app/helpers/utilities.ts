import Swal from 'sweetalert2';
export namespace Utilities {

  /**
   * @description Expose des méthodes utiles pour afficher des alertes
   */
  export class Notification {

    /**
     * Attache un event à la page
     * @param eventName - nom de l'évènement
     * @param func - fonction callback
     */
    static bindEvent(eventName: string, func: any) {
      window.addEventListener(eventName, func);
    }
    /**
     * Déclecnche un event associé au nom passé en paramètres
     * @param eventName - nom de l'évèvement
     */
    static emitEvent(eventName: string, data: any = null) {
      if (data) {
        const ev = new CustomEvent(eventName, { detail: { message: data } });
        window.dispatchEvent(ev);
      } else {
        window.dispatchEvent(new Event(eventName));
      }
    }

    static showAlertWithOk(title: string, description: string = '') {
      return Swal.fire({
        title,
        text: description,
        showCancelButton: true,
        confirmButtonColor: '#f0a020',
        cancelButtonColor: '#a0a0a0',
        confirmButtonText: 'Confirmer',
        cancelButtonText: 'Annuler',
      });
    }

    static showAlertWithDownload() {
      return Swal.fire({
        title: 'Le traitement de votre fichier est terminé !',
        text: `Choisir l'une des options pour y accéder`,
        icon: 'success',
        showCancelButton: true,
        confirmButtonColor: '#f3a323de',
        cancelButtonColor: '#696c6acf',
        confirmButtonText: '<i class="fas fa-download"></i> Télécharger',
        cancelButtonText: '<i class="fas fa-share"></i> Transférer',
      });
    }
  }
}
