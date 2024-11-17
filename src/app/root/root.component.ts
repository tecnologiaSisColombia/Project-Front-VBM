import { Component, OnInit } from '@angular/core'
import { RouterOutlet } from '@angular/router'

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
  `,
  standalone: true,
  imports: [RouterOutlet],
})
<<<<<<< HEAD

=======
>>>>>>> f832f1df51e03a14c7129a12a7a4805dc022ab32
export class AppComponent implements OnInit {
  isLoading = true

  constructor() {}

  ngOnInit(): void {}
}
