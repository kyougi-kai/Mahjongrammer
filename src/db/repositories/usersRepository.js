import { baseRepository } from './baseRepository.js';

export class usersRepository extends baseRepository {
    constructor() {
        super('users');
    }
}
