import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, LoadingController } from '@ionic/angular';
import { Tab1Page } from './tab1.page';
import { WeatherService } from '../services/weather.service';
import { LocationService } from '../services/location.service';
import { ReverseGeocodingService } from '../services/reverse-geocoding.service';
import { of } from 'rxjs';

describe('Tab1Page', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;
  let weatherServiceSpy = jasmine.createSpyObj('WeatherService', [
    'getWeatherData',
    'getWeatherIconUrl',
  ]);
  let locationServiceSpy = jasmine.createSpyObj('LocationService', [
    'getCurrentPosition',
  ]);
  let reverseGeocodingServiceSpy = jasmine.createSpyObj(
    'ReverseGeocodingService',
    ['getReverseGeocoding']
  );
  let loadingControllerSpy = jasmine.createSpyObj('LoadingController', [
    'create',
  ]);

  beforeEach(async () => {
    weatherServiceSpy.getWeatherData.and.returnValue(of({}));
    locationServiceSpy.getCurrentPosition.and.returnValue(
      Promise.resolve({ coords: { latitude: 0, longitude: 0 } })
    );
    reverseGeocodingServiceSpy.getReverseGeocoding.and.returnValue(
      of([{ name: 'Test City' }])
    );
    loadingControllerSpy.create.and.returnValue(
      Promise.resolve({
        present: () => Promise.resolve(),
        dismiss: () => Promise.resolve(),
      })
    );

    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), Tab1Page],
      providers: [
        { provide: WeatherService, useValue: weatherServiceSpy },
        { provide: LocationService, useValue: locationServiceSpy },
        {
          provide: ReverseGeocodingService,
          useValue: reverseGeocodingServiceSpy,
        },
        { provide: LoadingController, useValue: loadingControllerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
