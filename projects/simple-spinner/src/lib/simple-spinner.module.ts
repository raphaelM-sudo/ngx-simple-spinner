import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SpinnerComponent } from './components/spinner/spinner.component';
import { InternationalNumberPipe } from './pipes/i18n-number.pipe';
import { DeviceService } from './services/device/device.service';

@NgModule({
  declarations: [SpinnerComponent, InternationalNumberPipe],
  imports: [
    CommonModule,
    FormsModule
  ],
  providers: [
    DeviceService
  ],
  exports: [SpinnerComponent, FormsModule, InternationalNumberPipe]
})
export class SimpleSpinnerModule { }
