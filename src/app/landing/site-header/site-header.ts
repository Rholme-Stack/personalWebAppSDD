import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../i18n/language.service';
import { LANGS, Lang } from '../../i18n/translations';
import { PROFILE } from '../profile';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink],
  styleUrl: './site-header.css',
  templateUrl: './site-header.html',
})
export class SiteHeader {
  private readonly language = inject(LanguageService);

  protected readonly t = this.language.t;
  protected readonly lang = this.language.lang;
  protected readonly langs = LANGS;
  protected readonly name = PROFILE.name;

  protected onLangChange(event: Event): void {
    this.language.setLang((event.target as HTMLSelectElement).value as Lang);
  }
}
