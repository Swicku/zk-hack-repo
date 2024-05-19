import { Injectable } from '@nestjs/common';

const AUTH_TOKEN = 'd2557251-949b-4f8d-aec9-901b1a3da64c';

@Injectable()
export class AuthorisationService {
  isAuthorised(authorisationHeader: string): boolean{
    return authorisationHeader === AUTH_TOKEN;
  }

  provideToken(): string {
    return AUTH_TOKEN;
  }
}
