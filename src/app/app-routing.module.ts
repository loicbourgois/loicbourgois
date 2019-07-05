import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SpreadComponent } from './spread/spread.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    }, {
        path: 'spread',
        component: SpreadComponent
    }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
