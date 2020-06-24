import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { DataStorageService } from '../shared/data-storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnDestroy, OnInit {
  isAuthenticated = false;
  dataSub: Subscription;
  userSub: Subscription;

  constructor(private dataStorageService: DataStorageService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  saveRecipes() {
    this.dataStorageService.saveRecipes();
  }

  getRecipes() {
    this.dataSub = this.dataStorageService.getRecipes().subscribe();
  }

  ngOnDestroy(): void {
    this.dataSub.unsubscribe();
  }

  onLogOut(): void {
    this.authService.logout();
  }
}
