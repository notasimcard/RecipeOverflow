import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AlertComponent } from './alert/alert.component';
import { DropdownDirective } from './dropdown.directive';
import { LoadingSpinnerComponent } from './loading-spinner.component';

@NgModule({
  declarations: [DropdownDirective, AlertComponent, LoadingSpinnerComponent],
  imports: [CommonModule],
  exports: [DropdownDirective, AlertComponent, LoadingSpinnerComponent, CommonModule]
})
export class SharedModule {
}
