import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import { MatDialog } from '@angular/material/dialog';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { debounceTime, distinctUntilChanged, finalize, of, Subscription, switchMap } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { EndUserService } from 'src/app/core/services/end-user.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { Util } from 'src/app/core/resource/utils';
import { CreateVacancyEventComponent } from '../create-vacancy-event/create-vacancy-event.component';
import { ManagePlannerEntitiesComponent } from '../manage-planner-entities/manage-planner-entities.component';

@Component({
  selector: 'app-vacancy-planner',
  templateUrl: './vacancy-planner.component.html',
  styleUrls: ['./vacancy-planner.component.scss']
})
export class VacancyPlannerComponent {
  utilObj = new Util();
  public vacancyType: any = 'people';
  public siteList: any;
  public entityList: any = [];
  public selectedSite: any = [];
  public calendarApi: any;
  public searchText: any = '';
  public viewStart: any;
  public viewEnd: any;
  public initialEventsList: any = [];
  public planList: any = [];
  public minimumRows: number = 4;
  // Goes more negative on every "+" click so newly added blank rows always
  // sort above the previous ones (role rows start at rowIndex 1).
  private manualBlankRowIndex: number = 0;
  selectdView: any = 'fourWeeks';
  private routeSubscription!: Subscription;
  private searchSubscription!: Subscription;
  public viewType = [
    { name: 'Look ahead - Week', id: 'resourceTimelineWeek' },
    { name: 'Look ahead - 2 Weeks', id: 'twoWeeks' },
    { name: 'Look ahead - 4 Weeks', id: 'fourWeeks' },
    { name: 'Look ahead - 6 Weeks', id: 'sixWeeks' },
    { name: 'Look ahead - 6 Months', id: 'sixMonths' },
    { name: 'Look ahead - 8 Months', id: 'eightMonths' },
  ];

  /**
   * Every difference between the People and the Plant vacancy planner lives in
   * this map, so the timeline, the drag flow and the dialog stay shared.
   */
  public vacancyConfig: any = {
    people: {
      planIdKey: 'rvpId',
      entityIdKey: 'roleId',
      startKey: 'rvpStartdate',
      endKey: 'rvpEnddate',
      descriptionKey: 'rvpDescription',
      // API #75 delete param.
      deleteIdKey: 'rvpId',
      resourceAreaHeader: 'Roles',
      entityLabel: 'Role',
      updateMessage: 'Resource vacant plan updated successfully.',
      rescheduleMessage: 'Resource vacant plan rescheduled successfully.',
    },
    plant: {
      planIdKey: 'pvpId',
      entityIdKey: 'pltId',
      startKey: 'pvpStartdate',
      endKey: 'pvpEnddate',
      descriptionKey: 'pvpDescription',
      // deletePlantVacantPlan expects `pvpId` (the API sheet lists `rvpId` for
      // this row, but that's a copy/paste slip from the resource endpoint —
      // the backend takes pvpId).
      deleteIdKey: 'pvpId',
      resourceAreaHeader: 'Plant Resources',
      entityLabel: 'Plant',
      updateMessage: 'Plant vacant plan updated successfully.',
      rescheduleMessage: 'Plant vacant plan rescheduled successfully.',
    }
  };

  @ViewChild('calander') calendarComponent: ElementRef<FullCalendarComponent> | any;
  @ViewChild('picker') picker: MatDatepicker<any> | any;

  constructor(
    public dialog: MatDialog,
    public endUserService: EndUserService,
    public commonService: CommonService,
    private cdr: ChangeDetectorRef,
    public route: ActivatedRoute,
    public router: Router,
    public loaderService: LoaderService
  ) { }

  get currentConfig() {
    return this.vacancyConfig[this.vacancyType];
  }

