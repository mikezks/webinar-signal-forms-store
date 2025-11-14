import { httpResource } from '@angular/common/http';
import { Component, input, numberAttribute } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { customError, Field, form, required, schema, validate } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { initialPassenger, Passenger } from '../../logic-passenger';

export const passengerSchema = schema<Passenger>(passengerPath => {
  required(passengerPath.name);
  required(passengerPath.firstName);
  validate(passengerPath.name, ({ value }) => {
    if (value() !== 'Walker') {
      return customError({
        kind: 'lastnameCheck',
        message: 'Please enter a valid lastname - currently passengers need to be called "Walker".'
      });
    }

    return null;
  })
});

@Component({
  selector: 'app-passenger-edit',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    // (4) UI Controls: Template Bindings
    Field
  ],
  templateUrl: './passenger-edit.component.html'
})
export class PassengerEditComponent {
  // (1) Data Model: Writable Signal
  protected readonly passengerResource = httpResource<Passenger>(() => ({
    url: 'https://demo.angulararchitects.io/api/passenger',
    params: { id: this.id() }
  }), { defaultValue: initialPassenger });
  
  // (2) Field State: valid, touched, dirty, value, readonly, disabled, ...
  protected editForm = form(this.passengerResource.value, passengerSchema);

  readonly id = input(0, { transform: numberAttribute });

  protected save(): void {
    // this.passengerResource.set(this.editForm.getRawValue());
    console.log(this.editForm().value());
  }
}
