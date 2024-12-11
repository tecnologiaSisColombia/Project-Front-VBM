import { Component, OnInit } from '@angular/core'
import { RouterOutlet } from '@angular/router'

@Component({
  selector: 'app-blank',
  templateUrl: './blank.component.html',
  styleUrls: ['./blank.component.css'],
  standalone: true,
  imports: [RouterOutlet],
})

export class BlankComponent implements OnInit {
  isCollapsed = false

  constructor() {}

  ngOnInit(): void {}
}
