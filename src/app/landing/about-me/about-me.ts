import { Component, inject } from '@angular/core';
import { LanguageService } from '../../i18n/language.service';
import { PROFILE } from '../profile';

@Component({
  selector: 'app-about-me',
  styleUrl: './about-me.css',
  templateUrl: './about-me.html',
})
export class AboutMe {
  protected readonly t = inject(LanguageService).t;
  protected readonly profile = PROFILE;
}
