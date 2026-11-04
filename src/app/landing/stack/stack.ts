import { Component, inject } from '@angular/core';
import { LanguageService } from '../../i18n/language.service';
import { STACK } from '../profile';

@Component({
  selector: 'app-stack',
  styleUrl: './stack.css',
  templateUrl: './stack.html',
})
export class Stack {
  protected readonly t = inject(LanguageService).t;
  protected readonly items = STACK;
}
