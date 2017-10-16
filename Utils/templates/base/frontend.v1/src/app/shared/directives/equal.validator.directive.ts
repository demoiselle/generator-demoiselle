import { Directive, forwardRef, Attribute } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';

@Directive({
    selector: '[<%= prefix.kebab %>ValidateEqual][formControlName],[<%= prefix.kebab %>ValidateEqual][formControl],[<%= prefix.kebab %>ValidateEqual][ngModel]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => EqualValidatorDirective), multi: true }
    ]
})
export class EqualValidatorDirective implements Validator {
    constructor(@Attribute('<%= prefix.kebab %>ValidateEqual') public <%= prefix.kebab %>ValidateEqual: string) {
    }

    validate(c: AbstractControl): { [key: string]: any } {
        // self value
        let v = c.value;

        // control value
        let e = c.root.get(this.<%= prefix.kebab %>ValidateEqual);

        // value equal
        if (e && v === e.value) {
            delete e.errors['<%= prefix.kebab %>ValidateEqual'];
            if (!Object.keys(e.errors).length) {
                e.setErrors(null);
            }
        }

        // value not equal
        if (e && v !== e.value) {
            e.setErrors({
                <%= prefix.kebab %>ValidateEqual: true
            });
        }

        return e ? e.errors : null;
    }
}
