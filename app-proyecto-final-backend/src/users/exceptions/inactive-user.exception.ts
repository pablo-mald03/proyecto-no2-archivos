import { HttpStatus } from '@nestjs/common';
import { AppException } from 'src/common/exceptions/app.exception';

/* Exception when a user is inactive */
export class InactiveUserException extends AppException {
  constructor(message = 'El usuario se encuentra inactivo') {
    super('USER_INACTIVE', message, HttpStatus.FORBIDDEN);
  }
}
