import {Body, Controller, Get, HttpStatus, Post, Headers, UnauthorizedException} from '@nestjs/common';
import {AuthorisationService} from '../authorisation.service';
import {LoginDto} from "../dto/login.dto";
import {Manager} from "../models/manager.model";
import {ManagementService} from "../management.service";


const MANAGERS_DATA = [
    {
        login: "manager1",
        password: "password"
    },
    {
        login: "manager2",
        password: "password"
    }
]

@Controller('management')
export class ManagementController {

    private managers: Manager[] = [];

    constructor(private readonly authService: AuthorisationService, private readonly managementService: ManagementService) {

        MANAGERS_DATA.forEach((managerData)=>{
            this.managers.push(
                new Manager(managerData.login, managerData.password),
            )
        })
    }

    @Post("/login")
    login(@Body() loginDto: LoginDto): string {
        for (let i = 0; i < this.managers.length; i++) {
            if (this.managers[i].login === loginDto.login && this.managers[i].password === loginDto.password) {
                return JSON.stringify({
                    code: HttpStatus.OK,
                    data: this.authService.provideToken()
                })
            }
        }

        return JSON.stringify({
            code: HttpStatus.UNPROCESSABLE_ENTITY,
            data: "Cannot authenticate"
        })
    }

    @Post("/submit-contract")
    submitVoting(@Headers('authorization') authHeader: string): Promise<boolean> {
        if (!this.authService.isAuthorized(authHeader)){
            throw new UnauthorizedException();
        }

        return this.managementService.deployContract(undefined);
    }

}
