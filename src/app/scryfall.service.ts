import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Decklist, DecklistLine } from './Decklist';

export class ScryfallSearchResponse {
  object: string;
  total_cards: number;
  has_more: boolean;
  data: ScryfallCard[];

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
export class ScryfallCard {
  object: string;
  id: string;
  name: string;
  printed_name: string;
  lang: string;
  card_faces: ScryfallCard[];

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

@Injectable({
  providedIn: 'root'
})
export class ScryfallService {
  baseUrl = 'https://api.scryfall.com/';

  constructor(
    private http: HttpClient
  ) {}

  getCardLocalised(cardnameEn: string, lang: string) {
    const url = this.baseUrl + 'cards/search?q=lang%3Aja+%21%22' + cardnameEn + '%22';
    return this.http.get(url);
  }

}
