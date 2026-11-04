import { Component, ElementRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { LanguageService } from '../../i18n/language.service';
import { Translations } from '../../i18n/translations';
import { LINKEDIN } from '../../landing/profile';

export const CONTACT_LIMITS = {
  nameMax: 100,
  emailMax: 254,
  messageMin: 10,
  messageMax: 2000,
} as const;

type FieldName = 'name' | 'email' | 'message';

/** Rejects values made only of whitespace. */
const notBlank = Validators.pattern(/\S/);

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule],
  styleUrl: './contact-form.css',
  templateUrl: './contact-form.html',
})
export class ContactForm {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly t = inject(LanguageService).t;
  protected readonly linkedin = LINKEDIN;
  protected readonly noticeVisible = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, notBlank, Validators.maxLength(CONTACT_LIMITS.nameMax)]],
    email: [
      '',
      [Validators.required, Validators.email, Validators.maxLength(CONTACT_LIMITS.emailMax)],
    ],
    message: [
      '',
      [
        Validators.required,
        notBlank,
        Validators.minLength(CONTACT_LIMITS.messageMin),
        Validators.maxLength(CONTACT_LIMITS.messageMax),
      ],
    ],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.noticeVisible.set(false);
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }
    // Sending is out of scope for this feature: tell the visitor and keep what they wrote.
    this.noticeVisible.set(true);
  }

  /** Message for the first error of a field, or null if it has none or was not touched yet. */
  protected errorFor(field: FieldName): string | null {
    const control = this.form.controls[field];
    if (!control.touched || !control.errors) {
      return null;
    }
    return errorMessage(control.errors, this.t().contact.errors);
  }

  private focusFirstInvalid(): void {
    const first = (Object.keys(this.form.controls) as FieldName[]).find(
      (field) => this.form.controls[field].invalid,
    );
    this.host.nativeElement.querySelector<HTMLElement>(`#contact-${first}`)?.focus();
  }
}

function errorMessage(errors: ValidationErrors, messages: Translations['contact']['errors']) {
  if (errors['required'] || errors['pattern']) return messages.required;
  // Length goes before email: Angular's email validator also rejects emails over 254 characters.
  if (errors['maxlength']) return messages.maxLength(errors['maxlength'].requiredLength);
  if (errors['minlength']) return messages.minLength(errors['minlength'].requiredLength);
  if (errors['email']) return messages.email;
  return null;
}
