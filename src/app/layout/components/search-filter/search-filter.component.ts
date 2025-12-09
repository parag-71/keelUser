import { Component, EventEmitter, Output } from '@angular/core';
import { filter, first } from 'rxjs';
import { Util } from 'src/app/core/resource/utils';
import { CommonService } from 'src/app/core/services/common.service';
import { EndUserService } from 'src/app/core/services/end-user.service';
import { DashboradService } from 'src/app/main-modules/dashborad/dashborad-service/dashborad.service';
import { ResourceService } from 'src/app/main-modules/resources/add-resources-service/resource.service';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss']
})
export class SearchFilterComponent {
  utiObj = new Util();
  public searchType: any = '1'
  @Output() dataEvent = new EventEmitter<boolean>();
  public filterSite: any
  public currentRouteName:any
  public removeFilterValue:any
  constructor(public resourceService: ResourceService,
    public commonService: CommonService,
    public dashboradService: DashboradService,
    public endUserService: EndUserService,
    public router: Router,
  ) {
    this.currentRouteName = this.router.url.split('/');
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd | any) => {
        this.currentRouteName = event.url.split('/');
        this.dashboradService.setinitialData()
      });
    this.currentRouteName[1] == 'dashboard' ? this.searchType = '1' : this.searchType = '2'
  }
  ngOnInit() {
    this.changeFilter(this.searchType)
    this.dashboradService.removeFilterLabel.subscribe((val: any) => {
      this.removeFilterValue = ''
      switch (val.index) {
        case 0:
          this.dashboradService.filterItem[0].siteName = this.removeDuplicateFilterData(this.dashboradService.filterItem[0].siteName, val.item)
          this.removeFilterCheckBox(this.commonService.searchSiteList, 'siteName', val.item)
          break;
        case 1:
          this.dashboradService.filterItem[1].roleName = this.removeDuplicateFilterData(this.dashboradService.filterItem[1].roleName, val.item)
          this.removeFilterCheckBox(this.resourceService.roleList, 'roleName', val.item)
          break;
        case 2:
          this.dashboradService.filterItem[2].licName = this.removeDuplicateFilterData(this.dashboradService.filterItem[2].licName, val.item)
          this.removeFilterCheckBox(this.resourceService.licencesList, 'licName', val.item)
          break;
        case 3:
          this.dashboradService.filterItem[3].trName = this.removeDuplicateFilterData(this.dashboradService.filterItem[3].trName, val.item)
          this.removeFilterCheckBox(this.resourceService.trainingList, 'trName', val.item)
          break;
        case 4:
          this.dashboradService.filterItem[4].comptName = this.removeDuplicateFilterData(this.dashboradService.filterItem[4].comptName, val.item)
          this.removeFilterCheckBox(this.resourceService.competenciesList, 'comptName', val.item)
          break;
        default:
      }
      this.removeFilterValue = val
      this.applyAdvanceFilter()
    })
  }

  applyAdvanceFilter() {
    this.dashboradService.displaySiteData = []
    
    let noFilterExist = (!this.dashboradService.filterItem[1].roleName.length && !this.dashboradService.filterItem[2].licName.length && !this.dashboradService.filterItem[3].trName.length && !this.dashboradService.filterItem[4].comptName.length) ? true : false
    let hasSiteRoleFilter  = this.dashboradService.filterItem[1].roleName.length
    this.dashboradService.allSiteData.filter((arrData: any) => {
      if (this.dashboradService.filterItem[0].siteName.includes(arrData.siteName) || !this.dashboradService.filterItem[0].siteName.length) {
        this.dashboradService.displaySiteData.push(JSON.parse(JSON.stringify(arrData)))
        this.dashboradService.displaySiteData[this.dashboradService.displaySiteData.length - 1].userData = []
      }
      let index = this.utiObj.getIndexOfArrayData(this.dashboradService.displaySiteData, 'siteId', arrData.siteId);
      index != -1 ? arrData.userData.filter((userData: any) => {
        if (this.dashboradService.filterItem[1].roleName.includes(userData.roleName) || noFilterExist) {
          let checkExistUser: any = this.checkUser(this.dashboradService.displaySiteData[index].userData, userData.assignId)
          checkExistUser ? '' : this.dashboradService.displaySiteData[index].userData.push(userData)
        }
      }) : ''
      if(index != -1){
      let filterArray = hasSiteRoleFilter ? this.dashboradService.displaySiteData[index].userData : arrData.userData
        JSON.parse(JSON.stringify(filterArray)).filter((userData: any) => {
          let userLicData = userData.licData.map((obj: any) => obj.licName);
          let userTrData = userData.trainingData.map((obj: any) => obj.trName);
          let userCompData = userData.comptData.map((obj: any) => obj.comptName);
          let licResult = this.areAllElementsPresent(this.dashboradService.filterItem[2].licName, userLicData)
          let trResult = this.areAllElementsPresent(this.dashboradService.filterItem[3].trName, userTrData)
          let compResult = this.areAllElementsPresent(this.dashboradService.filterItem[4].comptName, userCompData)
          if(index != -1 ){
            if(licResult && trResult && compResult){
              let checkExistUser: any = this.checkUser(this.dashboradService.displaySiteData[index].userData, userData.assignId)
              checkExistUser ? '' : this.dashboradService.displaySiteData[index].userData.push(userData)
            }else{
              const indexToRemove = this.dashboradService.displaySiteData[index].userData.findIndex((user: any) => user.assignId === userData.assignId)
              indexToRemove !== -1 ? this.dashboradService.displaySiteData[index].userData.splice(indexToRemove, 1) : '';
            }
          }
        })
      }
    })   
   
    let filterUserData = !this.dashboradService.filterItem[0].siteName.length && !this.dashboradService.filterItem[1].roleName.length && !this.dashboradService.filterItem[2].licName.length && !this.dashboradService.filterItem[3].trName.length && !this.dashboradService.filterItem[4].comptName.length
    !filterUserData ?  this.dashboradService.displaySiteData = this.dashboradService.displaySiteData.filter((obj: any) => obj.userData.length > 0) : ''
    this.dashboradService.dashboardFilterChips = JSON.parse(JSON.stringify(this.dashboradService.filterItem))
    this.checkDateIsExpired()
    this.dataEvent.emit(false);
  }
  areAllElementsPresent(arr1:any, arr2:any) {
    for (let element of arr1) {
        if (!arr2.includes(element)) {
            return false; 
        }
    }
    return true;
  }

  checkDateIsExpired(){
    this.dashboradService.displaySiteData.forEach((siteData: any) => {
      siteData.userData.forEach((user: any) => {
        let expiredSoon = 0;
        let expired = 0;
    
        const checkAndCountExpiration = (data: any[], propName: string, keyProp: string,DateProp:string) => {
          if (data.length) {
            data.forEach((filterItem: any) => {
              user[propName].forEach((val: any) => {
                if (filterItem.includes(val[keyProp]) && val[DateProp] != null) {
                  const expirationStatus = this.checkDate(val[DateProp]);
                  if (expirationStatus === 'expiredSoon') expiredSoon++;
                  else if (expirationStatus === 'expired') expired++;
                }
              });
            });
          }
        };
    
        checkAndCountExpiration(this.dashboradService.filterItem[2].licName, 'licData', 'licName','ulExpiredate');
        checkAndCountExpiration(this.dashboradService.filterItem[3].trName, 'trainingData', 'trName','utrExpiredate');
        checkAndCountExpiration(this.dashboradService.filterItem[4].comptName, 'comptData', 'comptName','ucExpiredate');
    
        user['expiredSoon'] = expiredSoon;
        user['expired'] = expired;
      });
    });
  }
  checkDate(date: string): string {
    const currentDate = new Date();
    const inputDate = this.parseDate(date);
    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setMonth(currentDate.getMonth() + 2);
    if (inputDate < currentDate) {
      return 'expired'; // Date is expired
    } else if (inputDate <= twoMonthsFromNow) {
      return 'expiredSoon'; // Date is within two months from now
    } else {
      return 'noExpired'; // Date is not expired and not within two months
    }

  }
  parseDate(dateString: string): Date {
    const [day, month, year] = dateString?.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  checkUser(data: any, id: any) {
    return data.find((value: any) => {
      return value.assignId === id
    });
  }
  removeFilter() {
    this.resourceService.roleList && this.resourceService.roleList.map((val: any) => {
      val.selected ? val.selected = false : ''
    })
    this.commonService.searchSiteList && this.commonService.searchSiteList.map((val: any) => {
      val.selected ? val.selected = false : ''
    })
    this.resourceService.licencesList && this.resourceService.licencesList.map((val: any) => {
      val.selected ? val.selected = false : ''
    })
    this.resourceService.trainingList && this.resourceService.trainingList.map((val: any) => {
      val.selected ? val.selected = false : ''
    })
    this.resourceService.competenciesList && this.resourceService.competenciesList.map((val: any) => {
      val.selected ? val.selected = false : ''
    })
    this.dashboradService.filterItem = [
      { searchType: '1', siteName: [] },
      { searchType: '2', roleName: [] },
      { searchType: '3', licName: [] },
      { searchType: '4', trName: [] },
      { searchType: '5', comptName: [] }]
    this.applyAdvanceFilter()
  }
  selectItem($event: any, data: any) {
    if ($event.checked) {
      data['searchType'] = this.searchType
      switch (this.searchType) {
        case '1':
          this.dashboradService.filterItem[0].siteName.push(data.siteName)
          break;
        case '2':
          this.dashboradService.filterItem[1].roleName.push(data.roleName)
          break;
        case '3':
          this.dashboradService.filterItem[2].licName.push(data.licName)
          break;
        case '4':
          this.dashboradService.filterItem[3].trName.push(data.trName)
          break;
        case '5':
          this.dashboradService.filterItem[4].comptName.push(data.comptName)
          break;
        default:
      }
    } else {
      switch (this.searchType) {
        case '1':
          this.dashboradService.filterItem[0].siteName = this.removeDuplicateFilterData(this.dashboradService.filterItem[0].siteName, data.siteName);
          break;
        case '2':
          this.dashboradService.filterItem[1].roleName = this.removeDuplicateFilterData(this.dashboradService.filterItem[1].roleName, data.roleName);
          break;
        case '3':
          this.dashboradService.filterItem[2].licName = this.removeDuplicateFilterData(this.dashboradService.filterItem[2].licName, data.licName);
          break;
        case '4':
          this.dashboradService.filterItem[3].trName = this.removeDuplicateFilterData(this.dashboradService.filterItem[3].trName, data.trName);
          break;
        case '5':
          this.dashboradService.filterItem[4].comptName = this.removeDuplicateFilterData(this.dashboradService.filterItem[4].comptName, data.comptName);
          break;
        default:
      }
    }
  }

  removeDuplicateFilterData(array: any, value: any) {
    return array.filter((data: any) => data != value);
  }

  removeFilterCheckBox(arrayName: any, keyName: any, value: any) {
    arrayName.map((data: any) => {
      if (data[keyName] == value) {
        data.selected = false
      }
    })
  }

  changeFilter(type: any) {
    this.searchType = type
    if (type == 1) {
      !this.commonService.searchSiteList ? this.commonService.searchFilterSiteList() : '';
    } else if (type == 2) {
      this.resourceService.getRoleList();
    } else if (type == 3) {
      this.resourceService.getLicencesList();
    } else if (type == 4) {
      this.resourceService.getTrainingRecord();
    } else if (type == 5) {
      this.resourceService.getCompetenciesList();
    }
  }
  closeFilter() {
    this.dataEvent.emit(false);
  }

}
