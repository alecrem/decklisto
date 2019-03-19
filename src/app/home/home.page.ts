import { Component } from '@angular/core';
import { TxtdowdnloadService } from '../txtdownload.service';
import { Decklist, DecklistLine } from '../Decklist';
import { ScryfallService } from '../scryfall.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  deck: Decklist;
  private _decklisturl: string = 'https://www.mtggoldfish.com/deck/1361334#paper';

  constructor(
    private txtDl: TxtdowdnloadService,
    private scryf: ScryfallService,
  ) { }

  get decklisturl(): string {
    return this._decklisturl;
  }
  set decklisturl(url) {
    if(url && url != this._decklisturl) {
      const sanitisedUrl = url.trim();
      if (this.txtDl.validateUrl(sanitisedUrl)) {
        this._decklisturl = url.trim();
      } else {
        console.error("Bad URL");
      }
    }
  }

  fetch() {
    this.deck = new Decklist(this.txtDl, this.scryf);
    this.deck.url = this.decklisturl;
    this.deck.fetch();
  }

  get localisedDecklist(): string[] {
    if(this.deck) return this.deck.localisedDecklist;
    return [];
  }
}
