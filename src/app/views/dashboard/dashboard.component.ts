import { MeterService } from './../../services/meter.service';
import { Polygone } from '../../helpers/interface';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize, map, startWith } from 'rxjs/operators';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Utilities } from 'src/app/helpers/utilities';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet-draw';
import { Constantes } from 'src/app/helpers/constantes';
import { SendService } from 'src/app/services/send.service';
import { AuthService } from 'src/app/services/authentication.service';
import { User } from 'src/app/models/user';
import { Observable } from 'rxjs';
import * as _ from "lodash";

declare var $: any;
const shadowUrl = 'assets/images/marker-shadow.png';

const COLOR_REGION = {
  color: '#222428',
  fillOpacity: 0.05,
  fillColor: '#222428',
  weight: 0.1
};

const COLOR_REGION_IN = {
  color: '#f58220',
  fillOpacity: 0.05,
  fillColor: '#f58220',
  weight: 0.5
};

const iconPostpaied = L.icon({
  iconUrl: 'assets/images/SVG/location_danger.svg',
  shadowUrl,
  iconSize: [28, 28],
  iconAnchor: [20, 41],
  popupAnchor: [0, -34],
  shadowSize: [28, 28],
  shadowAnchor: [12, 41]
});

const iconPrepaied = L.icon({
  iconUrl: 'assets/images/SVG/location_info.svg',
  shadowUrl,
  iconSize: [28, 28],
  iconAnchor: [20, 41],
  popupAnchor: [0, -34],
  shadowSize: [28, 28],
  shadowAnchor: [12, 41]
});

const iconAgence = L.icon({
  iconUrl: 'assets/images/SVG/location_agence.svg',
  shadowUrl,
  iconSize: [30, 30],
  iconAnchor: [20, 41],
  popupAnchor: [0, -34],
  shadowSize: [30, 30],
  shadowAnchor: [12, 41]
});

const iconDcu = L.icon({
  iconUrl: 'assets/images/concentrator.png',
  shadowUrl,
  iconSize: [30, 30],
  iconAnchor: [20, 41],
  popupAnchor: [0, -34],
  shadowSize: [30, 30],
  shadowAnchor: [12, 41]
});

