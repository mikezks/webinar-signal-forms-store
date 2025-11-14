import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { Flight } from '../model/flight';
import { FlightFilter } from '../model/flight-filter';
import { pipe, switchMap } from 'rxjs';
import { inject } from '@angular/core';
import { FlightService } from '../data-access/flight.service';

export const BookingStore = signalStore(
  withState({
    filter: {
      from: 'New York',
      to: 'Paris',
      urgent: false
    },
    basket: {
      3: true,
      5: true
    } as Record<number, boolean>,
    flights: [] as Flight[]
  }),
  withProps(() => ({
    _flightService: inject(FlightService)
  })),
  withMethods(store => ({
    setFilter: (filter: FlightFilter) =>
      patchState(store, { filter }),
    loadFlights: rxMethod<FlightFilter>(pipe(
      switchMap(filter => store._flightService.find(
        filter.from, filter.to, filter.urgent
      ).pipe(
        tapResponse({
          next: flights => patchState(store, { flights }),
          error: err => console.error(err)
        })
      ))
    )),
  }))
)