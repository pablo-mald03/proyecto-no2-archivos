import { HttpStatus } from '@nestjs/common';
import { AppException } from 'src/common/exceptions/app.exception';

/* Exception when the owner of a shared resource is inactive */
export class InactiveOwnerException extends AppException {
  constructor(message = 'El propietario del recurso se encuentra inactivo') {
    super('INACTIVE_OWNER', message, HttpStatus.FORBIDDEN);
  }
}
