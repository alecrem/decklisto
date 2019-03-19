import { ScryfallService, ScryfallCard } from './scryfall.service';
import { TxtdowdnloadService } from './txtdownload.service';

export class Decklist {
  txtList: string;
  private _pageUrl: string;
  private _txtUrl: string;
  private _output: string[] = [];

  get txtUrl(): string {
    if(this._txtUrl == null) {
      const slash = this.url.indexOf('/deck/') + 6;
      const hash = this.url.indexOf('#');
      const id = this.url.substring(slash, hash);
      this._txtUrl = "https://www.mtggoldfish.com/deck/download/" + id;
    }
    return this._txtUrl;
  }

  get localisedDecklist(): string {
    return this._output.join('\n');
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
      console.log("Got the deck!");
      console.log(res);
      this.parse();
    });
  }

  async parse() {
    for(const line of this.txtList.split('\n')) {
      let entry = new DecklistLine(this.scryf);
      entry.init(line);
      const onError = () => {
        entry.cardnameJa = '';
        console.log(entry.bilingualLine);
        this._output.push(entry.bilingualLine);
        if(this._output.length >= this.txtList.split('\n').length) {
          console.log(this._output.join('\n'));
        }
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
            console.log(entry.bilingualLine);
            this._output.push(entry.bilingualLine);
            if(this._output.length >= this.txtList.split('\n').length) {
              console.log(this._output.join('\n'));
            }
          }
        }
      };
      this.scryf.getCardLocalised(entry.cardnameEn, 'ja').subscribe(onCompleted, onError);
    }
  };

}

export class DecklistLine {
  originalLine: string;
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

  init(line) {
    this.originalLine = line;
  }

}