  /**
   * Resource-column header: the label plus a gear that opens the manage dialog.
   *
   * Built as a real DOM node rather than an HTML string because FullCalendar
   * strips inline handlers, so the click listener has to be attached directly.
   */
  buildResourceAreaHeader() {
    return () => {
      const wrap = document.createElement('div');
      wrap.className = 'resource-area-header';

      const label = document.createElement('span');
      label.textContent = this.currentConfig.resourceAreaHeader;
      wrap.appendChild(label);

      const gear = document.createElement('span');
      gear.className = 'material-icons manage-entities-icon';
      gear.textContent = 'settings';
      gear.title = `Manage ${this.currentConfig.entityLabel}s`;
      gear.addEventListener('click', () => this.openManageEntities());
      wrap.appendChild(gear);

      return { domNodes: [wrap] };
    };
  }

  /**
   * Opens the manage dialog for planner-added roles/plants. On close, the
   * dropdown source and the grid are refreshed, since an entry may have been
   * renamed or deleted (a delete also removes its planner entries). If it was
   * closed through "Add to Planner", the vacancy plan dialog is opened next
   * with the picked role/plant.
   */
  openManageEntities() {
    const dialogRef = this.dialog.open(ManagePlannerEntitiesComponent, {
      data: {
        vacancyType: this.vacancyType,
        entityLabel: this.currentConfig.entityLabel,
        // Heading for the read-only section of records owned elsewhere.
        masterLabel: this.vacancyType == 'plant' ? 'Plant Resources' : 'Company Roles'
      },
      width: '25rem',
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      // 'changed' on a plain close; the same flag rides along on the object the
      // dialog returns when it closes through "Add to Planner".
      if (result == 'changed' || result?.changed) {
        this.getEntityList();
        this.getVacancyPlannerList();
      }
      if (result?.action == 'addToPlanner' && result.entity) {
        this.openPlannerForEntity(result.entity);
      }
    });
  }

