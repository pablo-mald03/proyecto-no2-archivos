import { Injectable, PipeTransform } from "@nestjs/common";
import { InvalidIdException } from "../exceptions/invalid-id.exception";
import { OBJECT_ID_REGEX } from "../constants/regex/object-id";

/* Object validation pipe */
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!OBJECT_ID_REGEX.test(value)) throw new InvalidIdException();
    return value;
  }
}