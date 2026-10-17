import { Injectable, PipeTransform } from "@nestjs/common";
import { InvalidIdException } from "../exceptions/invalid-id.exception";

/* Object validation pipe */
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!/^[a-f\d]{24}$/i.test(value)) throw new InvalidIdException();
    return value;
  }
}