import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectHeaderTitle } from './ngrx/selectors/header.selectors';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title$!: Observable<string>;

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.title$ = this.store.pipe(select(selectHeaderTitle));
  }
}
