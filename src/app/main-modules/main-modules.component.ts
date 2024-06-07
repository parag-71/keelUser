import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-main-modules',
  templateUrl: './main-modules.component.html',
  styleUrls: ['./main-modules.component.scss']
})
export class MainModulesComponent {
  isDesktop: any;
  @ViewChild('sidenav') sidenav: MatSidenav|any;
  constructor(private deviceService: DeviceDetectorService){
  }
  ngOnInit(){
    this.isDesktop = this.deviceService.isDesktop()
  }
  close(val:any){
    this.sidenav.open()
  }
}
