import { ScryfallService, ScryfallCard } from './scryfall.service';
import { TxtdowdnloadService } from './txtdownload.service';

export class Decklist {
  txtList: string;
  private _pageUrl: string;
  private _txtUrl: string;
  private _output: string[] = [];
  private _parsedDeck: DecklistLine[] = [];

  get txtUrl(): string {
    if(this._txtUrl == null) {
      const slash = this.url.indexOf('/deck/') + 6;
      const hash = this.url.indexOf('#');
      const id = this.url.substring(slash, hash);
      this._txtUrl = "https://www.mtggoldfish.com/deck/download/" + id;
    }
    return this._txtUrl;
  }

  get localisedDecklist(): string[] {
    return this._output;
  }

  constructor (
    private txtDl: TxtdowdnloadService,
    private scryf: ScryfallService,
  ) {}

  get url(): string {
    return this._pageUrl;
  }
  set url(url: string) {
    this._pageUrl = url;
  }

  fetch() {
    if (!this.txtDl.validateUrl(this.url)) {
      console.error("Bad URL");
      return;
    }
    this.txtDl.getDeck(this.txtUrl).subscribe((res: string) => {
      this.txtList = res;
      // console.log("Got the deck!");
      // console.log(res);
      this.parse();
    });
  }

  async parse() {
    let lines = this.txtList.split('\n');
    let sideboardAlready = false;
    for(let i = 0; i < lines.length; i++) {
      let entry = new DecklistLine(this.scryf);
      entry.init(lines[i], i, sideboardAlready);
      if (!entry.quantity) {
        sideboardAlready = true;
      } else {
        const onError = () => {
          entry.cardnameJa = '';
          this._parsedDeck.push(entry);
          this._output[i]= entry.bilingualLine;
        };
        const onCompleted = (res) => {
          if(res.hasOwnProperty('data')) {
            if(res['data'][0]) {
              const card = new ScryfallCard(res['data'][0]);
              if (card.hasOwnProperty('printed_name')) {
                entry.cardnameJa = card.printed_name;
              } else if (card.hasOwnProperty('card_faces')) {
                entry.cardnameJa = card.card_faces[0].printed_name;
              }
              this._parsedDeck.push(entry);
              this._output[i]= entry.bilingualLine;
            }
          }
        };
        this.scryf.getCardLocalised(entry.cardnameEn, 'ja').subscribe(onCompleted, onError);
      }
    }
  };

}

export class DecklistLine {
  originalLine: string;
  order: number;
  sideboard: boolean = false;
  private _bilingualLine: string;
  private _quantity: number;
  private _cardnameEn: string;
  cardnameJa: string;

  get quantity(): number {
    if(this._quantity == null) {
      const space = this.originalLine.indexOf(' ');
      this._quantity = Number(this.originalLine.substring(0, space));
    }
    return this._quantity;
  }

  get cardnameEn(): string {
    if(this._cardnameEn == null) {
      const space = this.originalLine.indexOf(' ');
      this._cardnameEn = this.originalLine.substring(space + 1).trim();
    }
    return this._cardnameEn;
  }

  get bilingualLine(): string {
    if (!this.quantity) return '';
    if (this.cardnameJa === null) {
      console.error('Not translated yet!');
    }
    if(this._bilingualLine == null) {
      this._bilingualLine = String(this.quantity) + '《' + this.cardnameEn;
      if (this.cardnameJa != '') {
        this._bilingualLine += '/' + this.cardnameJa;
      }
      this._bilingualLine += '》';
    }
    return this._bilingualLine;
  }

  constructor (
    private scryf: ScryfallService,
  ) {}

  init(originalLine, order, sideboard) {
    this.originalLine = originalLine;
    this.order = order;
    this.sideboard = sideboard;
  }

}