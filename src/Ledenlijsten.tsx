import React from 'react';
import csv2json from 'csvtojson';
import CryptoJS from 'crypto-js';

export interface Props{
    file: File | null;
}

type Ledenlijst = {
    groepNaam: string;
    htmlVersie: string;
}

interface State{
  ledenLijsten: Ledenlijst[];
  file: File | null;
}

type Lid = {
    voornaam: string,
    naam: string,
    geboortedatum: string,
    telefoon: string,
    gsm: string,
    groep: string
}

export default class Ledenlijsten extends React.Component<Props, State>{

    constructor(props: Props){
        super(props);
        this.state = {
            ledenLijsten: [],
            file: null
        }
    }

    private updateLijsten(file: File | null): void{
        if(file == null){
            if(this.state.file == null){
                return;
            }
            this.setState({
                ledenLijsten: [],
                file: null
            });
            return;
        }
        const reader = new FileReader();
        reader.readAsText(file);

        reader.addEventListener("load",(e)=>{
            const text = e.target != null ? e.target.result as string: "";
            csv2json({
                noheader: false,
                delimiter: ";"
            })
            .fromString(text)
            .then(jsonArray => {
                const leden = jsonArray.map(persoon => {
                    return {
                      voornaam: persoon["FIRSTNAME"] as string,
                      naam: persoon["LASTNAME"] as string,
                      geboortedatum: persoon["BIRTHDATE"] as string,
                      telefoon: persoon["PHONEP"] as string,
                      gsm: persoon["MOBILE"] as string,
                      groep: persoon["GROUPS"] as string
                    };
                }).filter(lid =>{return lid.groep !== ""});

                //Find all groups
                const groups = [...new Set(leden.map(lid => {return lid.groep}))].sort();
                
                const ledenLijsten = groups.map(group =>{
                    const groepsLeden = leden.filter(lid => {return lid.groep === group});
                    const htmlTekst = this.createLedenlijst(groepsLeden, group);
                    return {
                        groepNaam: group,
                        htmlVersie: htmlTekst
                    };
                });
                this.setState({
                    ledenLijsten: ledenLijsten,
                    file: file
                });

            });
        } );
    }

    private createLedenlijst(leden: Lid[], groepNaam: string): string{
        const sortedLeden = leden.sort((a,b) => {
            const voornaamCompare = a.voornaam.localeCompare(b.voornaam);
            if(voornaamCompare !== 0){
                return voornaamCompare;
            }
            return a.naam.localeCompare(b.naam);
        });
        const aantalKolommen = 12;
        let headerColumns = "";
        let bodyColumns = "";
        for(let i =0; i < aantalKolommen; i++){
            headerColumns += `<th class="aanwezigheid">...</th>`;
            bodyColumns += "<td>&nbsp;</td>";
        }
        

        const today = new Date().toLocaleDateString();

        let tableBody = "";
        for(let i = 0; i < sortedLeden.length; i++){
            const lid = sortedLeden[i];
            const tableRowClass = i % 2 === 0 ? "evenRow" : "oddRow";
            tableBody += 
            `<tr class="${tableRowClass}">
                <td class="labelCell">
                ${lid.voornaam} ${lid.naam}<br>&nbsp;&nbsp;
                ${lid.telefoon}<br>&nbsp;&nbsp;
                ${lid.gsm}<br>&nbsp;&nbsp;
                ${lid.geboortedatum}<br>&nbsp;&nbsp;
                </td>
                ${bodyColumns}
            </tr>`;
        }
        const aantalAanwezigenRowClass = sortedLeden.length % 2 === 0 ? "evenRow" : "oddRow";
        tableBody += 
        `<tr class="${aantalAanwezigenRowClass}">
            <td class="labelCell">Aantal aanwezigen</td>
            ${bodyColumns}
        </tr>`;

        let content = 
        `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

        <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
        <title>Aanwezigheidslijst</title>
        <style>
        body {
            font-family:"arial",Sans-Serif;
            font-size: 9px;
        }
        table {
            border-collapse:collapse;
            empty-cells:show;
        }
        th {
            font-size: 9px;
        }
        td {
            border-style:dotted;
            border-width:1px;
            font-size: 9px;
        }
        
        td.labelCell {
            padding-left: 1em;
            padding-right: 1em;
        }
        
        th.aanwezigheid {
            width: 3em;
            text-align: center;
            vertical-align: bottom;
        }
        th {
            border-style:dotted;
            border-width:1px;
        }
        tr.oddRow {
            background-color: #F8F8FF;
        }
        
        tr.evenRow {
            background-color: #DCDCDC;
        }
        </style>
        </head>
        <body>
            <h1>${groepNaam}</h1>
            <h3>Maand: </h3>
                <p>Vul elke les in de eerste rij de dag in. Plaats een X indien de zwemmer aanwezig is.</p>
                <table>
                    <tr>
                        <th>Naam<br>&nbsp;&nbsp;Tel1<br>&nbsp;&nbsp;Tel2</th>
                        ${headerColumns}
                    </tr>
                    ${tableBody}
                </table>
                <p>Gebaseerd op de Assist gegevens van ${today}.</p>
        </body>
        </html>`;
        return content;
    }

    private toBase64(input:string): string{
        var wordArray = CryptoJS.enc.Utf8.parse(input);
        return  CryptoJS.enc.Base64.stringify(wordArray);
    }

    render(){
        this.updateLijsten(this.props.file);
        const listItems = this.state.ledenLijsten.map(lijst => {
            const base64Encoded = this.toBase64(lijst.htmlVersie);
            const href = "data:application/octet-stream;charset=utf-16le;base64," + base64Encoded;
            const fileName = lijst.groepNaam + ".html";
            return (
            <li key={lijst.groepNaam}>
                <a 
                href={href}
                download={fileName}
                >
                {lijst.groepNaam}
                </a>
            </li>
            );
        });

        return (
            <ul>{listItems}</ul>
        );
        
    }
}