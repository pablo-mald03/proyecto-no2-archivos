import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout {

  constructor(
    private readonly router: Router
  ) { }

  //Method to return to the landing page
  goToLanding(): void {
    this.router.navigate(['/']);
  }


}
