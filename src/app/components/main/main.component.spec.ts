import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MainComponent } from './main.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../app.module';
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { AppComponent } from '../../app.component';

const TRANSLATIONS_ES = require('../../../assets/i18n/es.json');
const TRANSLATIONS_EN = require('../../../assets/i18n/en.json');

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        MainComponent
      ],
      imports: [
        TranslateTestingModule,
        FormsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [ HttpClient ]
          }
        })
      ],
      providers: [ TranslateService ]
    }).compileComponents();
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load translations', () => {
    TranslateTestingModule
    .withTranslations('es', TRANSLATIONS_ES)
    .withTranslations('en', TRANSLATIONS_EN)
    .withDefaultLanguage('es');
  });
  
  it('should load and change between translations', async(() => {
    spyOn(translate, 'getBrowserLang').and.returnValue('es');
    const fixture = TestBed.createComponent(AppComponent);
    const compiled = fixture.debugElement.nativeElement;
    
    // El DOM debería estar vacío ya que no se han renderizado las traducciones aún
    expect(compiled.querySelector('#dropdownIdioma').value).toEqual('');
    
    http.expectOne('/assets/i18n/es.json').flush(TRANSLATIONS_ES);
    http.expectNone('/assets/i18n/en.json');

    // Se comprueba que no hay peticiones pendientes antes de seguir
    http.verify();

    fixture.detectChanges();
    // El contenido debería estar traducido en español ya
    expect(compiled.querySelector('#dropdownIdioma').value).toEqual(TRANSLATIONS_ES.main.language);

    // Se cambia el idioma a Inglés
    translate.use('en');
    http.expectOne('/assets/i18n/en.json').flush(TRANSLATIONS_EN);

    // Se comprueba que no hay peticiones pendientes antes de seguir de nuevo
    http.verify();

    // El DOM no debería haber renderizado aún las traducciones
    expect(compiled.querySelector('#dropdownIdioma').value).toEqual(TRANSLATIONS_ES.main.language);

    fixture.detectChanges();
    // Las traducciones en inglés ya deberían haberse renderizado
    expect(compiled.querySelector('#dropdownIdioma').value).toEqual(TRANSLATIONS_EN.main.language);
  }));
});
