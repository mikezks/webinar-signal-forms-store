import { httpResource } from '@angular/common/http';
import { Component, input, numberAttribute, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Field, form } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { initialPassenger, Passenger } from '../../logic-passenger';


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
  protected passenger = signal(initialPassenger);
  
  // (2) Field State: valid, touched, dirty, value, readonly, disabled, ...
  protected editForm = form(this.passenger);

  readonly id = input(0, { transform: numberAttribute });
  protected readonly passengerResource = httpResource<Passenger>(() => ({
    url: 'https://demo.angulararchitects.io/api/passenger',
    params: { id: this.id() }
  }), { defaultValue: initialPassenger });

  protected save(): void {
    // this.passengerResource.set(this.editForm.getRawValue());
    console.log(this.editForm().value());
    console.log(this.passenger());
  }
}
