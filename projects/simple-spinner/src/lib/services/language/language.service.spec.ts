import { TestBed } from '@angular/core/testing';

import { LanguageService } from './language.service';

describe('DirectionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LanguageService = TestBed.inject(LanguageService);
    expect(service).toBeTruthy();
  });
});
