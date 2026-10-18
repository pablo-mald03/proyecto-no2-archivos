import { ResourceNotFoundException } from "src/common/exceptions/resource-not-found.exception";

//Principal setting not found exception class
export class SettingNotFoundException extends ResourceNotFoundException {
  constructor() { super('Regla del sistema no encontrada'); }
}