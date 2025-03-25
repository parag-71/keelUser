import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { CalendarOptions, EventChangeArg } from '@fullcalendar/core';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import { MatDialog } from '@angular/material/dialog';
import { CreateEventComponent } from '../create-event/create-event.component';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { DashboradService } from 'src/app/main-modules/dashborad/dashborad-service/dashborad.service';
import { EndUserService } from 'src/app/core/services/end-user.service';
import { CommonService } from 'src/app/core/services/common.service';
import * as moment from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';
import { Util } from 'src/app/core/resource/utils';
import { PreviewResourcesComponent } from 'src/app/main-modules/resources/components/preview-resources/preview-resources.component';
import { AddEditSitesComponent } from 'src/app/main-modules/sites/components/add-edit-sites/add-edit-sites.component';
import { PlannerDummyResourceComponent } from '../planner-dummy-resource/planner-dummy-resource.component';
import * as Global from '../../../../../environments/environment'
import { Router } from '@angular/router';
import { of, switchMap } from 'rxjs';
@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss']
})
export class PlannerComponent {
  selectedRange: number | null = null;
  public siteList:any
  public inicialResourceList:any
  // public filterPeriod: any;
  public calendarApi :any
  utilObj = new Util();
  selectdView:any = 'fourWeeks'
  public baseUrl = Global.environment.BASE_URL
  public viewType =[
    {name:'Look ahead - Week',id:'resourceTimelineWeek'},
    {name:'Look ahead - 2 Weeks',id:'twoWeeks'},
    {name:'Look ahead - 4 Weeks',id:'fourWeeks'},
    {name:'Look ahead - 6 Weeks',id:'sixWeeks'},
    {name:'Look ahead - 6 Months',id:'sixMonths'},
    {name:'Look ahead - 8 Months',id:'eightMonths'},
    // { name: 'Year', id: 'yearView' }, 
  ]
  @ViewChild('calander') calendarComponent: ElementRef<FullCalendarComponent> | any;
  @ViewChild('picker') picker: MatDatepicker<any> | any; 
  constructor(
      public dialog: MatDialog,
      public dashboradService:DashboradService,
      public endUserService:EndUserService,
      public commonService:CommonService,
      private cdr: ChangeDetectorRef,
      public router:Router
    ) {}
    ngOnInit() {
      this.getSiteList()
      this.getResourceList()
      this.commonService.resourcePlannerSub.subscribe((searchText: any) => {
        const lowerCaseSearchText = searchText ? searchText.toLowerCase() : ''; 
        const matchesSearchText = (item: any) => {
          return (
            (item.title && item.title.toLowerCase().includes(lowerCaseSearchText)) ||
            (item.role && item.role.toLowerCase().includes(lowerCaseSearchText))
          );
        };
        if (lowerCaseSearchText) {
          this.calendarOptions.resources = this.inicialResourceList.filter(matchesSearchText);
        } else {
          this.calendarOptions.resources = [...this.inicialResourceList]; 
        }
      })
    }
    ngAfterViewInit() {
      this.calendarApi = this.calendarComponent.getApi();
      this.cdr.detectChanges();
    }
  calendarOptions: CalendarOptions | any = {
    schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
    plugins: [resourceTimelinePlugin, interactionPlugin],
    initialView: 'fourWeeks',
    resourceAreaWidth: '250px',
    firstDay: 1,
    editable: this.commonService?.usrpermission?.usrPlannerAccess == 1 ? false :true,
    droppable: this.commonService?.usrpermission?.usrPlannerAccess == 1 ? false :true,
    eventResizableFromStart: this.commonService?.usrpermission?.usrPlannerAccess == 1 ? false :true,
    selectable: this.commonService?.usrpermission?.usrPlannerAccess == 1 ? false :true,
    stickyHeaderDates: true,
    headerToolbar: false,
    slotMinWidth: 45,
    eventMinHeight:100,
    height: 'auto',
    resources: [],
    events: [],
    resourceOrder:'title',
    views: {
      resourceTimelineMonth: {
        slotLabelFormat: {
          day: '2-digit',
          weekday: 'short'
        }
      },
      resourceTimelineWeek: {
        slotLabelFormat: {
          day: '2-digit',
          weekday: 'short'
        },
        slotDuration: { days: 1 }
      },
      fourWeeks: {
        type: 'resourceTimeline',
        duration: { weeks: 4 },
        slotDuration: { days: 1 },
        slotLabelFormat: [
          { month: 'long', year: 'numeric' },
          { weekday: 'short', day: '2-digit' }
        ],
      },
      twoWeeks: {
        type: 'resourceTimeline',
        duration: { weeks: 2 },
        slotDuration: { days: 1 },
        slotLabelFormat: [
          { month: 'long', year: 'numeric' },
          { weekday: 'short', day: '2-digit' }
        ],
      },
      sixWeeks: {
        type: 'resourceTimeline',
        duration: { weeks: 6 },
        slotDuration: { days: 1 },
        slotLabelFormat: [
          { month: 'long', year: 'numeric' },
          { weekday: 'short', day: '2-digit' }
        ],
      },
      sixMonths: {
        type: 'resourceTimeline',
        duration: { months: 6 },
        slotLabelFormat: [
          { month: 'long', year: 'numeric' },
          { weekday: 'short', day: '2-digit' }
        ],
      },
      eightMonths: {
        type: 'resourceTimeline',
        duration: { months: 8 },
        slotLabelFormat: [
          { month: 'long', year: 'numeric' },
          { weekday: 'short', day: '2-digit' }
        ],
      },
    },
    resourceLabelContent: (arg: any) => {
      const resource = arg.resource;
      const imageUrl = resource.extendedProps['imageUrl'];
      const role = resource.extendedProps['role'];
      const finalImageUrl = imageUrl ? `${this.baseUrl}${imageUrl}` : '/assets/images/profile-circle.png';
      return {
        html: `
          <div style="display: flex; gap: 10px;cursor: pointer;">
        <img src="${finalImageUrl}" alt="${resource.title}" style="width: 28px; height: 28px; border-radius: 50%; align-self: center; object-fit: cover;">
        <div style="display: flex; flex-direction: column;justify-content:center;">
          <span style="font-size:12px">${resource.title}</span>
          ${role ? `<span style="color: gray;font-size:10px;line-height:8px">${role}</span>` : ''}
        </div>
      </div>
        `
      };
    },

    eventContent: (arg: any) => {
      const event = arg.event;
      return {
        html: `
           <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 5px;">
        <span style="color: white; font-size: 13px; font-weight: 500;">${event.extendedProps.siteName}</span>
        <span class="edit-icon" style="font-size:0px;" >
         <i class="material-icons" style="color: white;font-size:18px">edit</i>
        </span>
      </div>
        `
      };
    },
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this),
    select: this.handleAddPlan.bind(this),
    eventDataTransform: this.transformEventData.bind(this),
    eventClick: this.handleUpdatePlan.bind(this),
    viewDidMount:()=>{
      // let headerCells = document.querySelectorAll('.fc-datagrid-cell-frame');
      // if (headerCells.length > 0) {
      //   let headerCell = headerCells[headerCells.length - 1] as HTMLElement;
      //   headerCell.style.justifyContent = 'space-between'
      //   let lastHeader = headerCells[headerCells.length - 1];
      //   const buttons = document.createElement('button');
      //   buttons.textContent = 'Add Resource';
      //   buttons.classList.add('planner-btn')
      //   buttons.addEventListener('click', (event) => {
      //     event.stopPropagation();
      //     this.addEditDummyRes('','Add');
      //   });
      //   lastHeader.appendChild(buttons);
      // }
    },
    resourceLabelDidMount: (info: any) => {
      info.el.addEventListener('click', () => {
        this.previewResource(info.resource)
      });
      // const resourceHeader = info.el;
      // const resourceHeaders = info.el.closest('td')
      // resourceHeaders.style.display = 'flex'
      // resourceHeader.style.justifyContent = 'space-between'
      // resourceHeader.style.alignItems = 'center'
      // if (info.resource.extendedProps.usr_type == 4) {
      //   const buttonWrapper = document.createElement('div');
      //   buttonWrapper.classList.add('button-container');
      //   const button = document.createElement('button');
      //   button.innerText = 'Update';
      //   button.classList.add('planner-btn')
      //   button.addEventListener('click', (event) => {
      //     event.stopPropagation();
      //     this.addEditDummyRes(info.resource,'Update');
      //   });
      //   buttonWrapper.appendChild(button);
      //   resourceHeader.appendChild(buttonWrapper);
      // }
    },
  };
  addEditDummyRes(data:any,type:any){
    const dialogRef = this.dialog.open(PlannerDummyResourceComponent, {
      width: '30rem',
      autoFocus: false,
      disableClose: true,
      data:{Id:data.id,type}
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result == 'success') {
        this.getResourceList()
      }
    })
  }
  isDuplicateEvent(newEvent:any) {
    return this.calendarOptions.events.some((event:any) =>
      event.usrId == newEvent.usrId && event.siteId == newEvent.siteId && moment(event.rpStartdate).format('DD-MM-YYYY') == newEvent.rpStartdate && moment(event.rpEnddate).format('DD-MM-YYYY')  == newEvent.rpEnddate
    );
  }
  filterSites(event: any) {
    const selectedSites = event.value;
    if (selectedSites.length === 0) {
      this.calendarOptions.resources = this.inicialResourceList;
    } else {
      const filteredResources = this.inicialResourceList.filter((resource: any) => {
        return resource.sites.some((siteId: any) => selectedSites.includes(siteId));
      });
      this.calendarOptions.resources = filteredResources;
    }
    this.calendarApi.refetchResources();
  }
  changeView(event: any){
    const selectedView =  event.value ?? event;
    if (this.calendarApi) {
      this.calendarApi.changeView(selectedView);
    }
  }
  handleUpdatePlan(data:any){
    if (this.commonService?.usrpermission?.usrPlannerAccess == 1) {
      data.jsEvent.preventDefault(); // Prevents default click behavior
      return; // Stop execution
    }
    const event = this.calendarApi.getEventById(data.event.id);
    this.handlePlan('edit', event);
  }
  handleAddPlan(selectInfo: any) {
    this.handlePlan('add', selectInfo);
  }
  handlePlan(actionType: 'add' | 'edit', selectInfo: any): void {
    const dialogRef = this.dialog.open(CreateEventComponent, {
      width: '25rem',
      autoFocus: false,
      disableClose: true,
      data: {
        siteList: this.siteList,
        selectInfo,
        type: actionType
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.type == 'edit' || result.type == 'add') {
        const newEvent = this.createAddUpdatePlanData(actionType,result,selectInfo)
        this.addUpdateResourcePlaner(newEvent,result.type,'');
      }else if(result == 'delete'){
        this.getResourceList()
      }else if(result == 'addSite'){
        this.openSiteDilog()
      }
    });
  }
  openSiteDilog() {
    const dialogRef = this.dialog.open(AddEditSitesComponent, {
      data: { siteData: '', from: 'add', isPlanner: true },
      width: '27rem',
      autoFocus: false,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result => {
      result == 'success' ? this.getSiteList() : ''
    })
  }
  createAddUpdatePlanData(actionType: any, formData: any, selectInfo: any) {
    const planData: any = {};
    const formatDates = (start: any, end: any) => ({
      rpStartdate: moment(start).format('DD-MM-YYYY'),
      rpEnddate: moment(end).format('DD-MM-YYYY'),
    });
  
    switch (actionType) {
      case 'add':
        Object.assign(planData, {
          usrId: selectInfo.resource.id,
          siteId: formData.formData.siteName,
          ...formatDates(formData.formData.startDates, formData.formData.endDates),
        });
        break;
  
      case 'edit':
        Object.assign(planData, {
          usrId: formData.formData.usrId,
          rpId: formData.formData.rpId,
          siteId: formData.formData.siteName,
          ...formatDates(formData.formData.startDates, formData.formData.endDates),
        });
        break;
  
      case 'resize':
        Object.assign(planData, {
          rpId: selectInfo.id,
          usrId: selectInfo.extendedProps.usrId,
          siteId: selectInfo.extendedProps.siteId,
          ...formatDates(selectInfo.start, selectInfo.end),
        });
        break;
  
      case 'drop':
        Object.assign(planData, {
          rpId: selectInfo.id,
          siteId: selectInfo.extendedProps.siteId,
          usrId: selectInfo.getResources()[0]?.id,
          ...formatDates(selectInfo.start, selectInfo.end),
        });
        break;
    }
  
    return planData;
  }
  
  handleEventResize(eventInfo: any) {
    const event = this.calendarApi.getEventById(eventInfo.event.id);
    const resizeEvent =  this.createAddUpdatePlanData('resize','',event)
    this.addUpdateResourcePlaner(resizeEvent,'reschedule',eventInfo)
  }
  handleEventDrop(eventInfo: any) {
    const event = this.calendarApi.getEventById(eventInfo.event.id);
    const resizeEvent =  this.createAddUpdatePlanData('drop','',event)
    const massageType = event.extendedProps.usrId == resizeEvent.usrId ? 'reschedule' : 'edit'
    this.addUpdateResourcePlaner(resizeEvent,massageType,eventInfo)
  }
  transformEventData(event: any) {
    return {
      ...event,
      start: event.rpStartdate, 
      end: event.rpEnddate,   
      resourceId:event.usrId  
    };
  }
  addUpdateResourcePlaner(data:any,type:any,info:any){
    if(this.isDuplicateEvent(data)){
      this.commonService.Alert('You cannot create the same planner.','warning')
      info && info.revert()
    }else{
      this.endUserService.getUserAccess({usrId:this.utilObj.getLoginUser().usrId}).pipe(
        switchMap((res:any)=>{
          this.commonService.usrpermission = res.data[0]
          if(this.commonService?.usrpermission?.usrPlannerAccess == 0){
            this.router.navigate(['/dashboard'])
            this.updateCalendarOptions()
            this.commonService.Alert('It looks like your access to planner was updated. Please contact admin for further details.','warning')
            return of(null)
          }else if(this.commonService?.usrpermission?.usrPlannerAccess == 1){
            info && info.revert()
            this.updateCalendarOptions()
            this.commonService.Alert('It looks like your access to planner was updated. Please contact admin for further details.','warning')
            return of(null)
          }else{
            this.updateCalendarOptions()
            return this.endUserService.addOrUpdateResourcePlanner(data);
          }
        })
      ).subscribe((result: any) => {
        if (result.status == '200') {
          this.getResourceList()
          const messages: any = {
            add: result.message,
            edit: 'Resource update successful.',
            reschedule: 'Resource schedule updated successfully.',
          };
          this.commonService.successAlert(messages[type]);
        } else {
          this.commonService.ApiErrAlert(result);
        }
      })
    }
  }
  
  updateCalendarOptions() {
    this.calendarOptions = {
      ...this.calendarOptions, // Keep existing properties
      editable: this.commonService?.usrpermission?.usrPlannerAccess == 1 ? false :true,
      droppable: this.commonService?.usrpermission?.usrPlannerAccess == 1 ? false :true,
      eventResizableFromStart: this.commonService?.usrpermission?.usrPlannerAccess == 1 ? false :true,
      selectable: this.commonService?.usrpermission?.usrPlannerAccess == 1 ? false :true,
    };
  }
  
  getSiteList(){
    this.endUserService.siteNameList({siteType:[0,1,2]}).subscribe((result:any)=>{
      if (result.status == '200' ){
        this.siteList = result.data
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
  getResourceList(){
    this.endUserService.resourceList({}).subscribe((result:any)=>{//1-Company Admin, 2-Admin, 3-User, 4-Dummy User
      if (result.status == '200' ){
        this.calendarOptions.resources = result.resources
        this.inicialResourceList = result.resources
        this.resourcePlannerList()
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
  
  resourcePlannerList(){
    this.endUserService.resourcePlannerList({}).subscribe((result:any)=>{
      if (result.status == '200' ){
        let fullCalendarEvents = result.resources.map((event: any) => {
          let startDate = new Date(event.rpStartdate.split("-").reverse().join("-"));
          startDate.setHours(0, 0, 0, 0); 
          let endDate = new Date(event.rpEnddate.split("-").reverse().join("-"));
          endDate.setHours(23, 59, 59, 999); 
          return {
              id: event.rpId,
              siteName: event.siteName,
              rpStartdate: startDate.toISOString(),
              rpEnddate: endDate.toISOString(),
              usrId: event.usrId,
              siteId: event.siteId,
          };
      });
      this.calendarOptions.events = fullCalendarEvents
      this.calendarApi.refetchEvents();
      this.updateEventColor()
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
  previewResource(UserData:any){
      const dialogRef = this.dialog.open(PreviewResourcesComponent, {
        data: {usrId:UserData.id,from:'planner'},
        width: '43rem',
        autoFocus: false,
        disableClose: true,
      });
  }
  onDateChange(event: any): void {
    const date = event.value;
    this.calendarApi.gotoDate(date); 
  }
  updateEventColor() {
      this.calendarOptions.events.forEach((event: any) => {
        const now = new Date();
        const eventEndDate = new Date(event.rpEnddate);
        const diff = eventEndDate.getTime() - now.getTime();
        if (diff < 0) {
          event.backgroundColor = 'rgba(255, 0, 0, 0.6)';
          event.borderColor = ' rgba(255, 0, 0, 0.6)';
        } else if (diff < 1209600000) {
          event.backgroundColor = 'rgba(255, 165, 0, 0.5)';
          event.borderColor = ' rgba(255, 165, 0, 0.5)';
        } else {
          event.backgroundColor = 'rgba(0, 128, 0, 0.5)';
          event.borderColor = ' rgba(0, 128, 0, 0.5)';
        }
      });
  }
}
