import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookingStore, Flight, FlightFilter } from '../../logic-flight';
import { FlightCardComponent, FlightFilterComponent } from '../../ui-flight';


@Component({
  selector: 'app-flight-search',
  imports: [
    CommonModule,
    FormsModule,
    FlightCardComponent,
    FlightFilterComponent
  ],
  templateUrl: './flight-search.component.html',
})
export class FlightSearchComponent {
  private store = inject(BookingStore);

  protected filter = this.store.filter;
  protected route = computed(
    () => 'From ' + this.filter().from + ' to ' + this.filter().to + '.'
  );
  protected basket = this.store.basket;
  protected flights = this.store.flights;

  protected delay(flight: Flight): void {
    const oldFlight = flight;
    const oldDate = new Date(oldFlight.date);
    const newDate = new Date(oldDate.getTime() + 1000 * 60 * 5); // Add 5 min
    const newFlight = {
      ...oldFlight,
      date: newDate.toISOString(),
      delayed: true
    };
    const newFlights = this.flights().map(
      flight => flight.id === newFlight.id ? newFlight : flight
    );

    this.store.setFlights(newFlights);
  }
  
  protected setFilter(filter: FlightFilter): void {
    this.store.setFilter(filter);
  }

  protected updateBasket(id: number, selected: boolean): void {
    this.store.updateBasket(id, selected);
  }

  protected reset(): void {
    this.store.setFlights([]);
  }
}
