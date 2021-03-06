import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TxtdowdnloadService {
  private proxy = '';

  constructor(
    private http: HttpClient
  ) {
    // Get your own proxy. Mine only works for https://alecrem.github.io/decklisto/
    this.proxy = 'https://apps.alecrem.com/decklisto/mtggoldfish.php?url=';
  }

  getDeck(url: string) {
    return this.http.get(this.proxy + url, { responseType: 'text' });
  }

  validateUrl(url): boolean {
    const urlregex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i;
    if (urlregex.test(url)) return true;
    return false;
  }
}
