import { Component, inject } from '@angular/core';
import { LanguageService } from '../../i18n/language.service';

@Component({
  selector: 'app-photos',
  styleUrl: './photos.css',
  templateUrl: './photos.html',
})
export class Photos {
  protected readonly t = inject(LanguageService).t;
}
