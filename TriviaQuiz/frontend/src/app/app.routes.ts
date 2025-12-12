import { Routes } from '@angular/router';
import { LandingPage} from './features/landing-page/landing-page';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Menu } from './features/menu/menu';
import { Create } from './features/room/create/create';
import { Join } from './features/room/join/join';
import { Quiz } from './features/quiz/quiz';
import { Scoreboard } from './features/scoreboard/scoreboard';

export const routes: Routes = [
  {
    path: '',
    component: LandingPage
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'menu',
    component: Menu
  },
  {
    path: 'create',
    component: Create
  },
  {
    path: 'join',
    component: Join
  },
  {
    path: 'quiz',
    component: Quiz
  },
  {
    path: 'scoreboard',
    component: Scoreboard
  },
  {
  path: 'room/room-menu',
  loadComponent: () =>
    import('./features/room/room-menu/room-menu').then(m => m.RoomMenu),
  },
  {
  path: 'room/create',
  loadComponent: () =>
    import('./features/room/create/create').then(m => m.Create),
  },
  {
  path: 'room/join',
  loadComponent: () =>
    import('./features/room/join/join').then(m => m.Join),
  },
  {
  path: 'quiz/:game_code',
  loadComponent: () =>
    import('./features/quiz/quiz').then(m => m.Quiz),
  },
  {
  path: 'scoreboard/:game_code',
  loadComponent: () =>
    import('./features/scoreboard/scoreboard').then(m => m.Scoreboard),
  },



];
