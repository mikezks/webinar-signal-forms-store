import { computed, inject } from '@angular/core';
import { addMinutes, delegated } from '@flight-demo/shared/core';
import { mapResponse } from '@ngrx/operators';
import { signalStore, type, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { entityConfig, removeAllEntities, setAllEntities, updateEntity, upsertEntity, withEntities } from '@ngrx/signals/entities';
import { Events, injectDispatch, on, withEffects, withReducer } from '@ngrx/signals/events';
import { switchMap } from 'rxjs';
import { FlightService } from '../data-access/flight.service';
import { Flight } from '../model/flight';
import { FlightFilter } from '../model/flight-filter';
import { flightEvents } from './flight.events';


export interface BookingState {
  filter: FlightFilter;
  basket: Record<number, boolean>;
}

export const initialBookingState: BookingState = {
  filter: {
    from: 'New York',
    to: 'Paris',
    urgent: false
  },
  basket: {
    3: true,
    5: true,
  },
};

export const flightConfig = entityConfig({
  entity: type<Flight>(),
  collection: 'flight',
  // selectId: flight => flight.id
});


export const BookingStore = signalStore(
  { providedIn: 'root' },
  // State
  withState(initialBookingState),
  withEntities(flightConfig),
  // Dependency Injection Tokens
  withProps(() => ({
    _events: inject(Events),
    _flightEvents: injectDispatch(flightEvents),
    _flightService: inject(FlightService),
  })),
  // Derived State
  withComputed(store => ({
    delayedFlights: computed(
      () => store.flightEntities().filter(flight => flight.delayed)
    ),
  })),
  // Public Writable State Facade
  withMethods(store => ({
    writableFilter: delegated(
      store.filter,
      store._flightEvents.flightFilterChanged
    ),
    createFlightWithDelayUpdater: (flight: Flight) => delegated(
      () => flight,
      () => store._flightEvents.flightDelayTriggered({
        id: flight.id
      })
    ),
    createBasketSelection: (id: number) => delegated(
      () => store.basket()[id],
      selected => store._flightEvents.flightSelectionChanged(
        { id, selected }
      )
    ),
  })),
  // Updaters
  withReducer(
    on(flightEvents.flightFilterChanged, ({ payload: filter }) => ({ filter })),
    on(flightEvents.flightSelectionChanged, ({ payload: { id, selected }}, state) => ({
      basket: { ...state.basket, [id]: selected }
    })),
    on(flightEvents.flightUpdated, ({ payload: flight }) =>
      upsertEntity(flight, flightConfig)),
    on(flightEvents.flightsLoaded, ({ payload: flights }) =>
      setAllEntities(flights, flightConfig)),
    on(flightEvents.flightDelayTriggered, ({ payload: { id, min }}) =>
      updateEntity({ id, changes:
        flight => ({ ...flight, date: addMinutes(flight.date, min || 5) })
      }, flightConfig)),
    on(flightEvents.flightsResetTriggered, () => removeAllEntities(flightConfig)),
  ),
  // Side-Effects
  withEffects(({ _events, _flightService }) => ({
    loadFlights$: _events
      .on(flightEvents.flightFilterChanged).pipe(
        switchMap(({ payload: { from, to, urgent }}) => _flightService.find(from, to, urgent)),
        mapResponse({
          next: flights => flightEvents.flightsLoaded(flights),
          error: err => flightEvents.flightsLoadedError({ error: err })
        })
      ),
  })),
);
