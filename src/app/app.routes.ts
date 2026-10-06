import { Routes } from '@angular/router';
import { UnderConstruction } from './under-construction/under-construction';

export const routes: Routes = [{ path: '**', component: UnderConstruction }];