const iconHtbt = L.icon({
  iconUrl: 'assets/images/htbt.png',
  shadowUrl,
  iconSize: [30, 30],
  iconAnchor: [20, 41],
  popupAnchor: [0, -34],
  shadowSize: [30, 30],
  shadowAnchor: [12, 41]
});

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  // Map elements
  map: L.Map;
  tiles: any;
  clusterGroupMarkerMeter = L.markerClusterGroup();
  clusterGroupMarkerRef = L.markerClusterGroup({
    iconCreateFunction(cluster) {
      return L.divIcon({
        html: `<div class='cluster-container cluster-agences'>
                <span> ${cluster.getChildCount()} </span>
              </div>`,
        className: 'clusterClass'
      })
    }
  });
  polyLayer: L.GeoJSON;
  isMapViewStreet = false;
  iconList = {
    'agence': {
      image: 'assets/images/SVG/location_agence.svg',
      icon: iconAgence
    },
    'dcu': {
      image: 'assets/images/concentrator.png',
      icon: iconDcu
    },
    'htbt': {
      image: 'assets/images/htbt.png',
      icon: iconHtbt
    },
    'postpaied': {
      image: 'assets/images/SVG/location_danger.svg',
      icon: iconPostpaied
    },
    'prepaied': {
      image: 'assets/images/SVG/location_info.svg',
      icon: iconPrepaied
    }
  };
  // Collaspse
  isSidebarCollaspse = false;
  isSidebarCollaspseSearch = false;

  // Form
  filterForm: FormGroup;
  searchForm: FormGroup;

  searchItem = [
    {
      key: 'ref_branch',
      title: 'Ref. branchement',
      minLength: 6,
      maxLength: 13
    },
    {
      key: 'id_abon',
      title: 'ID. Abonné',
      minLength: 6,
      maxLength: 12
    },
    {
      key: 'num_compteur',
      title: 'N° Compteur',
      minLength: 6,
      maxLength: 12
    }
  ];

  levels = [
    {
      name: 'Zone',
      value: 'zone'
    },
    {
      name: 'Tournée',
      value: 'tournee'
    }
  ];

  searchResult: Array<L.Marker> = [];
  currentPolygons = null;
  filterValue: any;
  lastFilter = '';
  itemSelected: Array<any> = [];
  numItemSelect = 5;
  itemListExp: any;
  itemListZone: any;
  itemListTournee: any;

  lastValueLevel = 'Zone';

  listMarkersByCode: Array<{ code: string, value: Array<any> }> = [];
  allListMarkerRef = [];
  allListMarkerRefGroup: Array<{ type: string, isCheked: boolean, data: any }>;
  listMarkerRef = [];
  numChecked = 0;
  isAllChecked = false;

  isFullScreen = false;

  user: User;
  drList: Observable<any[]>;
  drSelect: string;
  drawsGeoJson: Array<{ id, geoJson }> = [];

  constructor(
    private fb: FormBuilder,
    private _meterservice: MeterService,
    private _authService: AuthService,
    private sendService: SendService) {

    // const navigation = this.router.getCurrentNavigation();
    // if (navigation.extras.state) {
    //   const state = navigation.extras.state as { filename: string }
    //   if (state.filename) {
    //     (async () => {
    //       const file = await this.sendService.getDataFile(state.filename);
    //       const ab = await file.data.arrayBuffer();

    //       const data = TableUtil.excleToJson(ab)
    //       console.log(data);
    //     })()
    //   }
    // }

    _authService.currentUser.subscribe(user => this.user = user);

    // form polygon
    this.filterForm = this.fb.group({
      exploitation: new FormControl('', Validators.required),
      level: new FormControl('', Validators.required),
      code: new FormControl({ value: '', disabled: true })
    });

    this.filterForm.patchValue({ exploitation: 'Toutes', level: 'Zone' });

    // form serach
    this.searchForm = this.fb.group({
      column: new FormControl('', Validators.required),
      value: new FormControl('', Validators.required),
    });
  }

  get code() {
    return this.filterForm.get('code');
  }

  get exploitation() {
    return this.filterForm.get('exploitation');
  }

  get level() {
    return this.filterForm.get('level');
  }

  // search form getter
  get columnsearch() {
    return this.searchForm.get('column');
  }

  get valuesearch() {
    return this.searchForm.get('value');
  }

  ngOnInit() {
    // Get data dr
    this.drList = this._meterservice.getDrs()
      .pipe(
        map(data => {
          if (data) {
            let drs = data.map(o => {
              return {
                id: o.code,
                text: o.code + ' - ' + o.libelle
              };
            });

            if (data.length == 1) {
              this.drSelect = drs[0].id;
            }

            if (data.length > 1) {
              drs = [...drs, { id: 'ALLDR', text: 'Toutes les Dir.' }]
              this.drSelect = 'ALLDR';
            }

            return drs;
          }
        }),
      );

    // load exploitations
    this._meterservice.getData(`exploitation/list`)
      // .pipe(
      //   map(data => {
      //     if (data) {
      //       let exploitations = data.map(o => {
      //         o.selected = false;
      //         return o;
      //       });

      //       if (data.length > 1) {
      //         exploitations = [{ code: 'Toutes', libelle: 'Toutes' }, ...exploitations];
      //       }

      //       return exploitations;
      //     }
      //   })
      // )
      .subscribe(data => this.itemListExp = data);

    // load zones
    this._meterservice.getData(`zone/list`)
      .subscribe(data => {
        if (data) {
          this.itemListZone = data.map(x => {
            x.selected = false;
            return x;
          });
        }
      });

    // load tournees
    this._meterservice.getData(`tournee/list`)
      .subscribe(data => {
        if (data) {
          this.itemListTournee = data.map(x => {
            x.selected = false;
            return x;
          });
        }
      });

    // Exploitation value change
    this.exploitation.valueChanges.subscribe(d => {
      if (d == 'Toutes') {
        this.code.disable();
        this.resetMarker();
        this.itemSelected = [];
        this.listMarkersByCode = [];
        this.resetItemZone();
        this.resetItemTournee();
      } else {
        this.code.enable();
        this.code.setValue(d);
      }
    });

    // Level value change
    this.level.valueChanges
      .subscribe(d => {
        if (d != this.lastValueLevel) {
          this.resetMarker();
          this.itemSelected = [];
          this.listMarkersByCode = [];
          this.lastValueLevel == 'Zone' ? this.resetItemZone() : this.resetItemTournee();
          this.lastValueLevel = d;
          this.filterValue = null;
          this.code.setValue(this.exploitation.value);
        }
      });

    // code value change
    this.code.valueChanges.pipe(
      startWith<string | any[]>(''),
      map(value => typeof value === 'string' ? value : this.lastFilter)
    ).subscribe(value => {
      const itemList = this.getItemList();
      if (itemList) {
        this.filterValue = this.codeFilter(value, itemList, this.exploitation.value);
      }
    });
  }

  // get good ItemList zone or Tournee
  getItemList() {
    return this.level.value == 'Zone' ? this.itemListZone : this.itemListTournee;
  }

  // filter autocomplete
  codeFilter(value: string, itemList: any, exploitation: string) {
    this.lastFilter = value;
    let listItems: any;

    if (value) {
      listItems = itemList.filter(d => d.exploitation === exploitation && d.code.indexOf(value) === 0);
    } else {
      listItems = itemList.filter(d => d.exploitation === exploitation);
    }
    return listItems;
  }

  ngAfterViewInit() {
    // init map
    // setTimeout(() => {
    // chargement de la Map
    this.initMap();
    // chargement des agences
    this.loadMarkersAgences();
    // }, 500);
  }

  optionClicked(event: Event, item: any) {
    event.stopPropagation();
    if (this.itemSelected.length < this.numItemSelect) {
      item.checked = false;
      item.selected = true;
      this.itemSelected.push(item);
    }
  }

  // remove element selected
  closeOption(item: any) {
    // Put back in the options
    const itemList = this.getItemList();
    itemList.find(value => value.code == item.code).selected = false;

    // Delete in selected list
    const i = this.itemSelected.findIndex(value => value.code == item.code);
    this.itemSelected.splice(i, 1);

    // Remove marker on map
    const markers = this.getMarkers(item.code);
    if (markers) {
      this.removeMarkersToMap(markers.data, this.clusterGroupMarkerMeter);
      this.listMarkersByCode.splice(markers.index, 1);
    }
  }

  // reset all elment selected in itemListZone
  resetItemZone() {
    if (this.itemListZone) {
      this.itemListZone.forEach(item => item.selected = false);
    }
  }

  // reset all elment selected in itemListTournee
  resetItemTournee() {
    if (this.itemListTournee) {
      this.itemListTournee.forEach(item => item.selected = false);
    }
  }

  resetMarker() {
    this.listMarkersByCode.forEach(marker => this.clusterGroupMarkerMeter.removeLayers(marker.value));
    this.map.addLayer(this.clusterGroupMarkerMeter);
  }

  initMap(): void {
    // Create Map
    this.map = L
      .map('map')
      .setView([6.802209, -5.27074], 7)
      .setMinZoom(7);

    L.control.scale({ metric: true }).addTo(this.map);

    // Chargement delimitation Abidjan
    $.getJSON('assets/json-file/ci-all-region-json.json').then(geojson => {
      L.geoJSON(geojson, {
        style: (feature) => {
          let styleZone = COLOR_REGION;

          if (feature.properties?.name == 'LAGUNES (ABIDJAN)') {
            styleZone = COLOR_REGION_IN;
          }

          return styleZone;
        }
      }).addTo(this.map);
    });

    setTimeout(() => { this.mapFlyToMarker([5.343449, -4.00407], 11) }, 1500);

    this.tiles = L.tileLayer(Constantes.mapTiles.urlTemplate.base, { maxZoom: 19 });
    this.tiles.addTo(this.map);

    let drawnItems = new L.FeatureGroup().addTo(this.map);
    this.map.addControl(
      new L.Control.Draw({
        draw: {
          marker: false,
          circlemarker: false,
          rectangle: false,
          polyline: false,
          polygon: { allowIntersection: false },
          circle: { showRadius: true, metric: true },
        },
        edit: {
          featureGroup: drawnItems,
        }
      })
    );

    // L.drawLocal.draw.toolbar.actions.title = 'Annuler le dessin',
    // L.drawLocal.draw.toolbar.actions.text = 'Annuler',
    // L.drawLocal.draw.toolbar.finish.title = 'Terminer de dessin',
    // L.drawLocal.draw.toolbar.finish.text = 'Terminer',
    // L.drawLocal.draw.toolbar.undo.title = 'Supprimer le dernier point dessiné',
    // L.drawLocal.draw.toolbar.undo.text = 'Supprimer le dernier point',
    // L.drawLocal.draw.toolbar.buttons.polygon = 'Dessiner un polygone'

    this.map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer, type = event.layerType;
      drawnItems.addLayer(layer);

      const geoJson = layer.toGeoJSON();
      if (type == "circle") {
        geoJson.properties['radius'] = Math.round(layer.getRadius());
      }
      this.drawsGeoJson.push({ id: layer._leaflet_id, geoJson });
      console.log('GEOJSON ADD', this.drawsGeoJson);

      layer.on('mouseover', () => {
        let content = "";
        if (type == "polygon") {
          // Pour résoudre le problème du paramètre isMetric dans la fonction readableArea
          // go to node-module/leaflet-draw/dist/leaflet.draw.js
          // change {var a,n,o=L.Util.extend({},t,o) by this {var type;var a,n,o=L.Util.extend({},t,o)
          const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
          content = 'Superficie : ' + L.GeometryUtil.readableArea(area, true);
        }
        else if (type == "circle") {
          content = `Rayon : ${Math.round(layer.getRadius()) || NaN} m; Centre : ${layer.getLatLng()}`;
        }
        layer.bindPopup(content).openPopup();
      });

      layer.on('mouseout', () => layer.closePopup());
    });

    this.map.on(L.Draw.Event.EDITED, (event: any) => {
      event.layers.getLayers().forEach(layer => {

        const geoJson = layer.toGeoJSON();
        if (layer instanceof L.Circle) {
          geoJson.properties['radius'] = Math.round(layer.getRadius());
        }

        this.drawsGeoJson.find(x => x.id == layer._leaflet_id).geoJson = geoJson;
        console.log('GEOJSON EDIT', this.drawsGeoJson);
      })
    });

    this.map.on(L.Draw.Event.DELETED, (e) => {
      this.drawsGeoJson = [];
    })
  }

  streeView() {
    if (this.tiles) {
      this.isMapViewStreet = !this.isMapViewStreet;
      if (this.isMapViewStreet) {
        this.tiles.setUrl(Constantes.mapTiles.urlTemplate.street);
        this.tiles.addTo(this.map);
      } else {
        this.tiles.setUrl(Constantes.mapTiles.urlTemplate.base);
        this.tiles.addTo(this.map);
      }
    }
  }

  reinitZoomMap() {
    this.map.fitBounds([[5.343449, -4.00407]]);
  }

  loadMarkersAgences() {
    this._meterservice.getData(`coordonnes`).subscribe(
      (data) => {
        this.allListMarkerRef = data;
        console.log('Data', this.allListMarkerRef);

        this.allListMarkerRefGroup = _(data).groupBy('type')
          .map((value, key) => {
            return {
              type: key,
              isCheked: key == 'agence' ? true : false,
              data: value
            }
          }).value();
        this.numChecked++;

        const agences = this.allListMarkerRefGroup.find(x => x.type == "agence").data;
        this.showMarkersAgences(agences);
      }
    );
  }

  getMarkersChecked() {
    return _(this.allListMarkerRefGroup)
      .filter(x => x.isCheked)
      .map(o => o.data)
      .flatten()
      .value()
  }

  showType(item) {
    item.isCheked = !item.isCheked;
    (item.isCheked) ? this.numChecked++ : this.numChecked--;

    console.log('Nombre de fois', this.numChecked);
    let data = [];

    if (this.numChecked != this.allListMarkerRefGroup.length) {
      this.isAllChecked = false;

      data = this.getMarkersChecked();

      if (this.drSelect != 'ALLDR') {
        data = data.filter(x => x['code_dr'] == this.drSelect);
      }

      console.log('Filter data', data);
    } else {
      this.isAllChecked = true;

      data = this.allListMarkerRef;
      if (this.drSelect != 'ALLDR') {
        data = data.filter(x => x['code_dr'] == this.drSelect);
      }
    }

    this.showMarkersAgences(data);
  }

  showAll() {
    this.isAllChecked = !this.isAllChecked;
    this.allListMarkerRefGroup.forEach(item => item.isCheked = this.isAllChecked);

    let data = [];
    if (this.isAllChecked) {
      this.numChecked = this.allListMarkerRefGroup.length;
      data = this.allListMarkerRef;
      if (this.drSelect != 'ALLDR') {
        data = this.allListMarkerRef.filter(x => x['code_dr'] == this.drSelect)
      }
    } else {
      this.numChecked = 0;
    }

    this.showMarkersAgences(data);
  }

  showMarkersAgences(markers: any[]) {
    this.listMarkerRef = [];

    markers.forEach(item => {
      if (!item) return;

      let Latitude, Longitude;

      Latitude = item.latitude || null;
      Longitude = item.longitude || null;

      const options: L.MarkerOptions = {
        title: `${item.libelle}`,
        icon: this.iconList[item.type].icon
      };

      if (Latitude && Longitude) {
        const marker = L.marker([Latitude, Longitude], options);
        this.listMarkerRef.push(marker);
      }
    });

    this.clusterGroupMarkerRef.clearLayers();
    this.addMarkersToMap(this.listMarkerRef, this.clusterGroupMarkerRef);
  }

  filtercollapse() {
    this.isSidebarCollaspse = !this.isSidebarCollaspse;
  }

  searchFilter() {
    let data: any;
    if (this.exploitation.value === 'Toutes') {
      data = this.itemListExp.map(x => x.code);
    } else {
      if (this.itemSelected.length > 0) {
        data = this.itemSelected.map(x => x.code);
      } else {
        data = [this.exploitation.value];
      }
    }

    if (this.currentPolygons !== JSON.stringify(data)) {
      this.currentPolygons = JSON.stringify(data);
      if (this.polyLayer) {
        this.map.removeLayer(this.polyLayer);
      }
      this.showPolygones(data);
    }
  }

  showPolygones(data: any) {
    Utilities.Notification.emitEvent('loadingOn', 'Chargement des polygones');
    this._meterservice.getPolygones({ data })
      .pipe(finalize(() => Utilities.Notification.emitEvent('loadingOff')))
      .subscribe((polygones: Array<Polygone>) => {
        if (polygones && polygones.length > 0) {
          const geoJson: any = polygones.map(x => {
            x.location.features = x.location.features.map(y => {
              y.name = x.name;
              return y;
            });
            return x.location;
          });

          this.polyLayer = L.geoJSON(geoJson, {
            style: () => {
              const { r, g, b } = this.getRandonRGB();
              return { color: `rgb(${r},${b},${g})` };
            },

            onEachFeature: (feature: any, layer) => {
              layer.bindPopup(feature.name);
              layer.bindTooltip(feature.name);
            }
          }).addTo(this.map);

          this.map.fitBounds(this.polyLayer.getBounds());
        }
      });
  }

  meterInDraw() {
    const geoJSON = this.drawsGeoJson.map(x => x.geoJson);

    this._meterservice.getMeterInDraw(geoJSON)
      .subscribe(res => {
        console.log('RESULTAT', res);
        const listMarker = this.createMarker(res.data);
        this.addMarkersToMap(listMarker, this.clusterGroupMarkerMeter);
      })
  }

  getRandonRGB() {
    return {
      r: Math.floor(Math.random() * Math.floor(255)),
      g: Math.floor(Math.random() * Math.floor(255)),
      b: Math.floor(Math.random() * Math.floor(255))
    };
  }

  createMarker(meters: Array<any>) {
    return meters.map(item => {
      const options = {
        item,
        icon: this.iconList[item.mode].icon
      };
      const marker = L.marker([item.Latitude, item.Longitude], options);
      const markerPopupHtml = `
        <div class="popup-header">
          <h4><b>Ref. : </b>${item.ref_branch}</h4> <i class="fas fa-info-circle"></i>
        </div>
        <div class="popup-content">
          <div class="item">
            <span class='text'>Id Abon : </span> <span><b>${item.id_abon}</b></span>
          </div>
          <div class="item">
            <span class='text'>N° compteur : </span> <span><b>${item.num_compteur}</b></span>
          </div>
          <div class="item">
            <span class='text'>Psabon: </span> <span><b>${item.psabon}</b></span>
          </div>
        </div>
      `;
      const markerPopupOptions = { className: 'markerPopupClass' };
      marker.bindPopup(markerPopupHtml, markerPopupOptions);

      // Mouseover marker
      marker.on('mouseover', () => { marker.openPopup(); });
      // Mouseout marker
      marker.on('mouseout', () => { marker.closePopup(); });

      return marker;
    });
  }

  getMarkers(code: string) {
    const i = this.listMarkersByCode.findIndex(x => x.code == code);
    if (i != -1) {
      return { index: i, data: this.listMarkersByCode[i].value };
    }
    return null;
  }

  showMarkers(event: MatCheckboxChange, item: any) {
    const markers = this.getMarkers(item.code);

    if (event.checked) {
      this.removeMarkersToMap(this.searchResult, this.clusterGroupMarkerMeter);
      this.searchResult = [];
      if (markers) {
        this.addMarkersToMap(markers.data, this.clusterGroupMarkerMeter);
      } else {
        Utilities.Notification.emitEvent(Constantes.eventTitle.loading.show, `Chargement des compteurs de la ${this.level.value}: ${item.code}`);
        const column = this.levels.find(x => x.name === this.level.value).value;
        this._meterservice.metersbycode({ column, value: item.code })
          .pipe(finalize(() => Utilities.Notification.emitEvent(Constantes.eventTitle.loading.hide)))
          .subscribe(data => {
            const listMarkers = this.createMarker(data);
            this.listMarkersByCode.push({ code: item.code, value: listMarkers });

            // add to cluster
            this.addMarkersToMap(listMarkers, this.clusterGroupMarkerMeter);
          });
      }
    } else {
      this.removeMarkersToMap(markers.data, this.clusterGroupMarkerMeter);
    }
  }

  addMarkersToMap(markers: any[], cluster) {
    cluster.addLayers(markers);
    this.map.addLayer(cluster);
  }

  removeMarkersToMap(markers, cluster) {
    cluster.removeLayers(markers);
    this.map.addLayer(cluster);
  }

  mapFlyToMarker(coor: L.LatLngExpression, zoom = 18) {
    this.map.flyTo(coor, zoom, {
      animate: true,
      duration: 1.5,
    });
  }

  searchcollapse() {
    this.isSidebarCollaspseSearch = !this.isSidebarCollaspseSearch;
  }

  searchMeter() {
    if (this.searchForm.valid) {
      const data = { column: this.columnsearch.value.key, value: this.valuesearch.value };
      const meter = this.searchResult.find(x => x.options['item'][data.column] == data.value);

      if (!meter) {
        Utilities.Notification.emitEvent(Constantes.eventTitle.loading.show, `Recherche du branchement`);
        this._meterservice.searchMeter(data)
          .pipe(finalize(() => Utilities.Notification.emitEvent(Constantes.eventTitle.loading.hide)))
          .subscribe(meters => {
            if (meters && meters.length > 0) {
              // Vider la map des autres markers
              this.resetMarker();
              // Décocher tous les codes sélectionnés
              this.itemSelected.forEach(x => x.checked = false);
              // Création du marker à afficher
              const markers = this.createMarker(meters);
              this.addMarkersToMap(markers, this.clusterGroupMarkerMeter);
              this.mapFlyToMarker([
                markers[0].options['item']['Latitude'],
                markers[0].options['item']['Longitude']
              ]);
              this.searchResult = [...this.searchResult, ...markers];
            } else {
              Utilities.Notification.emitEvent(
                Constantes.eventTitle.toaster.info,
                `Le branchement n'a pas été retrouvé : ${this.valuesearch.value}`
              );
            }
          });
      } else {
        this.mapFlyToMarker([meter.options['item']['Latitude'], meter.options['item']['Longitude']]);
      }
    }
  }

  onSelectDr(e: string) {
    let markersFilter: any[];
    if (e) {
      markersFilter = this.getMarkersChecked();

      if (e != 'ALLDR') {
        markersFilter = _.filter(markersFilter, (o) => o['code_dr'] == e)
      }

      if (this.drSelect != e) {
        this.drSelect = e;
        this.showMarkersAgences(markersFilter);
      }
    }
  }
}
