import { Routes } from '@angular/router';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { LandingPage } from './components/landingpage/landing-page/landing-page';

export const routes: Routes = [

    {
        path: '',
        component: PublicLayout,
        children: [
            {
                path: '',
                component: LandingPage
            }
        ]
    },

];
