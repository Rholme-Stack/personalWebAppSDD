import { Component, inject } from '@angular/core';
import { Constellation } from '../constellation/constellation';
import { LanguageService } from '../i18n/language.service';
import { AboutMe } from './about-me/about-me';
import { Photos } from './photos/photos';
import { PROFILE } from './profile';
import { SiteHeader } from './site-header/site-header';
import { Stack } from './stack/stack';

@Component({
  selector: 'app-landing',
  imports: [Constellation, SiteHeader, AboutMe, Stack, Photos],
  styleUrl: './landing.css',
  templateUrl: './landing.html',
})
export class Landing {
  protected readonly t = inject(LanguageService).t;
  protected readonly name = PROFILE.name;
}
