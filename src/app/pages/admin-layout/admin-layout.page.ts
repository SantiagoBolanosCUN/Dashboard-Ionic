import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgSelectModule } from '@ng-select/ng-select';
import { FirebaseService } from 'src/app/services/firebase.service';
import { TareasService } from 'src/app/services/tareas.service';
import { Observable } from 'rxjs';
import { QuerySnapshot } from 'firebase/firestore';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.page.html',
  styleUrls: ['./admin-layout.page.scss'],
})
export class AdminLayoutPage implements OnInit {
  @ViewChild('barCanvas') public barCanvas: ElementRef;
  barChart: any;
  selectedDocentes = [];
  docentes = [];
  infoSelect;
  tareas: any[] = [];
  contIdeas: any;
  dataDocentes: any[] = [];
  GetHoras: any = 0;

  list = [];

  constructor(
    private firebaseService: FirebaseService,
    private _tareaService: TareasService
  ) {}

  filterPost = '';
  imprimir() {
    // console.log(this.selectedDocentes);
  }

  p: number = 1;

  comparar() {
    this.firebaseService.datosDashboard(this.selectedDocentes);
  }

  ionViewWillEnter() {
    this.barChartMethod();
  }

  async barChartMethod() {
    let listaDocentes = JSON.parse(localStorage.getItem('listaDocentes'));
    let horasTotales = 0;

    for (var i in listaDocentes) {
      await this.firebaseService.getInfo(i).then((res) => {
        this.contIdeas = res;
      });
      // Mostrando en pantalla la clave junto a su valor
      //console.log(this.contIdeas);

      for (let i = 0; i < this.contIdeas.length; i++) {
        // console.log(this.contIdeas[i].data().tareas);
        horasTotales += this.contIdeas[i].data().horas;
      }
      this.GetHoras = horasTotales;

      var objToSave = {
        email: listaDocentes[i].email,
        nombre: listaDocentes[i].nombre,
        horastotales: horasTotales,
      };
      this.list.push(objToSave);
    }

    localStorage.setItem('listadocenteC', JSON.stringify(this.list));

    let arrayID = [];
    this.docentes.forEach((element) => {
      arrayID.push(element.email);
    });

    let filtroNombres = arrayID.filter((uid) =>
      this.selectedDocentes.includes(arrayID)
    );

    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: filtroNombres,
        datasets: [
          {
            barPercentage: 0.8,
            barThickness: 'flex',
            label: '',
            stack: 'base',
            backgroundColor: '#899d46',
            data: [this.GetHoras, 20, 30, 32],
          },
          {
            barPercentage: 0.8,
            barThickness: 'flex',
            label: 'Mujeres',
            stack: 'Sensitivity',
            backgroundColor: '#ed7179',
            data: [20, 40, 34, 32],
          },
        ],
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
  }

  async ngOnInit() {
    let listaDocentes = JSON.parse(localStorage.getItem('listadocenteC'));
    this.docentes = Object.values(listaDocentes);
    // console.log(this.docentes);
    this.getTareas();
  }

  getTareas() {
    this._tareaService.getTarea().subscribe((data) => {
      this.tareas = [];
      data.forEach((element: any) => {
        // console.log(element.payload.doc.id);
        // console.log(element.payload.doc.data());
        this.tareas.push({
          id: element.payload.doc.id,
          ...element.payload.doc.data(), //crear objeto con el ID y toda la información
        });
      });
      localStorage.setItem('tareasDocente', JSON.stringify(this.tareas));
      // console.log(this.tareas);
    });
  }

  allData() {}
}