  /**
   * Opens the vacancy plan dialog with the role/plant picked in the manage
   * dialog already filled in, so it doesn't have to be chosen a second time.
   *
   * That dialog is normally opened by dragging a range on the timeline, so it
   * expects a FullCalendar selection. There isn't one here, so a same-shaped
   * one-day selection starting today is built instead — `end` is exclusive, the
   * way FullCalendar sends it, and the dialog takes a day off it for its End
   * Date field. The dates stay editable in the dialog as usual.
   */
  private openPlannerForEntity(entity: any) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    this.handlePlan('add', { start, end }, entity);
  }

  /**
   * The manage dialog lists roles/plants from companyRoleList / plantList, which
   * can return records that the planner's own list endpoint does not. A picked
   * one that's missing is appended here, otherwise the dialog couldn't resolve
   * the name back to an id and Confirm would reject a valid selection.
   */
  private entityListWith(entity?: any) {
    const entityList = this.entityList || [];
    if (!entity?.entityId || entityList.some((item: any) => item.entityId == entity.entityId)) {
      return entityList;
    }
    return [...entityList, entity];
  }

  ngOnInit() {
    this.routeSubscription = this.route.data.subscribe((data: any) => {
      this.vacancyType = data?.vacancyType == 'plant' ? 'plant' : 'people';
      this.calendarOptions.resourceAreaHeaderContent = this.buildResourceAreaHeader();
      this.selectedSite = [];
      this.searchText = this.commonService.search || '';
      this.entityList = [];
      this.calendarOptions.events = [];
      this.initialEventsList = [];
      this.planList = [];
      this.calendarOptions.resources = this.buildEmptyRows();
      this.getSiteList();
      this.getEntityList();
      this.getVacancyPlannerList();
    });
    // The header search fires on every keystroke (shared input, used by all
    // modules), so it's debounced here rather than in the header — typing
    this.searchSubscription = this.commonService.vacancyPlannerSub
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((searchText: any) => {
        this.searchText = searchText || '';
        this.getVacancyPlannerList();
      });
  }

  ngAfterViewInit() {
    this.calendarApi = this.calendarComponent.getApi();
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.routeSubscription ? this.routeSubscription.unsubscribe() : '';
    this.searchSubscription ? this.searchSubscription.unsubscribe() : '';
  }

  calendarOptions: CalendarOptions | any = {
    schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
    plugins: [resourceTimelinePlugin, interactionPlugin],
    initialView: 'fourWeeks',
    resourceAreaWidth: '250px',
    resourceAreaHeaderContent: 'Resources',
    firstDay: 1,
    editable: this.commonService?.usrpermission?.usrPlannerAccess == 1 ? false : true,
    droppable: this.commonService?.usrpermission?.usrPlannerAccess == 1 ? false : true,
    eventResizableFromStart: this.commonService?.usrpermission?.usrPlannerAccess == 1 ? false : true,
    selectable: this.commonService?.usrpermission?.usrPlannerAccess == 1 ? false : true,
    stickyHeaderDates: true,
    headerToolbar: false,
    weekends: true,
    slotMinWidth: 45,
    eventMinHeight: 100,
    height: 'auto',
    resources: [],
    events: [],
    resourceOrder: 'rowIndex',
    slotLabelContent: (arg: any) => {
      const today = new Date();
      const isToday = arg.date.toDateString() === today.toDateString();
      if (arg.level === 1 && isToday) {
        return {
          html: `<div class="today-slot-label">${arg.text}</div>`
        };
      }
      return {
        html: `<div>${arg.text}</div>`
      };
    },
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
    // Shows the role / plant name with its plan description; blank drag-rows stay empty.
    resourceLabelContent: (arg: any) => {
      const description = arg.resource.extendedProps?.description;
      return {
        // The description is clamped to 3 lines in CSS; `title` carries the full
        // text so the rest is readable on hover.
        html: `<div class="vacancy-blank-resource">
                 <div style="font-weight:500;font-size: 12px;">${this.escapeHtml(arg.resource.title)}</div>
                 ${description ? `<div class="resource-description" title="${this.escapeHtml(description)}">${this.escapeHtml(description)}</div>` : ''}
               </div>`
      };
    },
    eventContent: (arg: any) => {
      const event = arg.event;
      const entityName = event.extendedProps.entityName;
      const siteName = event.extendedProps.siteName;
      const title = entityName ? `${entityName} - ${siteName}` : siteName;
      return {
        html: `
           <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 5px;">
        <span style="color: white; font-size: 13px; font-weight: 500;">${title}</span>
        <span class="edit-icon" style="font-size:0px;" >
         <i class="material-icons" style="color: white;font-size:18px">edit</i>
        </span>
      </div>
        `
      };
    },
    datesSet: this.handleDatesSet.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this),
    select: this.handleAddPlan.bind(this),
    eventClick: this.handleUpdatePlan.bind(this),
  };

  handleDatesSet(arg: any) {
    this.viewStart = arg.view.activeStart;
    this.viewEnd = arg.view.activeEnd;
    this.getVacancyPlannerList();
  }

  /** Blank placeholder rows shown before/alongside any saved vacancy plan. */
  buildEmptyRows(rowCount: number = this.minimumRows, startIndex: number = 0) {
    return Array.from({ length: rowCount }, (_, index) => ({
      id: `vacancy-row-${startIndex + index + 1}`,
      title: '',
      rowIndex: startIndex + index + 1
    }));
  }

  /** Uses roleName / pltTitle if the API sends it, else looks it up from entityList. */
  getEntityName(plan: any) {
    const config = this.currentConfig;
    const apiName = this.vacancyType == 'plant' ? plan.pltTitle : plan.roleName;
    if (apiName) {
      return apiName;
    }
    const entity = (this.entityList || []).find((item: any) => item.entityId == plan[config.entityIdKey]);
    return entity ? entity.entityName : '';
  }

  /**
   * True when a plan points at a role/plant that no longer exists.
   *
   * resourceRoleList / plantListForVacantPlanner stop returning a deleted
   * role/plant, but the plan records can still come back from the plan-list API,
   * which would render as a row with an empty name. Those get filtered out.
   */
  isOrphanPlan(plan: any): boolean {
    const entityList = this.entityList || [];
    // Before the entity list has loaded there's no way to tell an orphan from a
    // plan whose entity simply hasn't arrived yet, so keep everything. Once the
    // list arrives, getEntityList() rebuilds the rows and this runs properly.
    if (!entityList.length) {
      return false;
    }
    const entityId = plan[this.currentConfig.entityIdKey];
    return !entityList.some((item: any) => item.entityId == entityId);
  }

  createRoleSiteRow(entityId: any, entityName: any, siteId: any, siteName: any, description: any, index: number) {
    return {
      id: `role-${entityId}-site-${siteId}`,
      title: entityName || '',
      entityId,
      siteId,
      siteName: siteName || '',
      description: description || '',
      rowIndex: index + 1
    };
  }

  /**
   * Row labels are injected as raw HTML by resourceLabelContent, and the
   * description is free text the user typed, so it has to be escaped or a
   * stray `<` would break the markup (or worse, inject into the page).
   */
  escapeHtml(value: any): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  getSiteName(siteId: any) {
    const site = (this.siteList || []).find((item: any) => item.siteId == siteId);
    return site ? site.siteName : '';
  }

  private toPlanDate(value: any, isEndDate: boolean) {
    let parsedDate = moment(value, ['DD-MM-YYYY', 'YYYY-MM-DD', moment.ISO_8601], false);
    if (!parsedDate.isValid()) {
      parsedDate = moment(value);
    }
    const planDate = parsedDate.toDate();
    isEndDate ? planDate.setHours(23, 59, 59, 999) : planDate.setHours(0, 0, 0, 0);
    return planDate;
  }

  /**
   * Builds one row per role+site from resourceRoleList, drops each saved plan
   * on its matching row, and keeps a spare blank row to drag on.
   */
  buildRowsAndEvents(planList: any) {
    const config = this.currentConfig;
    const events = (planList || [])
      // Deleting a role/plant removes it from the planner's entity list, but the
      // plan records themselves can still come back from the plan-list API. Those
      // orphans would otherwise render as a row with a blank name, so drop them.
      .filter((plan: any) => !this.isOrphanPlan(plan))
      .map((plan: any) => {
      const startDate = this.toPlanDate(plan[config.startKey], false);
      const endDate = this.toPlanDate(plan[config.endKey], true);
      return {
        id: String(plan[config.planIdKey]),
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        siteId: plan.siteId,
        siteName: plan.siteName,
        entityId: plan[config.entityIdKey],
        entityName: this.getEntityName(plan),
        description: plan[config.descriptionKey],
        // `startTime` / `endTime` are reserved by FullCalendar for recurring
        // events, so the sort keys use different names.
        planStart: startDate.getTime(),
        planEnd: endDate.getTime()
      };
    }).sort((first: any, second: any) => first.planStart - second.planStart);

    // A row exists only while a plan exists for that role + site, so deleting
    // the last plan of a role also removes its row.
    const rows: any[] = [];
    events.forEach((event: any) => {
      let row = rows.find((r: any) => r.entityId == event.entityId && r.siteId == event.siteId);
      if (!row) {
        const siteName = event.siteName || this.getSiteName(event.siteId);
        row = this.createRoleSiteRow(event.entityId, event.entityName, event.siteId, siteName, event.description, rows.length);
        rows.push(row);
      }
      event.resourceId = row.id;
    });

    // Always keep at least one blank row to drag on, and pad to minimumRows.
    const blankCount = Math.max(this.minimumRows - rows.length, 1);
    this.calendarOptions.resources = [...rows, ...this.buildEmptyRows(blankCount, rows.length)];
    this.calendarOptions.events = events;
    this.initialEventsList = events;
    this.updateEventColor();
    // Push straight through the API: refetch* does not re-read a plain array
    // source, so a nested change on calendarOptions can be missed.
    if (this.calendarApi) {
      this.calendarApi.setOption('resources', this.calendarOptions.resources);
      this.calendarApi.setOption('events', this.calendarOptions.events);
    }
  }

  getSiteList() {
    this.loaderService.show();
    this.endUserService.siteNameList({ siteType: [0, 1, 2] })
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe((result: any) => {
        if (result.status == '200') {
          this.siteList = result.data;
          this.planList?.length ? this.buildRowsAndEvents(this.planList) : '';
        } else {
          this.commonService.ApiErrAlert(result);
        }
      });
  }

  getEntityList() {
    const entityApi = this.vacancyType == 'plant'
      ? this.endUserService.plantListForVacantPlanner({})
      : this.endUserService.resourceRoleList({});
    this.loaderService.show();
    entityApi.pipe(finalize(() => this.loaderService.hide())).subscribe((result: any) => {
      if (result.status == '200') {
               // Both resourceRoleList and plantListForVacantPlanner return
        // { id, title, sites }, so one mapping covers People and Plant.
        // roleType / pltType: 1 = master (Settings / Plant Resources), 2 = added
        // from this planner — only type 2 entries get an edit/delete option.
        this.entityList = (result.resources || []).map((entity: any) => ({
          entityId: entity.id ?? entity.pltId ?? entity.roleId,
          entityName: entity.title ?? entity.pltTitle ?? entity.roleName,
          entityType: entity.roleType ?? entity.pltType,
          sites: entity.sites || []
        }));
        // Plans may have loaded before the role list; rebuild so rows show.
        this.planList?.length ? this.buildRowsAndEvents(this.planList) : '';
      } else {
        this.commonService.ApiErrAlert(result);
      }
    });
  }

  getVacancyPlannerList() {
    if (!this.viewStart || !this.viewEnd) {
      return;
    }

    const config = this.currentConfig;

    const params: any = {};

    if (this.selectedSite.length > 0) {
      params.siteId = this.selectedSite;
    }

    // The header search box and the visible date range have to go to the API
    // too, otherwise it always returns the unfiltered list. Dates use the same
    // DD-MM-YYYY format as the add/update calls.
    if (this.searchText) {
      params.search = this.searchText;
    }

    const listApi = this.vacancyType == 'plant'
      ? this.endUserService.plantVacantPlannerList(params)
      : this.endUserService.resourceVacantPlannerList(params);

    this.loaderService.show();

    listApi.pipe(finalize(() => this.loaderService.hide())).subscribe((result: any) => {
      if (result.status == '200') {
        this.planList = result.resources || result.data || [];
        this.buildRowsAndEvents(this.planList);
      } else {
        this.commonService.ApiErrAlert(result);
      }
    });
  }

  handleAddPlan(selectInfo: any) {
    this.handlePlan('add', selectInfo);
  }

  handleUpdatePlan(data: any) {
    if (this.commonService?.usrpermission?.usrPlannerAccess == 1) {
      data.jsEvent.preventDefault();
      return;
    }
    const event = this.calendarApi.getEventById(data.event.id);
    this.handlePlan('edit', event);
  }

  /**
   * `preselectedEntity` is set only when this comes from the manage dialog's
   * "Add to Planner"; the timeline's own add/edit flows leave it out and the
   * dialog opens with an empty role/plant field exactly as before.
   */
  handlePlan(actionType: 'add' | 'edit', selectInfo: any, preselectedEntity?: any): void {
    // Held in a variable (rather than inlined) so the flag the dialog sets on it
    // after deleting a role/plant can be read back once the dialog closes.
    const dialogData: any = {
      siteList: this.siteList,
      entityList: this.entityListWith(preselectedEntity),
      preselectedEntityName: preselectedEntity?.entityName || '',
      vacancyType: this.vacancyType,
      vacancyConfig: this.currentConfig,
      selectInfo,
      type: actionType
    };
    const dialogRef = this.dialog.open(CreateVacancyEventComponent, {
      width: '25rem',
      autoFocus: false,
      disableClose: true,
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      // The create dialog keeps its own local copy of the entity list so it can
      // reflect in-dialog role/plant edits and deletes immediately (see
      // CreateVacancyEventComponent.refreshEntityList). Refresh the planner's own
      // copy too, on every close path, so it can't go stale — including the case
      // where the user only edited/deleted a role or plant and never submitted a
      // plan (result == 'close').
      this.getEntityList();
      if (result.type == 'edit' || result.type == 'add') {
        const newPlan = this.createAddUpdatePlanData(actionType, result, selectInfo);
        this.addUpdateVacancyPlan(newPlan, result.type, '');
      } else if (result == 'delete') {
        this.getVacancyPlannerList();
      } else if (dialogData.entityDeleted) {
        // A role/plant was deleted from inside the dialog. The backend drops its
        // planner entries too, so the grid's plan list has to be refetched or it
        // would keep showing rows for an entity that no longer exists.
        this.getVacancyPlannerList();
      }
    });
  }

  createAddUpdatePlanData(actionType: any, formData: any, selectInfo: any) {
    const config = this.currentConfig;
    const planData: any = {};
    const formatDates = (start: any, end: any) => {
      const dates: any = {};
      dates[config.startKey] = moment(start).format('DD-MM-YYYY');
      dates[config.endKey] = moment(end).format('DD-MM-YYYY');
      return dates;
    };

    switch (actionType) {
      case 'add':
        planData[config.entityIdKey] = formData.formData.entityId;
        planData.siteId = formData.formData.siteId;
        planData[config.descriptionKey] = formData.formData.description;
        Object.assign(planData, formatDates(formData.formData.startDates, formData.formData.endDates));
        break;

      case 'edit':
        planData[config.planIdKey] = formData.formData.planId;
        planData[config.entityIdKey] = formData.formData.entityId;
        planData.siteId = formData.formData.siteId;
        planData[config.descriptionKey] = formData.formData.description;
        Object.assign(planData, formatDates(formData.formData.startDates, formData.formData.endDates));
        break;

      case 'resize':
      case 'drop':
        planData[config.planIdKey] = selectInfo.id;
        planData[config.entityIdKey] = selectInfo.extendedProps.entityId;
        planData.siteId = selectInfo.extendedProps.siteId;
        planData[config.descriptionKey] = selectInfo.extendedProps.description;
        Object.assign(planData, formatDates(selectInfo.start, selectInfo.end));
        break;
    }

    return planData;
  }

  handleEventResize(eventInfo: any) {
    const event = this.calendarApi.getEventById(eventInfo.event.id);
    const resizePlan = this.createAddUpdatePlanData('resize', '', event);
    this.addUpdateVacancyPlan(resizePlan, 'reschedule', eventInfo);
  }

  handleEventDrop(eventInfo: any) {
    const event = this.calendarApi.getEventById(eventInfo.event.id);
    const dropPlan = this.createAddUpdatePlanData('drop', '', event);
    this.addUpdateVacancyPlan(dropPlan, 'reschedule', eventInfo);
  }

  isDuplicatePlan(newPlan: any) {
    const config = this.currentConfig;
    return this.calendarOptions.events.some((event: any) =>
      event.id != newPlan[config.planIdKey] &&
      event.entityId == newPlan[config.entityIdKey] &&
      event.siteId == newPlan.siteId &&
      moment(event.start).format('DD-MM-YYYY') == newPlan[config.startKey] &&
      moment(event.end).format('DD-MM-YYYY') == newPlan[config.endKey]
    );
  }

  addUpdateVacancyPlan(data: any, type: any, info: any) {
    if (this.isDuplicatePlan(data)) {
      this.commonService.Alert('You cannot create the same vacancy planner.', 'warning');
      info && info.revert();
      return;
    }
    this.loaderService.show();
    this.endUserService.getUserAccess({ usrId: this.utilObj.getLoginUser().usrId }).pipe(
      switchMap((res: any) => {
        this.commonService.usrpermission = res.data[0];
        if (this.commonService?.usrpermission?.usrPlannerAccess == 0) {
          this.router.navigate(['/dashboard']);
          this.updateCalendarOptions();
          this.commonService.Alert('It looks like your access to planner was updated. Please contact admin for further details.', 'warning');
          return of(null);
        } else if (this.commonService?.usrpermission?.usrPlannerAccess == 1) {
          info && info.revert();
          this.updateCalendarOptions();
          this.commonService.Alert('It looks like your access to planner was updated. Please contact admin for further details.', 'warning');
          return of(null);
        } else {
          this.updateCalendarOptions();
          return this.vacancyType == 'plant'
            ? this.endUserService.addOrUpdatePlantVacantPlanner(data)
            : this.endUserService.addOrUpdateResourceVacantPlanner(data);
        }
      }),
      finalize(() => this.loaderService.hide())
    ).subscribe((result: any) => {
      if (!result) {
        return;
      }
      if (result.status == '200') {
        this.getVacancyPlannerList();
        const messages: any = {
          add: result.message,
          edit: this.currentConfig.updateMessage,
          reschedule: this.currentConfig.rescheduleMessage,
        };
        this.commonService.successAlert(messages[type]);
      } else {
        this.commonService.ApiErrAlert(result);
      }
    });
  }

  updateCalendarOptions() {
    this.calendarOptions = {
      ...this.calendarOptions,
      editable: this.commonService?.usrpermission?.usrPlannerAccess == 1 ? false : true,
      droppable: this.commonService?.usrpermission?.usrPlannerAccess == 1 ? false : true,
      eventResizableFromStart: this.commonService?.usrpermission?.usrPlannerAccess == 1 ? false : true,
      selectable: this.commonService?.usrpermission?.usrPlannerAccess == 1 ? false : true,
    };
  }

  isAllSelected(): boolean {
    return this.siteList?.length && this.selectedSite?.length === this.siteList?.length;
  }

  isIndeterminate(): boolean {
    return this.selectedSite?.length && this.selectedSite.length < this.siteList.length;
  }

  toggleAllSelection(change: MatCheckboxChange): void {
    if (change.checked) {
      this.selectedSite = this.siteList.map((site: any) => site.siteId);
    } else {
      this.selectedSite = [];
    }
    this.filterSites();
  }

  filterSites() {
    this.getVacancyPlannerList();
  }

  /**
   * Drops one blank row at the very top of the resource list on demand, so
   * planners with a long roster don't have to scroll down to reach an empty
   * row before they can drag out a new vacancy plan. Triggered by the "+"
   * button in the toolbar (see vacancy-planner.component.html).
   */
  addBlankRow() {
    this.manualBlankRowIndex--;
    const newRow = {
      id: `manual-blank-row-${Date.now()}`,
      title: '',
      rowIndex: this.manualBlankRowIndex
    };
    this.calendarOptions.resources = [newRow, ...(this.calendarOptions.resources || [])];
    if (this.calendarApi) {
      this.calendarApi.setOption('resources', this.calendarOptions.resources);
    }
  }

  changeView(event: any) {
    const selectedView = event.value ?? event;
    if (this.calendarApi) {
      this.calendarApi.changeView(selectedView);
    }
  }

  onDateChange(event: any): void {
    const date = event.value;
    this.calendarApi.gotoDate(date);
  }

  updateEventColor() {
    this.calendarOptions.events.forEach((event: any) => {
      const now = new Date();
      const eventEndDate = new Date(event.end);
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
