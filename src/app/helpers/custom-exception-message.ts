import { Constantes } from './constantes';


export class CustomExceptionMessage {
    Text: string;
    Code: string;

    constructor(Text: string, Code: string = Constantes.codeErreur.type.Metier) {
        this.Code = Code;
        this.Text = Text;
    }

    static getExceptionTechnique() {
        return new CustomExceptionMessage(Constantes.codeErreur.message.messageTechnique, Constantes.codeErreur.type.Technique);
    }

    static getExceptionTimeout() {
        return new CustomExceptionMessage(Constantes.codeErreur.message.messageTimeout, Constantes.codeErreur.type.TimeOut);
    }
    static getExceptionInternet() {
        return new CustomExceptionMessage(Constantes.codeErreur.message.messageInternet, Constantes.codeErreur.type.Internet);
    }
}
