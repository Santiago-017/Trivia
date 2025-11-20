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
  }
];
