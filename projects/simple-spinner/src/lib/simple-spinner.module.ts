import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SpinnerComponent } from './components/spinner/spinner.component';
import { DeviceService } from './services/device/device.service';

@NgModule({
  declarations: [SpinnerComponent],
  imports: [
    CommonModule,
    FormsModule
  ],
  providers: [
    DeviceService
  ],
  exports: [SpinnerComponent, FormsModule]
})
export class SimpleSpinnerModule { }
