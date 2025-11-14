import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { injectDispatch } from '@ngrx/signals/events';
import { BookingStore } from '../../logic-flight';
import { flightEvents } from '../../logic-flight/state/flight.events';
import { FlightCardComponent, FlightFilterComponent } from '../../ui-flight';


@Component({
  standalone: true,
  imports: [
    JsonPipe,
    FlightCardComponent,
    FlightFilterComponent
  ],
  selector: 'app-flight-search',
  templateUrl: './flight-search.component.html',
})
export class FlightSearchComponent {
  protected store = inject(BookingStore);
  protected flightEvents = injectDispatch(flightEvents);
}
