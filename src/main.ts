import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then(() => {
    if ('serviceWorker' in navigator && environment.production) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((reg) => console.log('Service worker registered:', reg))
        .catch((err) =>
          console.log('Service worker registration failed:', err)
        );
    }
  })
  .catch((err) => console.log(err));
